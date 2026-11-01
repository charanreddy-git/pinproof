import { useParams, Link } from "react-router-dom";
import { LiveTracker, PageLoader, Button, StatusBadge } from "../../components";
import { useTaskDetail, useSocket } from "../../hooks";
import { useEffect } from "react";
import { ClockIcon, MapPinIcon, NavigationIcon } from "../../components/Icons";

function visitRef(id: string): string {
  return `#${id.slice(-5).toUpperCase()}`;
}

export function TrackCaptainPage() {
  const { id } = useParams<{ id: string }>();
  const { data: task, isLoading, isError } = useTaskDetail(id!);
  const { joinRoom, leaveRoom } = useSocket();

  useEffect(() => {
    if (id) {
      joinRoom(id);
      return () => leaveRoom(id);
    }
  }, [id, joinRoom, leaveRoom]);

  if (isLoading) return <PageLoader />;

  if (isError || !task) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-[12px] font-bold text-primary-700">Visit unavailable</p>
        <h1 className="mt-2 text-[2rem] font-extrabold tracking-[-0.035em] text-surface-950">
          We couldn’t find that visit.
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-surface-600">
          It may have been removed, or you may not have access to it.
        </p>
        <Button to="/user" className="mt-6">
          Back to my visits
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/user/tasks/${task.id}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-[12.5px] font-semibold text-surface-600 transition-colors hover:bg-white hover:text-surface-950"
        >
          <span aria-hidden="true">←</span>
          Back to visit
        </Link>
        <p className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-surface-500 shadow-sm">
          Visit {visitRef(task.id)}
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary-700">
            <NavigationIcon size={13} />
            Live tracking
          </p>
          <h1 className="mt-1.5 max-w-2xl truncate text-[2rem] font-extrabold leading-tight tracking-[-0.035em] text-surface-950 sm:text-[2.4rem]">
            {task.title}
          </h1>
          <p className="mt-1.5 text-[12.5px] text-surface-600">
            {task.acceptedBy?.name
              ? `${task.acceptedBy.name} is sharing their location while they travel.`
              : "Waiting for an inspector to be assigned."}
          </p>
        </div>
        <StatusBadge status={task.status} size="md" />
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-card">
        <LiveTracker
          taskId={task.id}
          targetLat={task.targetLat}
          targetLng={task.targetLng}
          height="clamp(280px, calc(100dvh - 400px), 560px)"
        />
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl border border-surface-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
            <MapPinIcon size={14} className="text-primary-700" />
          </span>
          <p className="max-w-xl text-[11.5px] leading-relaxed text-surface-600">
            The inspector’s phone shares location while the visit is in progress.
            You can leave this page and come back anytime — it keeps updating.
          </p>
        </div>
        <Button to={`/user/tasks/${task.id}`} variant="secondary" size="sm">
          Visit details
        </Button>
      </div>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-[10.5px] font-medium text-surface-500">
        <ClockIcon size={12} className="text-primary-600" />
        Location updates automatically · no need to refresh
      </p>
    </div>
  );
}
