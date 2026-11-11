import { targetIcon } from "../../components/MapIcons";
import { MapView } from "../../components/MapView";
import { formatVisitQuote } from "../../content/visitPlans";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Button,
  StatusBadge,
  PageLoader,
  useToast,
  Modal,
  CompassIcon,
  CameraIcon,
  CheckIcon,
  CheckCircleIcon,
  MapPinIcon,
  NavigationIcon,
  AlertTriangleIcon,
  ClockIcon,
  ShieldCheckIcon,
  CopyIcon,
} from "../../components";
import { useTaskDetail, useStartTask, useAcceptTask } from "../../hooks";
import { EvidenceImage, EvidenceDownload } from "../../components/EvidenceImage";
import { formatRelativeTime } from "../../utils/time";
import { VisitManagement } from "../../components/VisitManagement";
import { VisitHistory } from "../../components/VisitHistory";
import { VisitReportSummary } from "../../components/VisitReportSummary";
import { QueryNotice } from "../../components/QueryNotice";

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
  const { data: task, isLoading, isError, refetch } = useTaskDetail(id!);
  const startTask = useStartTask();
  const acceptTask = useAcceptTask();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [confirmAccept, setConfirmAccept] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  const handleStart = async () => {
    if (!task) return;
    try {
      await startTask.mutateAsync(task.id);
      addToast("success", "Visit started. Allow location access to share your trip.");
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
      setConfirmAccept(false);
      addToast("success", "Request accepted. Start the visit when you're ready.");
    } catch (err) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "Could not accept this request.";
      addToast("error", errorMsg);
    }
  };

  const copyPin = async () => {
    if (!task) return;
    try {
      await navigator.clipboard.writeText(`${task.targetLat}, ${task.targetLng}`);
      addToast("success", "Pin coordinates copied.");
    } catch {
      addToast("error", "Couldn’t copy the pin. Long-press the coordinates instead.");
    }
  };

  if (isLoading) return <PageLoader />;

  if (!task) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-[14px] font-bold text-primary-700">Visit unavailable</p>
        <h1 className="mt-2 text-[2rem] font-extrabold tracking-[-0.035em] text-surface-950">
          We couldn’t find that visit.
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-surface-600">
          It may no longer be available, or it may belong to another inspector.
        </p>
        <Button to="/captain/dashboard" className="mt-6">
          Back to find work
        </Button>
        <Button variant="secondary" className="mt-3" onClick={() => void refetch()}>Try again</Button>
      </div>
    );
  }
  const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${task.targetLat},${task.targetLng}`;
  const distance = typeof task.distanceKm === "number" ? task.distanceKm : null;

  return (
    <div className="mx-auto max-w-6xl pb-24 sm:pb-0">
      {isError && <QueryNotice retry={() => void refetch()} stale />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button to="/captain/dashboard" variant="ghost" size="sm" className="-ml-2 min-h-11">
          <span aria-hidden="true">←</span>
          Find work
        </Button>
        <div className="flex items-center gap-2">
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-primary-700 px-3 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-primary-800"
          >
            <NavigationIcon size={13} />
            Directions
          </a>
          <p className="hidden rounded-full bg-white px-2.5 py-1 text-[13px] font-semibold text-surface-500 shadow-sm sm:block">
            Visit {visitRef(task.id)} · {formatDateTime(task.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-primary-700">Visit details</p>
          <h1 className="mt-1.5 max-w-2xl text-[2.1rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-surface-950 sm:text-[2.6rem]">
            {task.title}
          </h1>
          <p className="mt-2.5 max-w-2xl whitespace-pre-line text-[13px] leading-[1.7] text-surface-600">
            {task.description}
          </p>
        </div>
        <StatusBadge status={task.status} size="md" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[13px] font-semibold text-surface-500 shadow-sm">
          <ClockIcon size={11} className="text-primary-600" />
          Updated {formatRelativeTime(task.updatedAt)}
        </span>
        {distance !== null && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-[13px] font-bold text-primary-700">
            <NavigationIcon size={11} />
            {distance < 1
              ? `${Math.max(1, Math.round(distance * 1000))} m from you`
              : `${distance.toFixed(1)} km from you`}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[13px] font-semibold text-surface-500 shadow-sm">
          <CameraIcon size={11} className="text-primary-600" />
          100 m proof zone
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[13px] font-semibold text-surface-500 shadow-sm sm:hidden">
          Visit {visitRef(task.id)}
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-surface-600"><span className="font-semibold text-surface-900">Requester quote: </span>{formatVisitQuote(task.visitPlan, task.quotedPricePaise)}. Agree your fee separately before accepting.</p>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="space-y-5 lg:col-span-7">
          <section className="overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-card">
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
              <div>
                <p className="text-[13px] font-bold text-primary-700">
                  Property pin
                </p>
                <p className="mt-0.5 text-[13px] font-medium text-surface-500">
                  {task.targetLat.toFixed(5)}, {task.targetLng.toFixed(5)}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => void copyPin()}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-surface-100 px-3 text-[13px] font-bold text-surface-600 transition-colors hover:bg-surface-200"
                  aria-label="Copy pin coordinates"
                >
                  <CopyIcon size={12} />
                  Copy
                </button>
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-primary-50 px-3 text-[13px] font-bold text-primary-800 transition-colors hover:bg-primary-100"
                >
                  <NavigationIcon size={13} />
                  Go
                </a>
              </div>
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
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary-800">
                <ShieldCheckIcon size={12} />
                Submission GPS must be within 100 m
              </span>
              <span className="text-[13px] font-medium text-primary-600">
                Checked by the server
              </span>
            </div>
          </section>

          {task.evidenceImage ? (
            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[13px] font-bold text-primary-700">
                    Submitted proof
                  </p>
                  <h2 className="mt-0.5 text-[1.45rem] font-extrabold tracking-[-0.03em] text-surface-950">
                    Your photo
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setImageOpen(true)}
                  className="inline-flex min-h-10 items-center rounded-full bg-primary-700 px-3.5 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-primary-800"
                >
                  View photo
                </button>
              </div>

              <figure className="overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-card">
                <button
                  type="button"
                  onClick={() => setImageOpen(true)}
                  className="group relative block w-full cursor-zoom-in bg-surface-950 p-2 text-left sm:p-3"
                  aria-label="Open the proof photo full screen"
                >
                  <EvidenceImage taskId={task.id} version={task.evidenceSubmittedAt}
                    alt="Proof submitted for this visit"
                    className="max-h-[30rem] w-full rounded-xl bg-surface-950 object-contain"
                  />
                  <span className="absolute bottom-5 right-5 inline-flex items-center gap-1.5 rounded-full bg-surface-950/75 px-3 py-1.5 text-[13px] font-bold text-white backdrop-blur-sm transition-colors group-hover:bg-surface-950/90">
                    <CameraIcon size={12} />
                    Tap to enlarge
                  </span>
                </button>
                <figcaption className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-[13px] font-bold text-primary-800">
                    <CheckIcon size={11} />
                    Accepted within 100 m
                  </span>
                  {task.evidenceSource === "CAMERA" && task.evidenceCapturedAt && (
                    <span className="text-[13px] font-medium text-surface-500">
                      Device capture time: {formatDateTime(task.evidenceCapturedAt)}
                    </span>
                  )}
                </figcaption>
              </figure>

              {task.evidenceAccuracy != null && (
                <p className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-surface-500">
                  <ShieldCheckIcon size={12} className="text-primary-600" />
                  GPS accuracy ±{Math.round(task.evidenceAccuracy)} m
                </p>
              )}
            </section>
          ) : (
            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[13px] font-bold text-primary-700">
                    Proof
                  </p>
                  <h2 className="mt-0.5 text-[1.45rem] font-extrabold tracking-[-0.03em] text-surface-950">
                    Your photo
                  </h2>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-[13px] font-semibold text-surface-500 shadow-sm">
                  Not yet
                </span>
              </div>
              <div className="crosshair flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-surface-300 bg-white/70 p-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-100">
                  <CameraIcon size={22} className="text-surface-400" />
                </span>
                <p className="max-w-sm text-[14px] leading-relaxed text-surface-500">
                  Start the visit, travel to the pin, then take the proof photo.
                  The server checks your distance when you upload.
                </p>
              </div>
            </section>
          )}
          <VisitReportSummary task={task} />
        </div>

        <aside className="space-y-5 lg:col-span-5">
          <VisitManagement task={task} />
          <section className="rounded-3xl bg-primary-900 p-5 text-white shadow-card">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-bold text-accent-300">Next step</p>
              <span className="h-2 w-2 rounded-full bg-accent-400" aria-hidden="true" />
            </div>

            {task.status === "OPEN" && (
              <>
                <h2 className="mt-2 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em]">
                  Take this visit?
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-primary-200">
                  You’ll be assigned to this property. Check the map and make sure
                  you can reach the pin before accepting.
                </p>
                <Button
                  onClick={() => setConfirmAccept(true)}
                  variant="inverse"
                  size="sm"
                  className="mt-4 w-full min-h-11"
                >
                  Accept visit
                </Button>
                {distance !== null && (
                  <p className="mt-3 flex items-start gap-1.5 text-[13px] leading-relaxed text-primary-300">
                    <NavigationIcon size={12} className="mt-0.5 flex-shrink-0 text-accent-300" />
                    {distance < 1
                      ? "You’re already close to this pin."
                      : `The pin is about ${distance.toFixed(1)} km from your last known location.`}
                  </p>
                )}
                <p className="mt-2 flex items-start gap-1.5 text-[13px] leading-relaxed text-primary-300">
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
                <p className="mt-2 text-[13px] leading-relaxed text-primary-200">
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
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/25 px-3 text-[14px] font-bold text-white transition-colors hover:bg-white/10"
                >
                  <MapPinIcon size={14} />
                  Open directions first
                </a>
                <p className="mt-3 flex items-start gap-1.5 text-[13px] leading-relaxed text-primary-300">
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

                <p className="mt-2 text-sm leading-relaxed text-primary-200">Location sharing continues as you move between pages. Check its status at the top of the screen.</p>

                <div className="mt-4 space-y-2">
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/25 px-3 text-[14px] font-bold text-white transition-colors hover:bg-white/10"
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

                <p className="mt-3 flex items-start gap-1.5 text-[13px] leading-relaxed text-primary-300">
                  <AlertTriangleIcon size={13} className="mt-0.5 flex-shrink-0 text-warning-400" />
                  Proof can only be submitted within 100 metres of the pin.
                </p>
              </>
            )}

            {task.status === "SUBMITTED" && (
              <>
                <p className="mt-2 flex items-center gap-1.5 text-[13px] font-bold text-accent-300">
                  <CheckIcon size={12} />
                  Proof submitted
                </p>
                <h2 className="mt-1.5 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em]">
                  Waiting on the requester.
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-primary-200">
                  The requester is reviewing your photo. The visit closes once
                  they mark it complete.
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

            {task.status === "COMPLETED" && (
              <>
                <p className="mt-2 flex items-center gap-1.5 text-[13px] font-bold text-accent-300">
                  <CheckIcon size={12} />
                  Visit complete
                </p>
                <h2 className="mt-1.5 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em]">
                  Good work. This one’s done.
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-primary-200">
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
            {task.status === "CANCELLED" && <><h2 className="mt-2 text-xl font-bold">This visit was cancelled.</h2><p className="mt-2 text-sm text-primary-200">The requester’s reason is saved above.</p><Button to="/captain/dashboard" variant="inverse" className="mt-4">Find another visit</Button></>}
          </section>

          <section className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
            <p className="text-[13px] font-bold text-primary-700">
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
                  <dt className="text-[13px] font-semibold text-surface-500">
                    {row.label}
                  </dt>
                  <dd className="max-w-[60%] break-words text-right text-[13px] font-bold text-surface-900">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-[13px] font-semibold text-primary-700 hover:text-primary-800"
            >
              <MapPinIcon size={12} />
              Open directions in Google Maps
            </a>
          </section>

          <section className="rounded-2xl border border-warning-200 bg-warning-50 p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangleIcon size={15} className="mt-0.5 flex-shrink-0 text-warning-600" />
              <div>
                <p className="text-[13px] font-bold text-warning-800">
                  How proof is checked
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-warning-800/80">
                  Capture the photo inside PinProof, within 100 metres of the
                  pin. A gallery upload is allowed only when the camera can’t be
                  used. The distance check still applies.
                </p>
              </div>
            </div>
        </section>
          <VisitHistory task={task} />
        </aside>
      </div>

      {/* Sticky mobile action */}
      <div className="mobile-action-bar sm:hidden">
        <div className="flex items-center gap-2 rounded-2xl border border-surface-200 bg-white/95 p-2 shadow-elevated backdrop-blur">
          <div className="min-w-0 flex-1 pl-1.5">
            <p className="text-sm font-semibold text-surface-500">
              {task.status === "OPEN"
                ? "Available now"
                : task.status === "ACCEPTED"
                  ? "Ready to go"
                  : task.status === "IN_PROGRESS"
                    ? "On the visit"
                    : task.status === "SUBMITTED"
                      ? "Proof sent"
                       : task.status === "CANCELLED" ? "Visit cancelled" : "Visit complete"}
            </p>
            <p className="truncate text-[14px] font-bold text-surface-900">
              {task.status === "OPEN"
                ? "Accept to claim this visit."
                : task.status === "ACCEPTED"
                  ? "Start when you set off."
                  : task.status === "IN_PROGRESS"
                    ? "Reach the pin and take the photo."
                    : task.status === "SUBMITTED"
                      ? "Waiting on the requester."
                       : task.status === "CANCELLED" ? "This request has been closed." : "Nice work. Find the next one."}
            </p>
          </div>
          {task.status === "OPEN" ? (
            <Button
              type="button"
              onClick={() => setConfirmAccept(true)}
              variant="accent"
              size="sm"
              className="min-h-11 flex-shrink-0"
            >
              Accept
            </Button>
          ) : task.status === "ACCEPTED" ? (
            <Button
              type="button"
              onClick={() => void handleStart()}
              isLoading={startTask.isPending}
              variant="accent"
              size="sm"
              className="min-h-11 flex-shrink-0"
            >
              Start visit
            </Button>
          ) : task.status === "IN_PROGRESS" ? (
            <Button
              to={`/captain/tasks/${task.id}/upload`}
              variant="accent"
              size="sm"
              className="min-h-11 flex-shrink-0"
            >
              <CameraIcon size={13} />
              Photo
            </Button>
          ) : (
            <Button
              to="/captain/dashboard"
              variant="accent"
              size="sm"
              className="min-h-11 flex-shrink-0"
            >
              Find work
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={imageOpen}
        onClose={() => setImageOpen(false)}
        title="Proof photo"
        description={`Visit ${visitRef(task.id)} · ${task.title}`}
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-surface-700">{task.evidenceSource === "CAMERA" ? "Taken with the in-browser camera. Capture time and GPS are device-reported." : task.evidenceSource === "UPLOAD" ? "Uploaded image. Original capture time and location are not verified." : "Capture method was not recorded for this visit."}</p>
          <div className="overflow-hidden rounded-2xl bg-surface-950 p-2">
            <EvidenceImage taskId={task.id} version={task.evidenceSubmittedAt}
              alt="Proof submitted for this visit"
              className="mx-auto max-h-[62dvh] w-full rounded-xl object-contain"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Device capture time", task.evidenceSource === "CAMERA" && task.evidenceCapturedAt ? formatDateTime(task.evidenceCapturedAt) : "Not recorded"],
              ["GPS accuracy", task.evidenceAccuracy != null ? `±${Math.round(task.evidenceAccuracy)} m` : "Not recorded"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5"
              >
                <p className="text-[13px] font-semibold text-surface-500">{label}</p>
                <p className="mt-0.5 text-[14px] font-bold text-surface-900">{value}</p>
              </div>
            ))}
          </div>
          <EvidenceDownload taskId={task.id} version={task.evidenceSubmittedAt} />
        </div>
      </Modal>

      <Modal
        open={confirmAccept}
        onClose={() => setConfirmAccept(false)}
        title="Accept this visit?"
        description="You’ll be assigned to this property and expected to visit within a few hours."
        size="sm"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmAccept(false)}
              disabled={acceptTask.isPending}
            >
              Not yet
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => void handleAccept()}
              isLoading={acceptTask.isPending}
            >
              Accept visit
            </Button>
          </div>
        }
      >
        <ul className="space-y-2.5">
          {[
            "Travel to the exact pin before taking the photo.",
            "Proof must be captured within 100 m of the property.",
            "The requester follows your live trip once you start.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                <CheckCircleIcon size={12} />
              </span>
              <span className="text-[14px] leading-relaxed text-surface-600">
                {item}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-surface-50 px-3 py-2.5">
          <span className="text-[13px] font-semibold text-surface-500">
            Property pin
          </span>
          <span className="tabular-nums text-[13px] font-bold text-surface-800">
            {task.targetLat.toFixed(5)}, {task.targetLng.toFixed(5)}
          </span>
        </div>
      </Modal>
    </div>
  );
}
