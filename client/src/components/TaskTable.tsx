import { Link } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { ArrowRightIcon, ClipboardIcon, MapPinIcon, NavigationIcon } from "./Icons";
import { formatRelativeTime } from "../utils/time";
import { visitPlanLabel, visitPriceLabel } from "../content/visitPlans";
import { EvidenceImage } from "./EvidenceImage";
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

function visitReference(task: Task): string {
  return `#${task.id.slice(-5).toUpperCase()}`;
}

function formatDistance(km: number): string {
  if (km < 0.05) return "At your location";
  if (km < 1) return `${Math.round(km * 1000)} m away`;
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
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-surface-300 bg-white/60 px-5 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-100 text-surface-600">
          <ClipboardIcon size={22} />
        </div>
        <div className="space-y-1">
          <p className="text-[15px] font-bold text-surface-900">{emptyMessage}</p>
          <p className="mx-auto max-w-xs text-[13px] leading-relaxed text-surface-500">
            {emptyDescription}
          </p>
        </div>
        {emptyAction && (
          <Link
            to={emptyAction.to}
            className="mt-0.5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent-400 px-4 text-[13px] font-bold text-primary-950 transition-colors hover:bg-accent-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2 active:bg-accent-500"
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
      {tasks.map((task) => {
        const proofReady = task.status === "SUBMITTED";
        const price = visitPriceLabel(task.visitPlan, task.quotedPricePaise);
        const plan = visitPlanLabel(task.visitPlan);
        const people = [
          showAcceptedBy && task.acceptedBy
            ? `By ${task.acceptedBy.name}`
            : null,
          showCreatedBy && task.createdBy ? `By ${task.createdBy.name}` : null,
        ].filter(Boolean);
        const timeCopy =
          task.status === "OPEN"
            ? `Requested ${formatRelativeTime(task.createdAt)}`
            : `Updated ${formatRelativeTime(task.updatedAt)}`;

        return (
          <Link
            key={task.id}
            to={`${basePath}/${task.id}`}
            className={`group block rounded-2xl border bg-white p-3.5 transition-[border-color,box-shadow] hover:border-surface-300 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2 active:bg-surface-50 ${
              proofReady
                ? "border-accent-200 bg-accent-50/40"
                : "border-surface-200"
            }`}
          >
            <div className="flex min-w-0 items-start gap-3">
              {task.evidenceImage ? (
                <span className="relative flex h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-surface-200 bg-surface-100">
                  <EvidenceImage
                    taskId={task.id}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </span>
              ) : (
                <span
                  className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ${
                    proofReady
                      ? "bg-accent-200 text-accent-900"
                      : "bg-surface-100 text-surface-600"
                  }`}
                >
                  <MapPinIcon size={21} />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 break-words text-[14.5px] font-bold leading-snug text-surface-950 transition-colors group-hover:text-primary-800">
                  {task.title}
                </p>

                {people.length > 0 && (
                  <p className="mt-1 truncate text-[12.5px] font-medium text-surface-500">
                    {people.join(", ")}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <StatusBadge status={task.status} />
                  {typeof task.distanceKm === "number" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-1 text-[11.5px] font-bold text-primary-800">
                      <NavigationIcon size={10} />
                      {formatDistance(task.distanceKm)}
                    </span>
                  )}
                  {price && (
                    <span className="inline-flex items-center rounded-full bg-surface-100 px-2 py-1 text-[11.5px] font-bold tabular-nums text-surface-800">
                      {price} quote
                    </span>
                  )}
                  {!price && plan && (
                    <span className="inline-flex items-center rounded-full bg-surface-100 px-2 py-1 text-[11.5px] font-semibold text-surface-600">
                      {plan}
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-[11.5px] font-medium text-surface-400">
                  {timeCopy} ({visitReference(task)})
                </p>
              </div>

              <ArrowRightIcon
                size={16}
                className="mt-1 flex-shrink-0 text-surface-300 transition-colors group-hover:text-primary-700"
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
