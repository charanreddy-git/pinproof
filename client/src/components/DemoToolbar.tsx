import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts";
import { useToast } from "./ui";
import { RefreshCwIcon, UserIcon, CompassIcon } from "./Icons";
import type { Role } from "../types";

const AUTH_PATHS = ["/login", "/register", "/verify/signup", "/captain/signup"];

function errorMessage(error: unknown, fallback: string): string {
  const message = (
    error as { response?: { data?: { message?: string } } }
  ).response?.data?.message;
  return message || fallback;
}

const ROLE_LABEL: Record<Role, string> = {
  USER: "Requester",
  CAPTAIN: "Inspector",
};

const ROLE_DEST: Record<Role, string> = {
  USER: "/user",
  CAPTAIN: "/captain/dashboard",
};

export function DemoToolbar() {
  const { authMode, user, demoLogin, resetDemo } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<"USER" | "CAPTAIN" | "reset" | null>(null);

  if (authMode !== "demo") return null;
  if (location.pathname.endsWith("/upload")) return null;
  if (AUTH_PATHS.includes(location.pathname)) return null;

  const switchRole = async (role: Role) => {
    if (user?.role === role) {
      navigate(ROLE_DEST[role]);
      setOpen(false);
      return;
    }

    setBusy(role);
    try {
      const result = await demoLogin(role);
      queryClient.clear();
      navigate(ROLE_DEST[result.user.role]);
      addToast("success", `Now exploring as the ${ROLE_LABEL[role].toLowerCase()}`);
      setOpen(false);
    } catch (error) {
      addToast("error", errorMessage(error, "Could not switch demo identity."));
    } finally {
      setBusy(null);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      "Reset the demo? This clears the current demo visits and restores four prepared ones."
    );
    if (!confirmed) return;

    setBusy("reset");
    try {
      const result = await resetDemo();
      queryClient.clear();
      addToast("success", `Fresh demo ready — ${result.tasks} visits restored.`);
      const destination = ROLE_DEST[user?.role ?? "USER"];
      setOpen(false);
      navigate(destination, { replace: true });
      // A full refresh guarantees no stale task from the previous demo state.
      window.setTimeout(() => window.location.assign(destination), 250);
    } catch (error) {
      addToast("error", errorMessage(error, "Could not reset the demo data."));
      setBusy(null);
    }
  };

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.25rem)] left-3 z-[90] sm:bottom-4 sm:left-4">
      {open ? (
        <div className="w-[calc(100vw-1.5rem)] max-w-[300px] overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-elevated animate-scale-in">
          <div className="flex items-center justify-between gap-3 bg-primary-900 px-3.5 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-400" aria-hidden="true" />
              <span className="text-[12px] font-bold">Demo controls</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-primary-100 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Collapse demo toolbar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-3.5">
            <p className="text-[12px] leading-relaxed text-surface-600">
              {user
                ? `You’re signed in as ${user.name}. Switch sides or start fresh.`
                : "Pick a side, or restore the prepared visits."}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["USER", "CAPTAIN"] as const).map((role) => {
                const active = user?.role === role;
                const Icon = role === "USER" ? UserIcon : CompassIcon;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => void switchRole(role)}
                    disabled={busy !== null}
                    aria-label={
                      active
                        ? `Open ${ROLE_LABEL[role].toLowerCase()} dashboard`
                        : `Switch to ${ROLE_LABEL[role].toLowerCase()} demo`
                    }
                    aria-pressed={active}
                    className={`flex min-h-13 flex-col items-start gap-1 rounded-xl border px-2.5 py-2 text-left transition-colors disabled:opacity-50 ${
                      active
                        ? "border-primary-300 bg-primary-50 text-primary-900"
                        : "border-surface-200 text-surface-700 hover:border-surface-300 hover:bg-surface-50"
                    }`}
                  >
                    <Icon size={16} className={active ? "text-primary-700" : "text-surface-500"} />
                    <span className="text-[11.5px] font-bold">
                      {busy === role ? "Opening…" : ROLE_LABEL[role]}
                    </span>
                    <span className="text-[10px] font-medium text-surface-500">
                      {active ? "You are here" : "Switch"}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => void handleReset()}
              disabled={busy !== null}
              className="mt-2 flex min-h-11 w-full items-center justify-between rounded-xl bg-surface-100 px-3 text-left text-[11.5px] font-bold text-surface-700 transition-colors hover:bg-surface-200 disabled:opacity-50"
            >
              <span>{busy === "reset" ? "Restoring visits…" : "Reset demo visits"}</span>
              <RefreshCwIcon size={14} className={busy === "reset" ? "animate-spin-slow" : ""} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-11 items-center gap-2 rounded-full border border-surface-200 bg-primary-900 px-4 text-white shadow-elevated transition-transform hover:-translate-y-0.5"
          aria-label="Open demo testing toolbar"
          aria-expanded={false}
        >
          <span className="h-2 w-2 rounded-full bg-accent-400" aria-hidden="true" />
          <span className="text-[11.5px] font-bold">Demo</span>
          <svg className="h-3.5 w-3.5 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}
