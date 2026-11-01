import { prisma } from "../lib";
import {
  signToken,
  ApiError,
  normalizePhone,
  generateOtp,
  hashOtp,
  otpMatches,
  logger,
  OTP_TTL_SECONDS,
  OTP_RESEND_SECONDS,
  OTP_MAX_SENDS_PER_HOUR,
  OTP_MAX_ATTEMPTS,
} from "../utils";
import type { RequestOtpInput, VerifyOtpInput } from "../validators";
import { sendOtpSms } from "./sms.service";

const userSelect = {
  id: true,
  name: true,
  phone: true,
  phoneVerifiedAt: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

function showDevOtp(): boolean {
  const provider =
    process.env.SMS_PROVIDER?.toLowerCase() ||
    (process.env.NODE_ENV === "production" ? "" : "console");
  return process.env.NODE_ENV !== "production" && provider === "console";
}

export class AuthService {
  /**
   * Send a one-time code. The same endpoint handles login and signup so it
   * never reveals whether a phone number is already registered.
   */
  static async requestOtp(input: RequestOtpInput) {
    const phone = normalizePhone(input.phone);
    const now = new Date();
    const existing = await prisma.phoneOtp.findUnique({ where: { phone } });

    let sendCount = 1;
    let windowStartedAt = now;

    if (existing) {
      const elapsedMs = now.getTime() - existing.lastSentAt.getTime();
      if (elapsedMs < OTP_RESEND_SECONDS * 1000) {
        const retryAfter = Math.ceil(
          (OTP_RESEND_SECONDS * 1000 - elapsedMs) / 1000
        );
        throw ApiError.tooManyRequests(
          `Please wait ${retryAfter}s before requesting another code.`
        );
      }

      sendCount = existing.sendCount;
      windowStartedAt = existing.windowStartedAt;

      if (now.getTime() - windowStartedAt.getTime() >= 60 * 60 * 1000) {
        sendCount = 0;
        windowStartedAt = now;
      }

      if (sendCount >= OTP_MAX_SENDS_PER_HOUR) {
        throw ApiError.tooManyRequests(
          "Too many codes requested for this number. Try again in an hour."
        );
      }
      sendCount += 1;
    }

    const code = generateOtp();
    const expiresAt = new Date(now.getTime() + OTP_TTL_SECONDS * 1000);
    const codeHash = hashOtp(phone, code);

    if (existing) {
      await prisma.phoneOtp.update({
        where: { phone },
        data: {
          codeHash,
          expiresAt,
          attempts: 0,
          sendCount,
          windowStartedAt,
          lastSentAt: now,
        },
      });
    } else {
      await prisma.phoneOtp.create({
        data: {
          phone,
          codeHash,
          expiresAt,
          sendCount,
          windowStartedAt,
          lastSentAt: now,
        },
      });
    }

    try {
      await sendOtpSms(phone, code);
    } catch (error) {
      logger.error(`Failed to send OTP to ${phone}`, error);
      throw new ApiError(
        502,
        "We could not send the code right now. Please try again in a moment."
      );
    }

    logger.info("OTP requested", { phone });

    return {
      expiresIn: OTP_TTL_SECONDS,
      resendAfter: OTP_RESEND_SECONDS,
      ...(showDevOtp() ? { devOtp: code } : {}),
    };
  }

  /**
   * Verify a code and issue a JWT. For a new phone number, the first pass
   * returns `requiresProfile` without consuming the code so the client can
   * collect a name. The account is created when the same code is submitted
   * again with the name and role.
   */
  static async verifyOtp(input: VerifyOtpInput) {
    const phone = normalizePhone(input.phone);
    const now = new Date();
    const record = await prisma.phoneOtp.findUnique({ where: { phone } });

    if (!record) {
      throw ApiError.badRequest(
        "Request a new verification code for this number."
      );
    }

    if (record.expiresAt.getTime() <= now.getTime()) {
      throw ApiError.badRequest(
        "This code has expired. Request a new code to continue."
      );
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      throw ApiError.tooManyRequests(
        "Too many incorrect attempts. Request a new code."
      );
    }

    if (!otpMatches(phone, input.code, record.codeHash)) {
      const attempts = record.attempts + 1;
      await prisma.phoneOtp.update({
        where: { id: record.id },
        data: { attempts },
      });
      const remaining = OTP_MAX_ATTEMPTS - attempts;
      throw ApiError.unauthorized(
        remaining > 0
          ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} left.`
          : "Too many incorrect attempts. Request a new code."
      );
    }

    let user = await prisma.user.findUnique({
      where: { phone },
      select: userSelect,
    });
    let isNew = false;

    if (!user) {
      if (!input.name || !input.role) {
        // The code is valid, but this number has no account yet. Keep the
        // code unconsumed so the client can ask for a name and submit it
        // with the same code. Nothing is created until both are provided.
        logger.info("OTP verified; profile required", { phone });
        return { requiresProfile: true as const, phone };
      }

      user = await prisma.user.create({
        data: {
          name: input.name,
          phone,
          phoneVerifiedAt: now,
          role: input.role,
          captainProfile:
            input.role === "CAPTAIN" ? { create: {} } : undefined,
          requesterProfile:
            input.role === "USER" ? { create: {} } : undefined,
        },
        select: userSelect,
      });
      isNew = true;
    } else if (!user.phoneVerifiedAt) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerifiedAt: now },
        select: userSelect,
      });
    }

    // Delete only once so the same code cannot be replayed.
    const consumed = await prisma.phoneOtp.deleteMany({
      where: { id: record.id },
    });
    if (consumed.count === 0) {
      throw ApiError.unauthorized(
        "This code has already been used. Request a new code."
      );
    }

    const token = signToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    logger.info("OTP verified", { phone, isNew });

    return { user, token, isNew };
  }
}
