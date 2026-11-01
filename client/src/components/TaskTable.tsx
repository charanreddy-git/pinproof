import { Link } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { ArrowRightIcon, ClipboardIcon, MapPinIcon } from "./Icons";
import type { Task } from "../types";

interface TaskTableProps {
  tasks: Task[];
  basePath: string;
  showCreatedBy?: boolean;
  showAcceptedBy?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; to: string };
}

function formatTaskTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"}`;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

function visitReference(task: Task): string {
  return `#${task.id.slice(-5).toUpperCase()}`;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.max(1, Math.round(km * 1000))} m away`;
  return `${km.toFixed(1)} km away`;
}

export function TaskTable({
  tasks,
  basePath,
  showCreatedBy = false,
  showAcceptedBy = false,
  emptyMessage = "No visits yet",
  emptyDescription = "New visit requests will appear here.",
  emptyAction,
}: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-surface-300 bg-white/60 px-5 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
          <ClipboardIcon size={24} className="text-primary-600" />
        </div>
        <div className="space-y-1">
          <p className="text-[16px] font-bold text-surface-900">{emptyMessage}</p>
          <p className="mx-auto max-w-xs text-[12.5px] leading-relaxed text-surface-500">
            {emptyDescription}
          </p>
        </div>
        {emptyAction && (
          <Link
            to={emptyAction.to}
            className="mt-1 inline-flex h-11 items-center gap-2 rounded-xl bg-primary-800 px-4 text-[12.5px] font-bold text-white transition-colors hover:bg-primary-900"
          >
            {emptyAction.label}
            <ArrowRightIcon size={14} />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {tasks.map((task) => (
        <Link
          key={task.id}
          to={`${basePath}/${task.id}`}
          className="group flex min-w-0 items-center gap-3 rounded-2xl border border-surface-200 bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card sm:gap-4 sm:p-4"
        >
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
            <MapPinIcon size={19} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="line-clamp-2 min-w-0 max-w-full break-words text-[13.5px] font-bold leading-snug text-surface-950 transition-colors group-hover:text-primary-800 sm:text-[14.5px]">
                {task.title}
              </p>
              <span className="hidden rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-semibold text-surface-500 md:inline">
                {visitReference(task)}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] font-medium text-surface-500">
              {showAcceptedBy && task.acceptedBy && (
                <span className="truncate">Inspector {task.acceptedBy.name}</span>
              )}
              {showCreatedBy && task.createdBy && (
                <span className="truncate">By {task.createdBy.name}</span>
              )}
              {((showAcceptedBy && !!task.acceptedBy) ||
                (showCreatedBy && !!task.createdBy)) && (
                <span className="text-surface-300" aria-hidden="true">·</span>
              )}
              <span>{formatTaskTime(task.createdAt)}</span>
              {typeof task.distanceKm === "number" && (
                <>
                  <span className="text-surface-300" aria-hidden="true">·</span>
                  <span>{formatDistance(task.distanceKm)}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <StatusBadge status={task.status} />
            <ArrowRightIcon
              size={16}
              className="hidden flex-shrink-0 text-surface-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary-700 sm:block"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
