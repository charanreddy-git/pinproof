import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "accent" | "inverse";
  label?: string;
  to?: string;
}

const sizeConfig = {
  sm: { box: "h-9 w-9 rounded-xl", text: "text-[1.05rem]", tag: "text-[10px]" },
  md: { box: "h-11 w-11 rounded-2xl", text: "text-[1.28rem]", tag: "text-[10.5px]" },
  lg: { box: "h-14 w-14 rounded-2xl", text: "text-[1.6rem]", tag: "text-[11.5px]" },
};

function Mark({
  size = "md",
  variant = "primary",
}: Omit<LogoProps, "label" | "to">) {
  const s = sizeConfig[size];
  const isInverse = variant === "inverse";
  const isAccent = variant === "accent";

  const box = isInverse
    ? "bg-white"
    : isAccent
      ? "bg-accent-400"
      : "bg-primary-800";
  const pin = isInverse ? "#0f4a30" : isAccent ? "#0f4a30" : "#ffffff";
  const tick = isInverse ? "#d29500" : "#ffc400";

  return (
    <span
      className={`${s.box} ${box} flex flex-shrink-0 items-center justify-center shadow-sm`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" fill="none" className="h-[78%] w-[78%]">
        <path
          d="M24 5.5c-7.6 0-13.7 5.9-13.7 13.2 0 9.8 13.7 22.6 13.7 22.6s13.7-12.8 13.7-22.6C37.7 11.4 31.6 5.5 24 5.5Z"
          fill={pin}
        />
        <path
          d="m17.9 19.1 4.1 4.2 8.4-9"
          stroke={tick}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
