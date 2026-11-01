import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  TaskTable,
  PageLoader,
  Button,
  VisitProgress,
} from "../../components";
import { useAuth } from "../../contexts";
import { useGeolocation, useTaskList } from "../../hooks";
import {
  ArrowRightIcon,
  ClipboardIcon,
  MapPinIcon,
  NavigationIcon,
  RefreshCwIcon,
  SearchIcon,
} from "../../components/Icons";
import { CAPTAIN_DISCOVERY_RADIUS_KM, visitRef } from "../../utils/task";
import type { Coordinates, Task } from "../../types";

/** Fixed location for demo mode so the prepared Bengaluru visits stay visible. */
const DEMO_CAPTAIN_LOCATION: Coordinates = {
  latitude: 12.9698,
  longitude: 77.7499,
};

function activeCopy(task: Task): {
  eyebrow: string;
  description: string;
  cta: string;
  to: string;
  secondaryTo?: string;
} {
  if (task.status === "IN_PROGRESS") {
    return {
      eyebrow: "Visit in progress",
      description:
        "You’re on the way. Take the proof photo only within 100 m of the pin.",
      cta: "Submit proof",
      to: `/captain/tasks/${task.id}/upload`,
      secondaryTo: `/captain/tasks/${task.id}`,
    };
  }

  return {
    eyebrow: "Ready to start",
    description:
      "You’re assigned. Open the visit when you’re ready to head to the property.",
    cta: "Open visit",
    to: `/captain/tasks/${task.id}`,
  };
}

function ActiveVisitCard({ task }: { task: Task }) {
  const copy = activeCopy(task);

  return (
    <section className="rounded-3xl border border-primary-200 bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-2.5 py-1 text-[10.5px] font-bold text-accent-900">
          <span
            className={`h-1.5 w-1.5 rounded-full bg-accent-500 ${
              task.status === "IN_PROGRESS" ? "animate-pulse-soft" : ""
            }`}
            aria-hidden="true"
          />
          {copy.eyebrow}
        </span>
        <span className="text-[10px] font-semibold tabular-nums text-surface-400">
          {visitRef(task.id)}
        </span>
      </div>

      <h2 className="mt-3 line-clamp-2 text-[1.3rem] font-extrabold leading-tight tracking-[-0.03em] text-surface-950">
        {task.title}
      </h2>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-surface-600">
        {copy.description}
      </p>

      <VisitProgress status={task.status} className="mt-4" />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          to={copy.to}
          variant="accent"
          className="min-h-11 flex-1 justify-between px-4 sm:justify-center"
        >
          {copy.cta}
          <ArrowRightIcon size={15} />
        </Button>
        {copy.secondaryTo && (
          <Button
            to={copy.secondaryTo}
            variant="secondary"
            className="min-h-11 sm:w-auto"
          >
            Details
          </Button>
        )}
      </div>
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
  const [isLocating, setIsLocating] = useState(true);

  const location = useMemo<Coordinates | undefined>(() => {
    // Demo mode always uses the prepared Bengaluru location so the sample
    // visits stay visible regardless of where the reviewer is.
    if (authMode === "demo") return DEMO_CAPTAIN_LOCATION;
    if (latitude !== null && longitude !== null) {
      return { latitude, longitude };
    }
    return undefined;
  }, [latitude, longitude, authMode]);

  const refreshLocation = useCallback(async () => {
    setIsLocating(true);
    try {
      await requestLocation();
    } finally {
      setIsLocating(false);
    }
  }, [requestLocation]);

  const hasRequestedLocation = useRef(false);

  useEffect(() => {
    if (!authModeReady || authMode === "demo") return;
    if (hasRequestedLocation.current) return;
    hasRequestedLocation.current = true;
    void refreshLocation();
  }, [authMode, authModeReady, refreshLocation]);

  const locating = isLocating && authMode !== "demo";

  const { data: allTasks, isLoading: loadingAll } = useTaskList(
    undefined,
    location
  );
  const { data: availableTasks, isLoading: loadingAvailable } = useTaskList(
    "available",
    location,
    { enabled: !!location }
  );

  if (loadingAll || (location && loadingAvailable)) return <PageLoader />;

  const tasks = allTasks || [];
  const available = availableTasks || [];
  const firstName = user?.name?.split(" ")[0] || "there";

  const activeTasks = tasks
    .filter((task) => ["ACCEPTED", "IN_PROGRESS"].includes(task.status))
    .sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === "IN_PROGRESS" ? -1 : 1;
    });
  const featuredTask = activeTasks[0] ?? null;
  const extraActive = activeTasks.length - (featuredTask ? 1 : 0);

  const subtitle = (() => {
    if (!location) {
      return `Turn on location to see visit requests within ${CAPTAIN_DISCOVERY_RADIUS_KM} km.`;
    }
    if (available.length > 0) {
      return `${available.length} request${available.length === 1 ? "" : "s"} within ${CAPTAIN_DISCOVERY_RADIUS_KM} km${
        activeTasks.length > 0
          ? ` · ${activeTasks.length} active`
          : ""
      }`;
    }
    if (activeTasks.length > 0) {
      return `${activeTasks.length} active visit${activeTasks.length === 1 ? "" : "s"} · new requests appear here`;
    }
    return `No open requests within ${CAPTAIN_DISCOVERY_RADIUS_KM} km right now. New ones appear through the day.`;
  })();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[2rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-surface-950 sm:text-[2.4rem]">
            Hi {firstName}
          </h1>
          <p className="mt-1.5 max-w-md text-[12.5px] leading-relaxed text-surface-600">
            {subtitle}
          </p>
        </div>
        <Button
          to="/captain/accepted"
          variant="secondary"
          className="min-h-11 flex-shrink-0 px-4"
        >
          <ClipboardIcon size={15} />
          My visits
        </Button>
      </div>

      {featuredTask && (
        <div className="mt-5">
          <ActiveVisitCard task={featuredTask} />
          {extraActive > 0 && (
            <Link
              to="/captain/accepted"
              className="mt-2 inline-flex min-h-11 items-center gap-1.5 px-1 text-[11.5px] font-bold text-primary-700"
            >
              {extraActive} more active visit{extraActive === 1 ? "" : "s"}
              <ArrowRightIcon size={13} />
            </Link>
          )}
        </div>
      )}

      <section className={featuredTask ? "mt-6" : "mt-5"}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[1.25rem] font-extrabold tracking-[-0.03em] text-surface-950">
              Available near you
            </h2>
            <p className="mt-0.5 text-[11px] font-medium text-surface-500">
              {location
                ? `Open visits within ${CAPTAIN_DISCOVERY_RADIUS_KM} km, nearest first.`
                : "Share your location to see visits close to you."}
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {location && authMode !== "demo" && (
              <button
                type="button"
                onClick={() => void refreshLocation()}
                disabled={locating}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-surface-200 bg-white px-2.5 text-[10.5px] font-bold text-surface-600 transition-colors hover:border-primary-200 hover:text-primary-800 disabled:opacity-60"
              >
                <RefreshCwIcon
                  size={11}
                  className={locating ? "animate-spin" : ""}
                />
                {locating ? "Updating" : "Update"}
              </button>
            )}
            <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-accent-100 px-2.5 py-1 text-[10.5px] font-bold text-accent-900">
              <SearchIcon size={11} />
              {available.length}
            </span>
          </div>
        </div>

        {location ? (
          <TaskTable
            tasks={available}
            basePath="/captain/tasks"
            showCreatedBy
            emptyMessage="No requests nearby"
            emptyDescription={`No open visits within ${CAPTAIN_DISCOVERY_RADIUS_KM} km right now.`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-surface-300 bg-white/60 px-5 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
              <NavigationIcon size={24} className="text-primary-600" />
            </div>
            <div className="space-y-1">
              <p className="text-[16px] font-bold text-surface-900">
                {locating
                  ? "Finding your location…"
                  : "Turn on location to see nearby visits"}
              </p>
              <p className="mx-auto max-w-xs text-[12.5px] leading-relaxed text-surface-500">
                {locating
                  ? `We only show open visits within ${CAPTAIN_DISCOVERY_RADIUS_KM} km of you.`
                  : locationError
                    ? "We couldn't access your location. Check your browser permissions and try again."
                    : `We use your location only to show open visits within ${CAPTAIN_DISCOVERY_RADIUS_KM} km.`}
              </p>
            </div>
            {!locating && (
              <Button
                onClick={() => void refreshLocation()}
                variant="secondary"
                size="sm"
              >
                <NavigationIcon size={14} />
                Use my location
              </Button>
            )}
          </div>
        )}
      </section>

      {!featuredTask && available.length === 0 && (
        <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-surface-100 px-4 py-3">
          <MapPinIcon
            size={15}
            className="mt-0.5 flex-shrink-0 text-primary-600"
          />
          <p className="text-[11.5px] leading-relaxed text-surface-600">
            Your accepted visits and completed work stay in{" "}
            <Link
              to="/captain/accepted"
              className="font-bold text-primary-700 underline underline-offset-4"
            >
              My visits
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
