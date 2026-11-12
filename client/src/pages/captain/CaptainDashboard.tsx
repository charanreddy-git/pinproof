import { QueryNotice } from "../../components/QueryNotice";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, DashboardSkeleton, useToast } from "../../components";
import { useAuth } from "../../contexts";
import { useAcceptTask, useGeolocation, useTaskList } from "../../hooks";
import {
  ArrowRightIcon,
  ChevronRightIcon,
  MapPinIcon,
  NavigationIcon,
} from "../../components/Icons";
import { CAPTAIN_DISCOVERY_RADIUS_KM } from "../../utils/task";
import { greeting } from "../../utils/time";
import { visitPriceLabel } from "../../content/visitPlans";
import type { Coordinates, Task } from "../../types";

/** Fixed location for demo mode so the prepared Bengaluru visits stay visible. */
const DEMO_CAPTAIN_LOCATION: Coordinates = {
  latitude: 12.9698,
  longitude: 77.7499,
};

const EMPTY_TASKS: Task[] = [];

const STATUS_LABEL: Record<string, string> = {
  ACCEPTED: "Assigned",
  IN_PROGRESS: "On the way",
  SUBMITTED: "Waiting",
};

function distanceLabel(km?: number): string {
  if (typeof km !== "number") return "Nearby";
  if (km < 0.05) return "At your location";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function acceptErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = (
      error as { response?: { data?: { message?: string } } }
    ).response;
    if (response?.data?.message) return response.data.message;
  }
  return "Could not accept this visit. Check your connection and try again.";
}

function activeCopy(task: Task): {
  note: string;
  cta: string;
  to: string;
} {
  if (task.status === "IN_PROGRESS") {
    return {
      note: "Take the proof photo within 100 m of the pin.",
      cta: "Submit proof",
      to: `/captain/tasks/${task.id}/upload`,
    };
  }

  if (task.status === "SUBMITTED") {
    return {
      note: "Proof sent. The requester can review it now.",
      cta: "View visit",
      to: `/captain/tasks/${task.id}`,
    };
  }

  return {
    note: "Open the visit when you set off.",
    cta: "Open visit",
    to: `/captain/tasks/${task.id}`,
  };
}

function ActiveWorkCard({ task }: { task: Task }) {
  const copy = activeCopy(task);
  const price = visitPriceLabel(task.visitPlan, task.quotedPricePaise);

  return (
    <section className="rounded-3xl bg-primary-950 p-4 text-white shadow-elevated sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11.5px] font-bold">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              task.status === "SUBMITTED" ? "bg-success-400" : "bg-accent-400"
            } ${task.status === "IN_PROGRESS" ? "animate-pulse-soft motion-reduce:animate-none" : ""}`}
            aria-hidden="true"
          />
          {STATUS_LABEL[task.status]}
        </span>
        {price && (
          <span className="rounded-full bg-accent-400 px-2.5 py-1 text-[11.5px] font-extrabold tabular-nums text-primary-950">
            {price} quote
          </span>
        )}
      </div>

      <h2 className="mt-3 line-clamp-2 text-[1.25rem] font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-[1.4rem]">
        {task.title}
      </h2>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-primary-200">
        {copy.note}
      </p>

      <Button
        to={copy.to}
        variant="accent"
        className="mt-4 min-h-12 w-full justify-between px-4"
      >
        {copy.cta}
        <ArrowRightIcon size={15} />
      </Button>
    </section>
  );
}

function JobCard({
  task,
  onAccept,
  isAccepting,
  acceptDisabled,
}: {
  task: Task;
  onAccept: (id: string) => void;
  isAccepting: boolean;
  acceptDisabled: boolean;
}) {
  const price = visitPriceLabel(task.visitPlan, task.quotedPricePaise);

  return (
    <article className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
      <Link
        to={`/captain/tasks/${task.id}`}
        className="block p-3.5 pb-2 transition-colors hover:bg-surface-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-700 active:bg-surface-100"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium text-surface-500">
              Requester quote
            </p>
            <p className="mt-0.5 text-[1.35rem] font-extrabold leading-none tabular-nums text-surface-950">
              {price ?? "Not quoted"}
            </p>
          </div>
          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-800">
            <NavigationIcon size={10} />
            {distanceLabel(task.distanceKm)}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 text-[13.5px] font-bold leading-snug text-surface-950">
            {task.title}
          </h3>
          <ChevronRightIcon
            size={15}
            className="flex-shrink-0 text-surface-400"
          />
        </div>
      </Link>

      <div className="px-3.5 pb-3.5">
        <Button
          type="button"
          variant="accent"
          className="min-h-11 w-full"
          isLoading={isAccepting}
          disabled={acceptDisabled}
          onClick={() => onAccept(task.id)}
        >
          Accept
        </Button>
      </div>
    </article>
  );
}

function LocationCard({
  locating,
  locationError,
  onRequest,
}: {
  locating: boolean;
  locationError: string | null;
  onRequest: () => void;
}) {
  return (
    <section className="rounded-2xl border border-accent-300 bg-accent-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <MapPinIcon size={18} className="flex-shrink-0 text-accent-900" />
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold text-surface-950">
              {locating ? "Finding your location" : "Location off"}
            </p>
            <p className="mt-0.5 text-[11.5px] leading-snug text-surface-600">
              {locating
                ? "This only takes a moment."
                : `See jobs within ${CAPTAIN_DISCOVERY_RADIUS_KM} km.`}
            </p>
          </div>
        </div>

        {!locating && (
          <Button
            type="button"
            variant="accent"
            size="sm"
            className="min-h-10 flex-shrink-0 px-3"
            onClick={onRequest}
          >
            Turn on
          </Button>
        )}
      </div>

      {!locating && locationError && (
        <p className="mt-2 text-[11.5px] leading-snug text-accent-900">
          Check browser permissions and try again.
        </p>
      )}
    </section>
  );
}

export function CaptainDashboard() {
  const { user, authMode, authModeReady } = useAuth();
  const {
    latitude,
    longitude,
    error: locationError,
    requestLocation,
  } = useGeolocation();
  const { addToast } = useToast();
  const acceptTask = useAcceptTask();
  const [isLocating, setIsLocating] = useState(false);

  const location = useMemo<Coordinates | undefined>(() => {
    if (latitude !== null && longitude !== null) {
      return { latitude, longitude };
    }
    if (authMode === "demo") return DEMO_CAPTAIN_LOCATION;
    return undefined;
  }, [latitude, longitude, authMode]);

  const requestCurrentLocation = useCallback(async () => {
    setIsLocating(true);
    try {
      await requestLocation();
    } finally {
      setIsLocating(false);
    }
  }, [requestLocation]);

  const locating = isLocating && authMode !== "demo";

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useTaskList(undefined, location, { enabled: authModeReady });

  if (isLoading) return <DashboardSkeleton />;

  if (isError && !data) {
    return <QueryNotice retry={() => void refetch()} busy={isFetching} />;
  }

  const tasks = data ?? EMPTY_TASKS;
  const available = tasks
    .filter((task) => task.status === "OPEN")
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  const activeTasks = tasks
    .filter((task) =>
      ["ACCEPTED", "IN_PROGRESS", "SUBMITTED"].includes(task.status)
    )
    .sort((a, b) => {
      const order: Record<string, number> = {
        IN_PROGRESS: 0,
        ACCEPTED: 1,
        SUBMITTED: 2,
      };
      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });
  const featuredTask = activeTasks[0] ?? null;
  const firstName = user?.name?.split(" ")[0] || "there";

  const subtitle = (() => {
    if (!location) {
      return "Turn on location to see nearby jobs.";
    }
    if (available.length === 0 && activeTasks.length === 0) {
      return "No jobs nearby right now.";
    }
    const nearby = `${available.length} job${available.length === 1 ? "" : "s"} nearby`;
    return activeTasks.length > 0
      ? `${nearby} · ${activeTasks.length} active`
      : nearby;
  })();

  const handleAccept = (id: string) => {
    acceptTask.mutate(id, {
      onSuccess: () => {
        addToast("success", "Visit accepted. Find it in My visits.");
      },
      onError: (error) => {
        addToast("error", acceptErrorMessage(error));
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      {isError && data && (
        <QueryNotice retry={() => void refetch()} busy={isFetching} stale />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[1.4rem] font-extrabold leading-tight tracking-[-0.03em] text-surface-950 sm:text-[1.6rem]">
            {greeting()}, {firstName}
          </h1>
          <p className="mt-1 text-[12.5px] leading-relaxed text-surface-500">
            {subtitle}
          </p>
        </div>
        <Button
          to="/captain/accepted"
          variant="secondary"
          size="sm"
          className="max-sm:hidden min-h-10 flex-shrink-0 px-3.5"
        >
          My visits
        </Button>
      </div>

      <div className="mt-4 space-y-5">
        {location && <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-surface-200 bg-white px-4 py-3">
          <p className="text-sm text-surface-600">{authMode === "demo" && latitude === null ? "Demo search: Whitefield, Bengaluru. Allow location to find work near you." : `Searching near ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}</p>
          <Button variant="secondary" size="sm" onClick={() => void requestCurrentLocation()} isLoading={locating}>{latitude === null ? "Allow my location" : "Refresh location"}</Button>
          {locationError && <p role="alert" className="w-full text-sm text-danger-700">{locationError}</p>}
        </div>}
        {!location ? (
          <LocationCard
            locating={locating}
            locationError={locationError}
            onRequest={() => void requestCurrentLocation()}
          />
        ) : (
          <>
            {featuredTask && <ActiveWorkCard task={featuredTask} />}

            <section>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-surface-950">
                  Jobs near you
                </h2>
                <span className="text-[12px] font-medium text-surface-500">
                  Within {CAPTAIN_DISCOVERY_RADIUS_KM} km
                </span>
              </div>

              {available.length > 0 ? (
                <div className="mt-2.5 space-y-2.5">
                  {available.map((task) => (
                    <JobCard
                      key={task.id}
                      task={task}
                      onAccept={handleAccept}
                      isAccepting={
                        acceptTask.isPending &&
                        acceptTask.variables === task.id
                      }
                      acceptDisabled={acceptTask.isPending}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-2.5 rounded-2xl border border-dashed border-surface-300 bg-white/70 px-4 py-6 text-center">
                  <p className="text-[13px] font-bold text-surface-900">
                    No open jobs nearby
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-surface-500">
                    New requests appear through the day.
                  </p>
                </div>
              )}

              <p className="mt-3 text-[11px] leading-relaxed text-surface-500">
                Quote is the requester’s budget. Agree your fee before you
                accept.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
