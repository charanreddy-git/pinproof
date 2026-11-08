import type { TaskStatus } from "../types";
import { CheckIcon } from "./Icons";

const statusConfig: Record<
  TaskStatus,
  { label: string; shortLabel: string; classes: string; dot: string }
> = {
  OPEN: {
    label: "Waiting for inspector",
    shortLabel: "Waiting",
    classes: "border-surface-200 bg-surface-100 text-surface-600",
    dot: "bg-surface-400",
  },
  ACCEPTED: {
    label: "Inspector assigned",
    shortLabel: "Assigned",
    classes: "border-info-100 bg-info-50 text-info-700",
    dot: "bg-info-500",
  },
  IN_PROGRESS: {
    label: "On the way",
    shortLabel: "On the way",
    classes: "border-warning-100 bg-warning-50 text-warning-700",
    dot: "bg-warning-500",
  },
  SUBMITTED: {
    label: "Proof ready",
    shortLabel: "Proof ready",
    classes: "border-accent-200 bg-accent-50 text-accent-800",
    dot: "bg-accent-500",
  },
  COMPLETED: {
    label: "Completed",
    shortLabel: "Completed",
    classes: "border-success-100 bg-success-50 text-success-700",
    dot: "bg-success-500",
  },
};

interface StatusBadgeProps {
  status: TaskStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass =
    size === "md"
      ? "gap-2 px-3.5 py-2 text-[14px]"
      : "gap-1.5 px-2.5 py-1.5 text-[13px]";

  return (
    <span
      className={`
        inline-flex items-center whitespace-nowrap rounded-full border font-semibold
        ${config.classes}
        ${sizeClass}
      `}
    >
      {status === "COMPLETED" ? (
        <CheckIcon size={size === "md" ? 13 : 11} className="flex-shrink-0" />
      ) : (
        <span
          className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${config.dot} ${
            status === "IN_PROGRESS" ? "animate-pulse-soft" : ""
          }`}
        />
      )}
      <span className="sm:hidden">{config.shortLabel}</span>
      <span className="hidden sm:inline">{config.label}</span>
    </span>
  );
}
