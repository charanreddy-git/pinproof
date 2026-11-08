import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "./Icons";

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  backTo?: string;
  backLabel?: string;
  meta?: ReactNode;
  className?: string;
}

/**
 * One header rhythm for dashboard pages: optional back link, a scannable
 * eyebrow, the page promise, and the primary action in a predictable spot.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  backTo,
  backLabel = "Back",
  meta,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={className}>
      {(backTo || meta) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {backTo ? (
            <Link
              to={backTo}
              className="-ml-2 inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-[14px] font-semibold text-surface-600 transition-colors hover:bg-white hover:text-surface-950"
            >
              <ChevronLeftIcon size={15} />
              {backLabel}
            </Link>
          ) : (
            <span />
          )}
          {meta}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[13px] font-semibold text-surface-500">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1.5 text-[1.75rem] leading-tight tracking-[-0.025em] text-surface-950 sm:text-[2rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-surface-600">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
