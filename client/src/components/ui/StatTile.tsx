import type { ComponentType, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRightIcon } from "../Icons";

type Tone = "primary" | "accent" | "info" | "success" | "neutral";
const iconTones: Record<Tone, string> = {
  primary: "bg-surface-100 text-surface-700",
  accent: "bg-accent-100 text-accent-900",
  info: "bg-info-50 text-info-700",
  success: "bg-success-50 text-success-700",
  neutral: "bg-surface-100 text-surface-600",
};

interface StatTileProps {
  icon: ComponentType<{ size?: number | string; className?: string }>;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: Tone;
  to?: string;
  className?: string;
  highlight?: boolean;
}

export function StatTile({ icon: Icon, label, value, hint, tone = "primary", to, className = "", highlight = false }: StatTileProps) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-1">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${highlight ? "bg-white/10 text-accent-400" : iconTones[tone]}`}>
          <Icon size={16} />
        </span>
        {to && <ArrowUpRightIcon size={15} className={highlight ? "text-primary-300" : "text-surface-500"} />}
      </div>
      <p className={`display-number mt-3 text-[1.75rem] leading-none sm:text-[2rem] ${highlight ? "text-white" : "text-surface-950"}`}>{value}</p>
      <p className={`mt-2 text-[13px] font-semibold leading-snug sm:text-[14px] ${highlight ? "text-white" : "text-surface-800"}`}>{label}</p>
      {hint && <p className={`mt-1 text-[13px] leading-snug ${highlight ? "text-primary-200" : "text-surface-500"}`}>{hint}</p>}
    </>
  );
  const classes = `block min-w-0 rounded-xl border p-3 sm:p-4 ${highlight ? "border-primary-950 bg-primary-950" : "border-surface-200 bg-white"} ${className}`;
  return to ? <Link to={to} className={`${classes} transition-colors hover:border-surface-500`}>{content}</Link> : <div className={classes}>{content}</div>;
}
