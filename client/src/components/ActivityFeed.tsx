import { Link } from "react-router-dom";
import type { Task, TaskStatus } from "../types";
import { formatRelativeTime } from "../utils/time";
import {
  ArrowRightIcon,
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  NavigationIcon,
  UserIcon,
} from "./Icons";

interface ActivityFeedProps {
  tasks: Task[];
  basePath: string;
  limit?: number;
}

const EVENT_COPY: Record<
  TaskStatus,
  { label: string; tone: string; icon: typeof ClockIcon }
> = {
  OPEN: {
    label: "Request sent. Finding an inspector.",
    tone: "bg-surface-100 text-surface-500",
    icon: ClockIcon,
  },
  ACCEPTED: {
    label: "An inspector accepted this visit",
    tone: "bg-info-50 text-info-600",
    icon: UserIcon,
  },
  IN_PROGRESS: {
    label: "Inspector is on the way",
    tone: "bg-warning-50 text-warning-600",
    icon: NavigationIcon,
  },
  SUBMITTED: {
    label: "Proof photo is ready to review",
    tone: "bg-accent-50 text-accent-700",
    icon: CameraIcon,
  },
  COMPLETED: {
    label: "Visit completed and closed",
    tone: "bg-success-50 text-success-600",
    icon: CheckCircleIcon,
  },
};

/** A compact, human-readable timeline derived from visit state. */
export function ActivityFeed({ tasks, basePath, limit = 4 }: ActivityFeedProps) {
  const recent = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, limit);

  if (recent.length === 0) {
    return (
      <p className="rounded-xl bg-surface-50 px-3.5 py-3 text-[14px] leading-relaxed text-surface-500">
        Your visit updates will appear here as soon as you book your first check.
      </p>
    );
  }

  return (
    <ol className="space-y-0">
      {recent.map((task, index) => {
        const event = EVENT_COPY[task.status];
        const Icon = event.icon;
        const isLast = index === recent.length - 1;

        return (
          <li key={task.id} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLast && (
              <span
                className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-surface-200"
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${event.tone}`}
            >
              <Icon size={14} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <Link
                to={`${basePath}/${task.id}`}
                className="group block"
              >
                <p className="truncate text-[14px] font-bold text-surface-900 transition-colors group-hover:text-primary-800">
                  {task.title}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-surface-500">
                  {event.label}
                </p>
              </Link>
              <p className="mt-1 text-[13px] font-semibold text-surface-400">
                {formatRelativeTime(task.updatedAt)}
              </p>
            </div>
            <Link
              to={`${basePath}/${task.id}`}
              className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-surface-300 transition-colors hover:bg-surface-100 hover:text-primary-700"
              aria-label={`Open ${task.title}`}
            >
              <ArrowRightIcon size={14} />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
