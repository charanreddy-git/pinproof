import type { ComponentType, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "../Icons";

interface EmptyStateProps {
  icon: ComponentType<{ size?: number | string; className?: string }>;
  title: string;
  description: string;
  action?: { label: string; to: string };
  secondaryAction?: { label: string; to: string };
  children?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  children,
  compact = false,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-300 bg-white/70 text-center ${
        compact ? "gap-3 px-5 py-8" : "gap-4 px-5 py-12"
      } ${className}`}
    >
      <div
        className={`flex items-center justify-center rounded-2xl bg-primary-50 text-primary-700 ${
          compact ? "h-11 w-11" : "h-14 w-14"
        }`}
      >
        <Icon size={compact ? 20 : 24} />
      </div>
      <div className="space-y-1">
        <p className="text-[16px] font-bold text-surface-900">{title}</p>
        <p className="mx-auto max-w-xs text-[13px] leading-relaxed text-surface-500">
          {description}
        </p>
      </div>
      {children}
      {(action || secondaryAction) && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {action && (
            <Link
              to={action.to}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary-800 px-4 text-[13px] font-bold text-white transition-colors hover:bg-primary-900"
            >
              {action.label}
              <ArrowRightIcon size={14} />
            </Link>
          )}
          {secondaryAction && (
            <Link
              to={secondaryAction.to}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-[13px] font-bold text-primary-700 transition-colors hover:bg-primary-50"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
