import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts";
import {
  Button,
  DemoAccessPanel,
  Input,
  OtpInput,
  useToast,
} from "../../components";
import { formatPhone, normalizePhoneInput } from "../../utils/phone";

type Step = "phone" | "code";

function safeReturnTo(value: string | null): string | null {
  return value?.startsWith("/") && !value.startsWith("//") ? value : null;
}

function errorMessage(error: unknown, fallback: string): string {
  const message = (
    error as { response?: { data?: { message?: string } } }
  ).response?.data?.message;
  if (message) return message;
  return error instanceof Error ? error.message : fallback;
}

export function LoginPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+91 ");
  const [code, setCode] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { requestOtp, verifyOtp, authMode, phoneSignInEnabled } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const returnTo = safeReturnTo(
    new URLSearchParams(location.search).get("returnTo")
  );
  const signupSuffix = returnTo
    ? `?returnTo=${encodeURIComponent(returnTo)}`
    : "";

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => {
      setResendIn((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const sendCode = async (e?: FormEvent) => {
    e?.preventDefault();
    setError("");

    let normalized: string;
    try {
      normalized = normalizePhoneInput(phone);
    } catch (err) {
      setError(errorMessage(err, "Enter a valid mobile number."));
      return;
    }

    setIsLoading(true);
    try {
      const result = await requestOtp(normalized);
      setPhone(normalized);
      setCode("");
      setStep("code");
      setDevOtp(result.devOtp ?? null);
      setResendIn(result.resendAfter);
      addToast("success", "Verification code sent");
    } catch (err) {
      setError(
        errorMessage(err, "Could not send the code. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOtp(phone, code);

      if ("requiresProfile" in result) {
        // The number is verified but has no account yet. Carry the code over
        // so the signup page can ask for a name without another SMS.
        navigate(`/register${signupSuffix}`, {
          replace: true,
          state: { pendingPhone: result.phone, pendingCode: code },
        });
        return;
      }

      addToast("success", "Signed in successfully");
      const defaultDest =
        result.user.role === "CAPTAIN" ? "/captain/dashboard" : "/user";
      navigate(returnTo || defaultDest, { replace: true });
    } catch (err) {
      setError(
        errorMessage(err, "Could not verify the code. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const changeNumber = () => {
    setStep("phone");
    setCode("");
    setDevOtp(null);
    setResendIn(0);
    setError("");
  };

  if (!phoneSignInEnabled) return <DemoAccessPanel returnTo={returnTo} />;

  return (
    <div>
      <DemoAccessPanel returnTo={returnTo} />

      <div>
        <p className="text-[14px] font-bold text-primary-700">
          {authMode === "demo" ? "Phone sign in" : "Welcome back"}
        </p>
        <h1 className="mt-1.5 text-[2rem] font-extrabold leading-tight tracking-[-0.035em] text-surface-950">
          {step === "phone" ? "Sign in to PinProof" : "Enter your code"}
        </h1>
      </div>

      <p className="mt-2 text-[13px] leading-relaxed text-surface-600">
        {step === "phone"
          ? "Use your mobile number. We’ll send a 6-digit code — no password to remember."
          : `We sent a code to ${formatPhone(phone)}. It expires in a few minutes.`}
      </p>

      {step === "phone" ? (
        <form onSubmit={sendCode} className="mt-5 space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-danger-200 bg-danger-50 px-3.5 py-3 text-[14px] font-medium text-danger-700"
            >
              {error}
            </div>
          )}

          <Input
            label="Mobile number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            required
            autoComplete="tel"
            inputMode="tel"
            helperText="Outside India? Add your country code."
            id="login-phone"
            autoFocus
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            Send code
          </Button>

          <p className="text-center text-[13px] leading-relaxed text-surface-500">
            By continuing, you agree to receive a one-time verification SMS.
            Standard message rates may apply.
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="mt-5 space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-danger-200 bg-danger-50 px-3.5 py-3 text-[14px] font-medium text-danger-700"
            >
              <p>{error}</p>
              {error.toLowerCase().includes("no account") && (
                <Link
                  to={`/register${signupSuffix}`}
                  className="mt-2 inline-flex min-h-11 items-center font-bold text-danger-700 underline underline-offset-4"
                >
                  Create an account
                </Link>
              )}
            </div>
          )}

          {devOtp && (
            <div className="rounded-xl border border-dashed border-accent-300 bg-accent-50 px-3.5 py-3 text-surface-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-bold text-accent-800">
                    Local test code
                  </p>
                  <p className="mt-1 text-[1.4rem] font-extrabold tracking-[0.28em] text-surface-950">
                    {devOtp}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCode(devOtp)}
                  className="inline-flex min-h-10 flex-shrink-0 items-center rounded-full bg-white px-3 text-[13px] font-bold text-accent-800 shadow-sm transition-colors hover:bg-accent-100"
                >
                  Use code
                </button>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-surface-500">
                Shown only because SMS is set to console. It is never returned in
                production.
              </p>
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label
                htmlFor="login-code-0"
                className="text-[14px] font-bold text-surface-700"
              >
                6-digit code
              </label>
              <button
                type="button"
                onClick={changeNumber}
                className="inline-flex min-h-9 items-center px-1 text-[13px] font-bold text-primary-700 transition-colors hover:text-primary-900"
              >
                Change number
              </button>
            </div>
            <OtpInput
              value={code}
              onChange={setCode}
              id="login-code"
              label="Sign-in verification code"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
            disabled={code.length !== 6}
          >
            Verify and continue
          </Button>

          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => void sendCode()}
              disabled={resendIn > 0 || isLoading}
            >
              {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
            </Button>
            <p className="text-center text-[13px] leading-relaxed text-surface-500">
              The code expires in a few minutes. Check your messages if it
              doesn’t arrive.
            </p>
          </div>
        </form>
      )}

      {authMode !== "demo" && (
        <div className="mt-6 border-t border-surface-200 pt-5">
          <p className="text-[14px] font-semibold text-surface-500">New to PinProof?</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <Link
              to={`/verify/signup${signupSuffix}`}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-surface-200 px-3 py-2.5 text-center text-[14px] font-bold text-surface-800 transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              Book a visit
            </Link>
            <Link
              to={`/captain/signup${signupSuffix}`}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-surface-200 px-3 py-2.5 text-center text-[14px] font-bold text-surface-800 transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              Earn as inspector
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
