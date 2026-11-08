import { LiveTracker } from "../../components/LiveTracker";
import { useParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  PageLoader,
  Button,
  StatusBadge,
  useToast,
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  NavigationIcon,
  PhoneIcon,
  ShareIcon,
  ShieldCheckIcon,
} from "../../components";
import { useTaskDetail, useTaskUpdates } from "../../hooks";
import { formatRelativeTime } from "../../utils/time";

function visitRef(id: string): string {
  return `#${id.slice(-5).toUpperCase()}`;
}

export function TrackCaptainPage() {
  const { id } = useParams<{ id: string }>();
  const { data: task, isLoading, isError } = useTaskDetail(id!);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  useTaskUpdates(id, {
    onAccepted: () => {
      addToast("info", "An inspector accepted your visit.");
      queryClient.invalidateQueries({ queryKey: ["task", id] });
    },
    onStarted: () => {
      addToast("info", "Your inspector is on the way.");
      queryClient.invalidateQueries({ queryKey: ["task", id] });
    },
    onSubmitted: () => {
      addToast("success", "Proof submitted — review it whenever you’re ready.");
      queryClient.invalidateQueries({ queryKey: ["task", id] });
    },
  });

  if (isLoading) return <PageLoader />;

  if (isError || !task) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-[14px] font-bold text-primary-700">Visit unavailable</p>
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

  const inspector = task.acceptedBy;
  const isLive = task.status === "IN_PROGRESS";
  const phoneHref = inspector?.phone
    ? `tel:${inspector.phone.replace(/[^\d+]/g, "")}`
    : null;

  const shareTracking = async () => {
    const url = `${window.location.origin}/user/track/${task.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Track this PinProof visit`,
          text: "Private tracking link. Sign in with the visit owner’s account to view it.",
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      addToast("success", "Owner-only tracking link copied. Recipients need the owner’s account.");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      addToast("error", "Couldn’t share the link. Copy it from the address bar.");
    }
  };

  const nextCopy =
    task.status === "SUBMITTED"
      ? {
          title: "Proof is ready to review.",
          description:
            "Your inspector has submitted the photo and GPS details. Open the visit to check everything.",
          cta: "Review proof",
          to: `/user/tasks/${task.id}#evidence`,
        }
      : task.status === "IN_PROGRESS"
        ? {
            title: "Live until they reach the pin.",
            description:
              "Location updates automatically. The proof photo appears as soon as it’s captured.",
            cta: "Visit details",
            to: `/user/tasks/${task.id}`,
          }
        : task.status === "ACCEPTED"
          ? {
              title: "Waiting for the trip to start.",
              description:
                "Your inspector has accepted. Tracking turns on automatically when they set off.",
              cta: "Visit details",
              to: `/user/tasks/${task.id}`,
            }
          : task.status === "COMPLETED"
            ? {
                title: "This visit is complete.",
                description:
                  "The proof photo and location details stay in your visit history.",
                cta: "Open visit",
                to: `/user/tasks/${task.id}`,
              }
            : {
                title: "Finding a local inspector.",
                description:
                  "We’re matching your request with inspectors near the pin. This page updates when someone accepts.",
                cta: "Visit details",
                to: `/user/tasks/${task.id}`,
              };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/user/tasks/${task.id}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-[14px] font-semibold text-surface-600 transition-colors hover:bg-white hover:text-surface-950"
        >
          <span aria-hidden="true">←</span>
          Back to visit
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void shareTracking()}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white px-3 text-[13px] font-bold text-primary-700 shadow-sm transition-colors hover:bg-primary-50"
          >
            <ShareIcon size={13} />
            Copy owner link
          </button>
          <p className="hidden rounded-full bg-white px-2.5 py-1 text-[13px] font-semibold text-surface-500 shadow-sm sm:block">
            Visit {visitRef(task.id)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[14px] font-bold text-primary-700">
            <NavigationIcon size={13} />
            Live tracking
          </p>
          <h1 className="mt-1.5 max-w-2xl truncate text-[2rem] font-extrabold leading-tight tracking-[-0.035em] text-surface-950 sm:text-[2.4rem]">
            {task.title}
          </h1>
          <p className="mt-1.5 text-[14px] text-surface-600">
            {inspector
              ? `Assigned inspector: ${inspector.name}. Location updates appear below.`
              : "Waiting for an inspector to be assigned."}
          </p>
        </div>
        <StatusBadge status={task.status} size="md" />
      </div>

      {/* Live summary */}
      <section className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-surface-200 bg-white p-3 shadow-sm">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-700 text-[13px] font-extrabold text-white">
            {inspector?.name?.trim().charAt(0).toUpperCase() || "?"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-surface-500">
              Inspector
            </p>
            <p className="truncate text-[14px] font-bold text-surface-900">
              {inspector?.name ?? "Not assigned yet"}
            </p>
          </div>
          {isLive && (
            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[13px] font-bold text-primary-700">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-primary-500" />
              Visit in progress
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-surface-200 bg-white p-3 shadow-sm">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-800">
            <ClockIcon size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-surface-500">
              Visit status updated
            </p>
            <p className="truncate text-[14px] font-bold text-surface-900">
              {formatRelativeTime(task.updatedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-surface-200 bg-white p-3 shadow-sm">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-100 text-primary-700">
            <ShieldCheckIcon size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-surface-500">
              Proof radius
            </p>
            <p className="truncate text-[14px] font-bold text-surface-900">
              100 m GPS check
            </p>
          </div>
        </div>
      </section>

      <div className="mt-4 overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-card">
        <LiveTracker
          taskId={task.id}
          targetLat={task.targetLat}
          targetLng={task.targetLng}
          height="clamp(280px, calc(100dvh - 460px), 560px)"
          active={task.status === "IN_PROGRESS"}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-[13px] font-bold text-primary-700">
            {task.status === "SUBMITTED" ? (
              <CameraIcon size={14} />
            ) : task.status === "COMPLETED" ? (
              <CheckCircleIcon size={14} />
            ) : (
              <MapPinIcon size={14} />
            )}
            What’s happening
          </p>
          <p className="mt-1.5 text-[14px] font-extrabold tracking-[-0.01em] text-surface-950">
            {nextCopy.title}
          </p>
          <p className="mt-1 text-[14px] leading-relaxed text-surface-600">
            {nextCopy.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {phoneHref && (
              <a
                href={phoneHref}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-surface-200 px-3.5 text-[14px] font-bold text-surface-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <PhoneIcon size={14} className="text-primary-600" />
                Call inspector
              </a>
            )}
            <Button to={nextCopy.to} variant="secondary" size="sm" className="min-h-11">
              {nextCopy.cta}
            </Button>
          </div>
        </section>

        <section className="rounded-2xl bg-primary-900 p-4 text-white shadow-card">
          <p className="text-sm font-semibold text-accent-300">
            Live location
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-primary-200">
            {inspector
              ? `${inspector.name} shares location only while the visit is in progress. You can leave this page and come back anytime.`
              : "Location turns on automatically when your inspector starts the visit."}
          </p>
          <p className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[13px] font-semibold text-primary-300">
            <ClockIcon size={12} className="text-accent-300" />
            Updates automatically · no need to refresh
          </p>
        </section>
      </div>
    </div>
  );
}
