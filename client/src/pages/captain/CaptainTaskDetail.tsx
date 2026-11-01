import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import {
  Button,
  StatusBadge,
  MapView,
  targetIcon,
  PageLoader,
  useToast,
  CompassIcon,
  CameraIcon,
  CheckIcon,
  MapPinIcon,
  NavigationIcon,
  AlertTriangleIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "../../components";
import { useTaskDetail, useStartTask, useAcceptTask, useGeolocation } from "../../hooks";
import { getApiOrigin } from "../../utils/api";

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function visitRef(id: string): string {
  return `#${id.slice(-5).toUpperCase()}`;
}

export function CaptainTaskDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: task, isLoading, isError } = useTaskDetail(id!);
  const startTask = useStartTask();
  const acceptTask = useAcceptTask();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { startTracking, isTracking } = useGeolocation();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  const handleStart = async () => {
    if (!task) return;
    try {
      await startTask.mutateAsync(task.id);
      addToast("success", "Visit started. Location sharing is on.");
      cleanupRef.current = startTracking(task.id);
    } catch (err) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "Could not start the visit.";
      addToast("error", errorMsg);
    }
  };

  const handleAccept = async () => {
    if (!task) return;
    try {
      await acceptTask.mutateAsync(task.id);
      addToast("success", "Request accepted. Start the visit when you're ready.");
    } catch (err) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "Could not accept this request.";
      addToast("error", errorMsg);
    }
  };

  if (isLoading) return <PageLoader />;

  if (isError || !task) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-[12px] font-bold text-primary-700">Visit unavailable</p>
        <h1 className="mt-2 text-[2rem] font-extrabold tracking-[-0.035em] text-surface-950">
          We couldn’t find that visit.
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-surface-600">
          It may no longer be available, or it may belong to another inspector.
        </p>
        <Button to="/captain/dashboard" className="mt-6">
          Back to find work
        </Button>
      </div>
    );
  }

  const baseUrl = getApiOrigin();
  const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${task.targetLat},${task.targetLng}`;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button to="/captain/dashboard" variant="ghost" size="sm" className="-ml-2 min-h-11">
          <span aria-hidden="true">←</span>
          Find work
        </Button>
        <p className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-surface-500 shadow-sm">
          Visit {visitRef(task.id)} · {formatDateTime(task.createdAt)}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[12px] font-bold text-primary-700">Visit details</p>
          <h1 className="mt-1.5 max-w-2xl text-[2.1rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-surface-950 sm:text-[2.6rem]">
            {task.title}
          </h1>
          <p className="mt-2.5 max-w-2xl whitespace-pre-line text-[13px] leading-[1.7] text-surface-600">
            {task.description}
          </p>
        </div>
        <StatusBadge status={task.status} size="md" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="space-y-5 lg:col-span-7">
          <section className="overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-card">
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
              <div>
                <p className="text-[11.5px] font-bold text-primary-700">
                  Property pin
                </p>
                <p className="mt-0.5 text-[10.5px] font-medium text-surface-500">
                  {task.targetLat.toFixed(5)}, {task.targetLng.toFixed(5)}
                </p>
              </div>
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-primary-50 px-3 text-[11.5px] font-bold text-primary-800 transition-colors hover:bg-primary-100"
              >
                <NavigationIcon size={13} />
                Directions
              </a>
            </div>
            <div className="h-[250px] bg-surface-100 sm:h-[330px]">
              <MapView
                center={[task.targetLat, task.targetLng]}
                zoom={16}
                markers={[
                  {
                    position: [task.targetLat, task.targetLng],
                    label: "Property location",
                    icon: targetIcon,
                  },
                ]}
                height="100%"
                className="h-full"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 bg-primary-50 px-4 py-2.5 sm:px-5">
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-primary-800">
                <ShieldCheckIcon size={12} />
                Proof must be within 100 m of this pin
              </span>
              <span className="text-[10px] font-medium text-primary-600">
                Checked by the server
              </span>
            </div>
          </section>

          {task.evidenceImage ? (
            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11.5px] font-bold text-primary-700">
                    Submitted proof
                  </p>
                  <h2 className="mt-0.5 text-[1.45rem] font-extrabold tracking-[-0.03em] text-surface-950">
                    Your photo
                  </h2>
                </div>
                <a
                  href={`${baseUrl}${task.evidenceImage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center rounded-full bg-white px-3 text-[11px] font-bold text-primary-700 shadow-sm transition-colors hover:bg-primary-50"
                >
                  Open full size ↗
                </a>
              </div>

              <figure className="overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-card">
                <div className="bg-surface-950 p-2 sm:p-3">
                  <img
                    src={`${baseUrl}${task.evidenceImage}`}
                    alt="Proof submitted for this visit"
                    className="max-h-[30rem] w-full rounded-xl bg-surface-950 object-contain"
                  />
                </div>
                <figcaption className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-[10.5px] font-bold text-primary-800">
                    <CheckIcon size={11} />
                    Accepted within 100 m
                  </span>
                  {task.evidenceCapturedAt && (
                    <span className="text-[10px] font-medium text-surface-500">
                      Captured {formatDateTime(task.evidenceCapturedAt)}
                    </span>
                  )}
                </figcaption>
              </figure>

              {task.evidenceAccuracy != null && (
                <p className="mt-2 flex items-center gap-1.5 text-[10.5px] font-medium text-surface-500">
                  <ShieldCheckIcon size={12} className="text-primary-600" />
                  GPS accuracy ±{Math.round(task.evidenceAccuracy)} m
                </p>
              )}
            </section>
          ) : (
            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11.5px] font-bold text-primary-700">
                    Proof
                  </p>
                  <h2 className="mt-0.5 text-[1.45rem] font-extrabold tracking-[-0.03em] text-surface-950">
                    Your photo
                  </h2>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-surface-500 shadow-sm">
                  Not yet
                </span>
              </div>
              <div className="crosshair flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-surface-300 bg-white/70 p-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-100">
                  <CameraIcon size={22} className="text-surface-400" />
                </span>
                <p className="max-w-sm text-[12px] leading-relaxed text-surface-500">
                  Start the visit, travel to the pin, then take the proof photo.
                  The server checks your distance when you upload.
                </p>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5 lg:col-span-5">
          <section className="rounded-3xl bg-primary-900 p-5 text-white shadow-card">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold text-accent-300">Next step</p>
              <span className="h-2 w-2 rounded-full bg-accent-400" aria-hidden="true" />
            </div>

            {task.status === "OPEN" && (
              <>
                <h2 className="mt-2 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em]">
                  Take this visit?
                </h2>
                <p className="mt-2 text-[11.5px] leading-relaxed text-primary-200">
                  You’ll be assigned to this property. Check the map and make sure
                  you can reach the pin before accepting.
                </p>
                <Button
                  onClick={handleAccept}
                  isLoading={acceptTask.isPending}
                  variant="inverse"
                  size="sm"
                  className="mt-4 w-full min-h-11"
                >
                  Accept visit
                </Button>
                <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-primary-300">
                  <ClockIcon size={12} className="mt-0.5 flex-shrink-0" />
                  Only accept if you can visit in the next few hours.
                </p>
              </>
            )}

            {task.status === "ACCEPTED" && (
              <>
                <h2 className="mt-2 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em]">
                  Start when you set off.
                </h2>
                <p className="mt-2 text-[11.5px] leading-relaxed text-primary-200">
                  Starting the visit turns on location sharing so the requester
                  can follow your trip.
                </p>
                <Button
                  onClick={handleStart}
                  isLoading={startTask.isPending}
                  variant="inverse"
                  size="sm"
                  className="mt-4 w-full min-h-11"
                >
                  <NavigationIcon size={14} />
                  Start visit
                </Button>
                <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-primary-300">
                  <CompassIcon size={12} className="mt-0.5 flex-shrink-0 text-accent-300" />
                  Keep this page open while travelling for live location.
                </p>
              </>
            )}

            {task.status === "IN_PROGRESS" && (
              <>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <h2 className="text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em]">
                    Reach the pin. Take the photo.
                  </h2>
                </div>

                <div className="mt-2">
                  {isTracking ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-primary-100">
                      <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent-400" />
                      Sharing location
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-primary-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-surface-400" />
                      Location off
                    </span>
                  )}
                </div>

                {!isTracking && (
                  <button
                    type="button"
                    onClick={() => {
                      cleanupRef.current = startTracking(task.id);
                      addToast("info", "Location sharing is on.");
                    }}
                    className="mt-3 flex w-full items-start gap-2 rounded-xl border border-warning-300/40 bg-warning-400/15 px-3 py-2.5 text-left text-[10.5px] leading-relaxed text-warning-100 transition-colors hover:bg-warning-400/20"
                  >
                    <CompassIcon size={13} className="mt-0.5 flex-shrink-0" />
                    Turn on live location so the requester can follow you
                  </button>
                )}

                <div className="mt-4 space-y-2">
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/25 px-3 text-[12px] font-bold text-white transition-colors hover:bg-white/10"
                  >
                    <NavigationIcon size={14} />
                    Get directions
                  </a>
                  <Button
                    onClick={() => navigate(`/captain/tasks/${task.id}/upload`)}
                    variant="inverse"
                    size="sm"
                    className="w-full min-h-11"
                  >
                    <CameraIcon size={14} />
                    Take a proof photo
                  </Button>
                </div>

                <p className="mt-3 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-primary-300">
                  <AlertTriangleIcon size={13} className="mt-0.5 flex-shrink-0 text-warning-400" />
                  Proof can only be submitted within 100 metres of the pin.
                </p>
              </>
            )}

            {task.status === "SUBMITTED" && (
              <>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-accent-300">
                  <CheckIcon size={12} />
                  Proof submitted
                </p>
                <h2 className="mt-1.5 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em]">
                  Waiting on the requester.
                </h2>
                <p className="mt-2 text-[11.5px] leading-relaxed text-primary-200">
                  The requester is reviewing your photo. The visit closes once
                  they mark it complete.
                </p>
              </>
            )}

            {task.status === "COMPLETED" && (
              <>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-accent-300">
                  <CheckIcon size={12} />
                  Visit complete
                </p>
                <h2 className="mt-1.5 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em]">
                  Good work. This one’s done.
                </h2>
                <p className="mt-2 text-[11.5px] leading-relaxed text-primary-200">
                  The requester accepted your proof. The completed visit stays in
                  your history.
                </p>
                <Button
                  to="/captain/dashboard"
                  variant="inverse"
                  size="sm"
                  className="mt-4 w-full min-h-11"
                >
                  Find another visit
                </Button>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
            <p className="text-[11.5px] font-bold text-primary-700">
              Request details
            </p>
            <dl className="mt-2">
              {[
                { label: "Requested by", value: task.createdBy.name },
                {
                  label: "Property pin",
                  value: `${task.targetLat.toFixed(5)}, ${task.targetLng.toFixed(5)}`,
                },
                { label: "Proof rule", value: "Within 100 m of pin" },
                { label: "Posted", value: formatDateTime(task.createdAt) },
                { label: "Last update", value: formatDateTime(task.updatedAt) },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-3 border-b border-surface-100 py-2.5 last:border-0"
                >
                  <dt className="text-[11px] font-semibold text-surface-500">
                    {row.label}
                  </dt>
                  <dd className="max-w-[60%] break-words text-right text-[11.5px] font-bold text-surface-900">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-[11.5px] font-semibold text-primary-700 hover:text-primary-800"
            >
              <MapPinIcon size={12} />
              Open directions in Google Maps
            </a>
          </section>

          <section className="rounded-2xl border border-warning-200 bg-warning-50 p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangleIcon size={15} className="mt-0.5 flex-shrink-0 text-warning-600" />
              <div>
                <p className="text-[11.5px] font-bold text-warning-800">
                  How proof is checked
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-warning-800/80">
                  Capture the photo inside PinProof, within 100 metres of the
                  pin. A gallery upload is allowed only when the camera can’t be
                  used — the distance check still applies.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
