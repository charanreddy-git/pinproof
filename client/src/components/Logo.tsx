import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "accent" | "inverse";
  label?: string;
  to?: string;
}

const sizeConfig = {
  sm: { box: "h-9 w-9", text: "text-[1.05rem]", tag: "text-[10px]" },
  md: { box: "h-11 w-11", text: "text-[1.28rem]", tag: "text-[10.5px]" },
  lg: { box: "h-14 w-14", text: "text-[1.6rem]", tag: "text-[11.5px]" },
};

function Mark({
  size = "md",
  variant = "primary",
}: Omit<LogoProps, "label" | "to">) {
  const s = sizeConfig[size];
  const isInverse = variant === "inverse";
  const frame = isInverse ? "var(--color-white)" : "var(--color-primary-950)";

  return (
    <span
      className={`${s.box} flex flex-shrink-0 items-center justify-center`}
      aria-hidden="true"
    >
      {/* Vector refinement of logo.png; keep geometry aligned with favicon.svg. */}
      <svg viewBox="0 0 48 48" fill="none" className="h-full w-full" focusable="false">
        <path
          d="M12 6H28a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H14a4 4 0 0 0-4 4v16a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4V20a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v16a10 10 0 0 1-10 10H12A10 10 0 0 1 2 36V16A10 10 0 0 1 12 6Z"
          fill={frame}
        />
        <rect x="34" y="2" width="12" height="12" rx="2.5" fill="var(--color-accent-400)" />
      </svg>
    </span>
  );
}

export function Logo({
  size = "md",
  variant = "primary",
  label = "PinProof",
  to = "/",
}: LogoProps) {
  const s = sizeConfig[size];
  const isInverse = variant === "inverse";

  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-2.5 rounded-2xl py-1 pr-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-400/40 focus-visible:ring-offset-2 ${
        isInverse ? "focus-visible:ring-offset-primary-950" : "focus-visible:ring-offset-surface-50"
      }`}
      aria-label={`${label} home`}
    >
      <Mark size={size} variant={variant} />
      <span className="flex flex-col">
        <span
          className={`${s.text} font-extrabold leading-none tracking-[-0.04em] ${
            isInverse ? "text-white" : "text-surface-950"
          }`}
        >
          {label}
        </span>
        <span
          className={`mt-1 font-semibold leading-none ${s.tag} ${
            isInverse ? "text-accent-300" : "text-primary-600"
          }`}
        >
          Property visits, verified
        </span>
      </span>
    </Link>
  );
}

/** Non-interactive version for loading states, headers, and mobile chrome. */
export function LogoMark({
  size = "md",
  variant = "primary",
}: Omit<LogoProps, "label" | "to">) {
  return <Mark size={size} variant={variant} />;
}
