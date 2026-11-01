import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts";
import { Button, DemoAccessPanel, Input, useToast } from "../../components";
import { CompassIcon, HomeIcon } from "../../components/Icons";
import type { Role } from "../../types";
import { formatPhone, normalizePhoneInput } from "../../utils/phone";

interface RegisterPageProps {
  forcedRole?: Role;
}

type Step = "details" | "code" | "name";

interface SignupHandoffState {
  pendingPhone?: unknown;
  pendingCode?: unknown;
}

function readHandoff(state: unknown): { phone: string; code: string } | null {
  if (!state || typeof state !== "object") return null;

  const candidate = state as SignupHandoffState;
  if (
    typeof candidate.pendingPhone !== "string" ||
    typeof candidate.pendingCode !== "string" ||
    !/^\d{6}$/.test(candidate.pendingCode)
  ) {
    return null;
  }

  try {
    return {
      phone: normalizePhoneInput(candidate.pendingPhone),
      code: candidate.pendingCode,
    };
  } catch {
    return null;
  }
}

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

function ErrorNotice({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-danger-200 bg-danger-50 px-3.5 py-3 text-[13.5px] font-medium text-danger-700"
    >
      {message}
    </div>
  );
}

function RolePicker({
  role,
  onChange,
}: {
  role: Role;
  onChange: (role: Role) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[13.5px] font-bold text-surface-700">
        How will you use PinProof?
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange("USER")}
          aria-pressed={role === "USER"}
          className={`flex min-h-16 items-start gap-2.5 rounded-xl border-2 p-3 text-left transition-colors ${
            role === "USER"
              ? "border-primary-500 bg-primary-50"
              : "border-surface-200 hover:border-surface-300"
          }`}
        >
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-primary-700">
            <HomeIcon size={16} />
          </span>
          <span>
            <span className="block text-[14px] font-bold text-surface-900">
              Check a property
            </span>
            <span className="mt-0.5 block text-[12.5px] leading-snug text-surface-500">
              For owners, buyers, and NRIs
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => onChange("CAPTAIN")}
          aria-pressed={role === "CAPTAIN"}
          className={`flex min-h-16 items-start gap-2.5 rounded-xl border-2 p-3 text-left transition-colors ${
            role === "CAPTAIN"
              ? "border-accent-400 bg-accent-50"
              : "border-surface-200 hover:border-surface-300"
          }`}
        >
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-accent-700">
            <CompassIcon size={16} />
          </span>
          <span>
            <span className="block text-[14px] font-bold text-surface-900">
              Inspect properties
            </span>
            <span className="mt-0.5 block text-[12.5px] leading-snug text-surface-500">
              Earn per completed visit
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}

export function RegisterPage({ forcedRole }: RegisterPageProps = {}) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const roleParam = searchParams.get("role");
  const normalizedRoleParam = roleParam?.toUpperCase();
  const initialRole: Role =
    forcedRole ??
    (normalizedRoleParam === "CAPTAIN" ? "CAPTAIN" : "USER");
  const handoff = readHandoff(location.state);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState(
    handoff ? formatPhone(handoff.phone) : "+91 "
  );
  const [role, setRole] = useState<Role>(initialRole);
  const [step, setStep] = useState<Step>(handoff ? "name" : "details");
  const [roleOnNameStep, setRoleOnNameStep] = useState(
    Boolean(handoff) && !forcedRole && !normalizedRoleParam
  );
  const [code, setCode] = useState(handoff?.code ?? "");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { requestOtp, verifyOtp, authMode } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const returnTo = safeReturnTo(
    new URLSearchParams(location.search).get("returnTo")
  );
  const showRolePicker = !forcedRole && !normalizedRoleParam;
  const isInspector = role === "CAPTAIN";

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => {
      setResendIn((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const sendCode = async () => {
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
      setRoleOnNameStep(false);
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

  const handleDetailsSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendCode();
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
      const result = await verifyOtp(phone, code, { role });

      if ("requiresProfile" in result) {
        setStep("name");
        return;
      }

      addToast("success", "Welcome back");
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

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError(
        isInspector
          ? "Enter your name so requesters know who’s visiting."
          : "Enter your name so your visit updates are addressed to you."
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOtp(phone, code, {
        name: name.trim(),
        role,
      });

      if ("requiresProfile" in result) {
        setError("Could not create your account. Enter your name to continue.");
        return;
      }

      addToast(
        "success",
        result.isNew ? "Account created successfully" : "Welcome back"
      );
      const defaultDest =
        result.user.role === "CAPTAIN" ? "/captain/dashboard" : "/user";
      navigate(returnTo || defaultDest, { replace: true });
    } catch (err) {
      setError(
        errorMessage(err, "Could not create your account. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const changeDetails = () => {
    setStep("details");
    setCode("");
    setName("");
    setRoleOnNameStep(false);
    setDevOtp(null);
    setResendIn(0);
    setError("");
  };

  const heading =
    step === "details"
      ? isInspector
        ? "Start earning nearby"
        : "Book your first visit"
      : step === "code"
        ? "Verify your number"
        : "What should we call you?";

  const description =
    step === "details"
      ? isInspector
        ? "Find property visits in your area and get paid for each completed check."
        : "Pin a property, follow the visit, and get photo proof in one place."
      : step === "code"
        ? `We sent a 6-digit code to ${formatPhone(phone)}.`
        : isInspector
          ? "Your number is verified. Add your name so requesters know who’s visiting."
          : "Your number is verified. Add your name so your report and visit updates are addressed to you.";

  const signinSuffix = returnTo
    ? `?returnTo=${encodeURIComponent(returnTo)}`
    : "";

  return (
    <div>
      <DemoAccessPanel returnTo={returnTo} />

      <div>
        <p className="text-[12px] font-bold text-primary-700">
          {step === "name"
            ? "One last step"
            : isInspector
              ? "Inspector sign up"
              : "Create your account"}
        </p>
        <h1 className="mt-1.5 text-[2rem] font-extrabold leading-tight tracking-[-0.035em] text-surface-950">
          {heading}
        </h1>
      </div>

      <p className="mt-2 text-[14px] leading-relaxed text-surface-600">
        {description}
      </p>

      {step === "details" ? (
        <form onSubmit={handleDetailsSubmit} className="mt-5 space-y-4">
          {error && <ErrorNotice message={error} />}

          {showRolePicker && <RolePicker role={role} onChange={setRole} />}

          <Input
            label="Mobile number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            required
            autoComplete="tel"
            inputMode="tel"
            helperText={
              isInspector
                ? "We’ll verify this number and use it for visit updates."
                : "We’ll verify this number and text you visit updates."
            }
            id="register-phone"
            autoFocus
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            {isInspector ? "Continue as inspector" : "Continue"}
          </Button>

          <p className="text-center text-[12px] leading-relaxed text-surface-500">
            We’ll send a one-time code. No password needed.
          </p>
        </form>
      ) : step === "code" ? (
        <form onSubmit={handleVerify} className="mt-5 space-y-4">
          {error && <ErrorNotice message={error} />}

          {devOtp && (
            <div className="rounded-xl border border-dashed border-accent-300 bg-accent-50 px-3.5 py-3 text-surface-800">
              <p className="text-[12px] font-bold text-accent-800">Local test code</p>
              <p className="mt-1 text-lg font-extrabold tracking-[0.28em]">{devOtp}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-surface-500">
                Shown only because SMS is set to console. It is never returned in
                production.
              </p>
            </div>
          )}

          <Input
            label="6-digit code"
            type="text"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="000000"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]{6}"
            id="register-code"
            className="text-center text-xl font-bold tracking-[0.4em]"
            autoFocus
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
            disabled={code.length !== 6}
          >
            Verify code
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
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={changeDetails}
              disabled={isLoading}
            >
              Change my details
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleProfileSubmit} className="mt-5 space-y-4">
          {error && <ErrorNotice message={error} />}

          {roleOnNameStep && <RolePicker role={role} onChange={setRole} />}

          <Input
            label="Full name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ananya Sharma"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            helperText="This is the name shown on your account and visit updates."
            id="register-name"
            autoFocus
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            {isInspector ? "Create inspector account" : "Create account"}
          </Button>

          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep("code");
                setError("");
              }}
              disabled={isLoading}
            >
              Back to code
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={changeDetails}
              disabled={isLoading}
            >
              Use a different number
            </Button>
          </div>
        </form>
      )}

      {authMode !== "demo" && (
        <p className="mt-6 border-t border-surface-200 pt-5 text-center text-[13px] font-medium text-surface-500">
          Already have an account?{" "}
          <Link
            to={`/login${signinSuffix}`}
            className="inline-flex min-h-11 items-center px-1 font-bold text-primary-700 hover:text-primary-800"
          >
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
