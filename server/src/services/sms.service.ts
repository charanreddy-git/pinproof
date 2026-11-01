import { logger } from "../utils";

const isProduction = process.env.NODE_ENV === "production";

function otpMessage(code: string): string {
  return `Your PinProof verification code is ${code}. It expires in 5 minutes. Never share this code with anyone.`;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for the configured SMS provider`);
  }
  return value;
}

async function sendWithTwilio(phone: string, code: string): Promise<void> {
  const accountSid = required("TWILIO_ACCOUNT_SID");
  const authToken = required("TWILIO_AUTH_TOKEN");
  const body = new URLSearchParams({
    To: phone,
    Body: otpMessage(code),
  });

  const from = process.env.TWILIO_FROM_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  if (from) {
    body.set("From", from);
  } else if (messagingServiceSid) {
    body.set("MessagingServiceSid", messagingServiceSid);
  } else {
    throw new Error(
      "TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID is required"
    );
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      signal: AbortSignal.timeout(10000),
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Twilio rejected the SMS (${response.status}): ${detail}`);
  }
}

/**
 * Fast2SMS only accepts Indian 10-digit mobile numbers without the +91 prefix.
 * See: https://docs.fast2sms.com/reference/quick-sms-post
 */
function toFast2SmsNumber(phone: string): string {
  if (!/^\+91[6-9]\d{9}$/.test(phone)) {
    throw new Error("Fast2SMS only supports Indian mobile numbers (+91).");
  }
  return phone.slice(3);
}

type Fast2SmsPayload = {
  route: "q" | "dlt" | "dlt_manual";
  numbers: string;
  message: string | number;
  variables_values?: string;
  sender_id?: string;
  template_id?: string;
  entity_id?: string;
};

function buildFast2SmsPayload(
  phone: string,
  code: string
): Fast2SmsPayload {
  const route = (process.env.FAST2SMS_ROUTE?.trim().toLowerCase() ||
    "q") as Fast2SmsPayload["route"];
  const numbers = toFast2SmsNumber(phone);

  if (route === "q") {
    return {
      route,
      numbers,
      message: otpMessage(code),
    };
  }

  if (route === "dlt") {
    const messageId = required("FAST2SMS_MESSAGE_ID");
    if (!/^\d+$/.test(messageId)) {
      throw new Error("FAST2SMS_MESSAGE_ID must be a numeric DLT message ID");
    }

    return {
      route,
      numbers,
      sender_id: required("FAST2SMS_SENDER_ID"),
      message: messageId,
      variables_values: (process.env.FAST2SMS_VARIABLES_VALUES || "{code}")
        .replace(/\{code\}/g, code),
    };
  }

  if (route === "dlt_manual") {
    const template =
      process.env.FAST2SMS_MESSAGE_TEMPLATE || otpMessage("{code}");
    const message = template.replace(/\{code\}/g, code);

    return {
      route,
      numbers,
      sender_id: required("FAST2SMS_SENDER_ID"),
      message,
      ...(process.env.FAST2SMS_TEMPLATE_ID
        ? { template_id: process.env.FAST2SMS_TEMPLATE_ID }
        : {}),
      ...(process.env.FAST2SMS_ENTITY_ID
        ? { entity_id: process.env.FAST2SMS_ENTITY_ID }
        : {}),
    };
  }

  throw new Error(
    "FAST2SMS_ROUTE must be one of: q, dlt, dlt_manual"
  );
}

async function sendWithFast2Sms(phone: string, code: string): Promise<void> {
  const apiKey = required("FAST2SMS_API_KEY");
  const payload = buildFast2SmsPayload(phone, code);

  const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });

  const detail = await response.text();
  let result: { return?: boolean } = {};

  try {
    result = JSON.parse(detail) as { return?: boolean };
  } catch {
    // Keep the raw response for the error message below.
  }

  if (!response.ok || result.return !== true) {
    throw new Error(
      `Fast2SMS rejected the SMS (${response.status}): ${detail}`
    );
  }
}

async function sendWithWebhook(phone: string, code: string): Promise<void> {
  const url = required("SMS_WEBHOOK_URL");
  const token = process.env.SMS_WEBHOOK_TOKEN;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      phone,
      code,
      message: otpMessage(code),
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`SMS webhook rejected the request (${response.status}): ${detail}`);
  }
}

/**
 * Sends the one-time code through the configured provider.
 *
 * Providers:
 * - console (local development only — prints the code to the server log)
 * - fast2sms (Quick SMS by default; DLT and DLT Manual routes supported)
 * - twilio (Programmable SMS; India's domestic route requires DLT, the
 *   international route does not)
 * - webhook (POSTs { phone, code, message } to your MSG91/Gupshup/WhatsApp adapter)
 */
export async function sendOtpSms(phone: string, code: string): Promise<void> {
  const provider =
    process.env.SMS_PROVIDER?.toLowerCase() || (isProduction ? "" : "console");

  switch (provider) {
    case "console":
      if (isProduction) {
        throw new Error(
          "SMS_PROVIDER=console is not allowed in production. Configure Fast2SMS or a webhook."
        );
      }
      logger.info(`[DEV OTP] ${phone} -> ${code}`);
      return;
    case "fast2sms":
      await sendWithFast2Sms(phone, code);
      return;
    case "twilio":
      await sendWithTwilio(phone, code);
      return;
    case "webhook":
      await sendWithWebhook(phone, code);
      return;
    default:
      throw new Error(
        "No SMS provider configured. Set SMS_PROVIDER to fast2sms, twilio, or webhook in production."
      );
  }
}
