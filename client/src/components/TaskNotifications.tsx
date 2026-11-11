import { useMenuKeyboard } from "../hooks/useMenuKeyboard";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Role, Task, TaskStatus } from "../types";
import { formatRelativeTime } from "../utils/time";
import {
  BellIcon,
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  NavigationIcon,
  UserIcon,
} from "./Icons";

interface TaskNotificationsProps {
  tasks: Task[];
  role: Role;
  userId: string;
}

const STATUS_COPY: Record<
  TaskStatus,
  { label: string; chip: string; icon: typeof ClockIcon }
> = {
  CANCELLED: { label: "Visit cancelled", chip: "bg-surface-100 text-surface-600", icon: ClockIcon },
  OPEN: {
    label: "Finding an inspector",
    chip: "bg-surface-100 text-surface-600",
    icon: ClockIcon,
  },
  ACCEPTED: {
    label: "Inspector assigned",
    chip: "bg-info-50 text-info-700",
    icon: UserIcon,
  },
  IN_PROGRESS: {
    label: "On the way",
    chip: "bg-warning-50 text-warning-700",
    icon: NavigationIcon,
  },
  SUBMITTED: {
    label: "Proof ready to review",
    chip: "bg-accent-50 text-accent-800",
    icon: CameraIcon,
  },
  COMPLETED: {
    label: "Visit completed",
    chip: "bg-success-50 text-success-700",
    icon: CheckCircleIcon,
  },
};

function seenKey(userId: string) {
  return `pinproof:activity-seen:${userId}`;
}

function readSeen(userId: string): number {
  try {
    return Number(localStorage.getItem(seenKey(userId))) || 0;
  } catch {
    return 0;
  }
}

/** Recent visit activity behind a bell, with a persisted unread dot. */
export function TaskNotifications({ tasks, role, userId }: TaskNotificationsProps) {
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState(() => readSeen(userId));
  const closeMenu = useCallback(() => setOpen(false), []);
  const { triggerRef, panelRef } = useMenuKeyboard(open, closeMenu);

  const recent = useMemo(
    () =>
      [...tasks]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 6),
    [tasks]
  );

  const unread = recent.filter(
    (task) => new Date(task.updatedAt).getTime() > seenAt
  ).length;

  const markSeen = () => {
    const now = Date.now();
    setSeenAt(now);
    try {
      localStorage.setItem(seenKey(userId), String(now));
    } catch {
      // Storage can be unavailable in private mode; the dot just reappears.
    }
  };

  const toggle = () => {
    setOpen((current) => {
      if (!current) markSeen();
      return !current;
    });
  };

  if (recent.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        ref={triggerRef}
        onClick={toggle}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-surface-200 bg-white text-surface-600 shadow-sm transition-colors hover:border-primary-200 hover:text-primary-800"
        aria-label={
          unread > 0
            ? `Visit activity, ${unread} unread update${unread === 1 ? "" : "s"}`
            : "Visit activity"
        }
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <BellIcon size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-400 px-1 text-[13px] font-extrabold text-primary-950 ring-2 ring-surface-50">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            className="absolute -right-[3.25rem] z-50 sm:right-0 mt-2 w-[min(21.5rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-elevated animate-scale-in"
            role="menu"
            aria-label="Recent visit activity"
          >
            <div className="flex items-center justify-between gap-3 border-b border-surface-100 px-4 py-3.5">
              <div>
                <p className="text-[13px] font-extrabold text-surface-950">Activity</p>
                <p className="mt-0.5 text-[13px] font-medium text-surface-500">
                  Recent updates from your visits
                </p>
              </div>

            </div>

            <div className="max-h-[22rem] overflow-y-auto">
              {recent.map((task) => {
                const copy = STATUS_COPY[task.status];
                const Icon = copy.icon;
                const detailPath =
                  role === "CAPTAIN"
                    ? `/captain/tasks/${task.id}`
                    : `/user/tasks/${task.id}`;

                return (
                  <Link
                    key={task.id}
                    to={detailPath}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 border-b border-surface-100 px-4 py-3 transition-colors last:border-0 hover:bg-surface-50"
                    role="menuitem"
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${copy.chip}`}
                    >
                      <Icon size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold text-surface-900">
                        {task.title}
                      </span>
                      <span className="mt-0.5 block text-[13px] font-semibold text-surface-600">
                        {copy.label}
                      </span>
                      <span className="mt-0.5 block text-[13px] font-medium text-surface-400">
                        {formatRelativeTime(task.updatedAt)}
                      </span>
                    </span>
                    {new Date(task.updatedAt).getTime() > seenAt && (
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-500" />
                    )}
                  </Link>
                );
              })}
            </div>

            <Link
              to={role === "CAPTAIN" ? "/captain/accepted" : "/user/tasks"}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center justify-center gap-1.5 bg-surface-50 px-4 text-[13px] font-bold text-primary-700 transition-colors hover:bg-primary-50"
              role="menuitem"
            >
              View all visits
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
