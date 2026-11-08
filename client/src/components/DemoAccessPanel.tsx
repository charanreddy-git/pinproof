import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts";
import { useToast } from "./ui";
import { ArrowRightIcon, CompassIcon, UserIcon } from "./Icons";
import type { Role } from "../types";

interface DemoAccessPanelProps {
  returnTo?: string | null;
}

const ROLE_COPY: Record<
  Role,
  {
    label: string;
    name: string;
    description: string;
    icon: typeof UserIcon;
    tint: string;
  }
> = {
  USER: {
    label: "Requester",
    name: "Demo Requester",
    description: "Book visits and review the proof",
    icon: UserIcon,
    tint: "bg-primary-50 text-primary-700",
  },
  CAPTAIN: {
    label: "Inspector",
    name: "Demo Inspector",
    description: "Accept visits and submit photos",
    icon: CompassIcon,
    tint: "bg-accent-50 text-accent-700",
  },
};

function errorMessage(error: unknown): string {
  const message = (
    error as { response?: { data?: { message?: string } } }
  ).response?.data?.message;
  return message || "Could not start the demo session.";
}

export function DemoAccessPanel({ returnTo }: DemoAccessPanelProps) {
  const { authMode, demoAccounts, demoLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState<Role | null>(null);

  if (authMode !== "demo") return null;

  const handleDemoLogin = async (role: Role) => {
    setLoadingRole(role);
    try {
      const result = await demoLogin(role);
      addToast("success", `Signed in as ${ROLE_COPY[role].label.toLowerCase()}`);
      const defaultDest = result.user.role === "CAPTAIN" ? "/captain/dashboard" : "/user";
      navigate(returnTo || defaultDest, { replace: true });
    } catch (error) {
      addToast("error", errorMessage(error));
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-accent-200 bg-accent-50/80 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent-200 text-accent-800">
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7Z" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold text-surface-900">Try the demo</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-surface-600">
            One tap to enter as either side of a visit. No OTP needed here.
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2">
        {(["USER", "CAPTAIN"] as const).map((role) => {
          const copy = ROLE_COPY[role];
          const account = demoAccounts.find((item) => item.role === role);
          const isLoading = loadingRole === role;
          const Icon = copy.icon;

          return (
            <button
              key={role}
              type="button"
              onClick={() => void handleDemoLogin(role)}
              disabled={loadingRole !== null}
              className="group flex min-h-14 w-full min-w-0 max-w-full items-center gap-3 rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-left shadow-sm transition-colors hover:border-primary-300 hover:shadow-card disabled:cursor-wait disabled:opacity-60"
            >
              <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${copy.tint}`}>
                <Icon size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold text-surface-900">
                  Continue as {copy.label}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-surface-500">
                  {account ? `${account.name} · ${copy.description}` : copy.description}
                </span>
              </span>
              <ArrowRightIcon
                size={16}
                className={`flex-shrink-0 text-surface-400 transition-transform ${
                  isLoading ? "animate-pulse" : "group-hover:translate-x-0.5 group-hover:text-primary-700"
                }`}
              />
            </button>
          );
        })}
      </div>

      <p className="mt-2.5 text-[10.5px] font-medium text-accent-800/80">
        Shared demo accounts. Visits may be reset by other visitors.
      </p>
    </div>
  );
}
