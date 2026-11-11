import { targetIcon } from "../../components/MapIcons";
import { MapView } from "../../components/MapView";
import { formatVisitQuote } from "../../content/visitPlans";
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  StatusBadge,
  PageLoader,
  useToast,
  Modal,
  CheckIcon,
  CheckCircleIcon,
  MapPinIcon,
  CameraIcon,
  NavigationIcon,
  ClockIcon,
  ShieldCheckIcon,
  ShareIcon,
} from "../../components";
import { useTaskDetail, useCompleteTask, useTaskUpdates } from "../../hooks";
import { useQueryClient } from "@tanstack/react-query";
import type { Task, TaskStatus } from "../../types";
import { EvidenceImage, EvidenceDownload } from "../../components/EvidenceImage";
import { STATUS_ORDER, TASK_STEPS, visitRef } from "../../utils/task";
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

export function UserTaskDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: task, isLoading, isError, refetch } = useTaskDetail(id!);
  const completeTask = useCompleteTask();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  useTaskUpdates(id, {
    onAccepted: (data) => {
      addToast("info", `${data.captainName} accepted your visit.`);
      queryClient.invalidateQueries({ queryKey: ["task", id] });
    },
    onStarted: () => {
      addToast("info", "Your inspector is on the way.");
      queryClient.invalidateQueries({ queryKey: ["task", id] });
    },
    onSubmitted: () => {
      addToast("success", "Proof submitted — review the photo now.");
      queryClient.invalidateQueries({ queryKey: ["task", id] });
    },
  });

  if (isLoading) return <PageLoader />;

  if (!task) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-[14px] font-bold text-primary-700">Visit unavailable</p>
        <h1 className="mt-2 text-[2rem] font-extrabold tracking-[-0.035em] text-surface-950">
          We couldn’t find that visit.
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-surface-600">
          It may have been removed, or you may not have access to it.
        </p>
        <Button to="/user/tasks" className="mt-6">
          Back to my visits
        </Button>
        <Button variant="secondary" className="mt-3" onClick={() => void refetch()}>Try again</Button>
      </div>
    );
  }

  const handleComplete = async () => {
    try {
      await completeTask.mutateAsync(task.id);
      setConfirmOpen(false);
      addToast("success", "Visit marked as completed.");
    } catch (err) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "Could not complete this visit. Please try again.";
      addToast("error", errorMsg);
    }
  };

  const shareVisit = async () => {
    const url = `${window.location.origin}/user/tasks/${task.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `PinProof visit: ${task.title}`,
          text: "Visit link for the owner’s PinProof account.",
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      addToast("success", "Owner-only visit link copied. Recipients need the owner’s account.");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      addToast("error", "Couldn’t share the link. Copy it from the address bar.");
    }
  };
  const currentStep = STATUS_ORDER[task.status];
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${task.targetLat},${task.targetLng}`;
  const mobileStep = mobileNextStep(task, () => void shareVisit());

  return (
    <div className="mx-auto max-w-6xl pb-24 sm:pb-0">
      {isError && <QueryNotice retry={() => void refetch()} stale />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button to="/user/tasks" variant="ghost" size="sm" className="-ml-2 min-h-11">
          <span aria-hidden="true">←</span>
          My visits
        </Button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void shareVisit()}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white px-3 text-[13px] font-bold text-primary-700 shadow-sm transition-colors hover:bg-primary-50"
          >
            <ShareIcon size={13} />
            Copy owner link
          </button>
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
        <div className="flex flex-shrink-0 items-center gap-2">
          <StatusBadge status={task.status} size="md" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[13px] font-semibold text-surface-500 shadow-sm">
          <ClockIcon size={11} className="text-primary-600" />
          Updated {formatRelativeTime(task.updatedAt)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[13px] font-semibold text-surface-500 shadow-sm">
          <CameraIcon size={11} className="text-primary-600" />
          GPS proof required
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[13px] font-semibold text-surface-500 shadow-sm sm:hidden">
          <MapPinIcon size={11} className="text-primary-600" />
          Visit {visitRef(task.id)}
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-surface-600"><span className="font-semibold text-surface-900">Visit quote: </span>{formatVisitQuote(task.visitPlan, task.quotedPricePaise)}. Payment is not collected here.</p>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
        {/* Map + proof */}
        <div className="space-y-5 lg:col-span-7">

          {task.evidenceImage ? (
            <section id="evidence" className="scroll-mt-24">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[13px] font-bold text-primary-700">
                    Your proof
                  </p>
                  <h2 className="mt-0.5 text-[1.45rem] font-extrabold tracking-[-0.03em] text-surface-950">
                    Photo from the visit
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
                    alt="Property proof submitted by the inspector"
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
                    Device GPS within 100 m
                  </span>
                  <span className="text-[13px] font-medium text-surface-500">
                    Photo · submission GPS
                  </span>
                </figcaption>
              </figure>

              <p className="mt-3 text-sm leading-relaxed text-surface-600">{task.evidenceSource === "CAMERA" ? "Taken in the browser camera. Capture time and GPS are reported by the inspector’s device." : task.evidenceSource === "UPLOAD" ? "Uploaded photo. Its original capture time and location are not verified; the GPS below was recorded for submission." : "Capture method was not recorded for this visit."}</p>

              <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  ["Device capture time", task.evidenceSource === "CAMERA" && task.evidenceCapturedAt ? formatDateTime(task.evidenceCapturedAt) : "Not recorded"],
                  ["Submitted", task.evidenceSubmittedAt ? formatDateTime(task.evidenceSubmittedAt) : "Not recorded"],
                  ["GPS accuracy", task.evidenceAccuracy != null ? `±${Math.round(task.evidenceAccuracy)} m` : "Not recorded"],
                  ["Submission GPS", task.evidenceLat != null && task.evidenceLng != null ? `${task.evidenceLat.toFixed(5)}, ${task.evidenceLng.toFixed(5)}` : "Not recorded"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 shadow-sm"
                  >
                    <dt className="text-[13px] font-semibold text-surface-500">
                      {label}
                    </dt>
                    <dd className="mt-0.5 text-[14px] font-bold text-surface-900">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              {task.evidenceLat != null && task.evidenceLng != null && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${task.evidenceLat},${task.evidenceLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-[13px] font-semibold text-primary-700 hover:text-primary-800"
                >
                  <MapPinIcon size={12} />
                  View the submitted GPS location
                </a>
              )}
            </section>
          ) : (
            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[13px] font-bold text-primary-700">
                    Your proof
                  </p>
                  <h2 className="mt-0.5 text-[1.45rem] font-extrabold tracking-[-0.03em] text-surface-950">
                    Photo from the visit
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
                <p className="max-w-xs text-[14px] leading-relaxed text-surface-500">
                  The photo, capture method, and submission GPS will appear here
                  once the inspector submits the visit.
                </p>
              </div>
            </section>
          )}

          <VisitReportSummary task={task} />

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
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-primary-50 px-3 text-[13px] font-bold text-primary-800 transition-colors hover:bg-primary-100"
              >
                <MapPinIcon size={13} />
                Google Maps
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
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary-800">
                <ShieldCheckIcon size={12} />
                Submission GPS must be within 100 m
              </span>
              <span className="text-[13px] font-medium text-primary-600">
                Checked by the server
              </span>
            </div>
          </section>

        </div>

        {/* Side column */}
        <aside className="space-y-5 lg:col-span-5">
          <VisitManagement task={task} />
          <section className="rounded-3xl bg-primary-900 p-5 text-white shadow-card">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-bold text-accent-300">Next step</p>
              <span className="h-2 w-2 rounded-full bg-accent-400" aria-hidden="true" />
            </div>
            <ActionPanel
              task={task}
              onComplete={() => setConfirmOpen(true)}
              isCompleting={completeTask.isPending}
            />
          </section>

          {task.status !== "CANCELLED" && <section className="rounded-3xl border border-surface-200 bg-white p-5 shadow-card">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[13px] font-bold text-primary-700">
                  Visit progress
                </p>
                <h2 className="mt-0.5 text-[1.3rem] font-extrabold tracking-[-0.025em] text-surface-950">
                  Where things stand
                </h2>
              </div>
              <span className="rounded-full bg-surface-100 px-2.5 py-1 text-[13px] font-bold text-surface-500">
                Step {currentStep + 1} of 5
              </span>
            </div>

            <ol className="mt-4 space-y-0.5">
              {TASK_STEPS.map((step, index) => {
                const done = STATUS_ORDER[step.status] < currentStep;
                const active = step.status === task.status;

                return (
                  <li
                    key={step.status}
                    className={`flex items-start gap-3 rounded-xl px-2 py-2.5 ${
                      active ? "bg-accent-50" : ""
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold ${
                        done
                          ? "bg-primary-700 text-white"
                          : active
                            ? "bg-accent-400 text-primary-950"
                            : "bg-surface-100 text-surface-400"
                      }`}
                    >
                      {done ? <CheckIcon size={11} /> : index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[14px] font-bold ${
                          active
                            ? "text-primary-900"
                            : done
                              ? "text-surface-800"
                              : "text-surface-500"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-surface-500">
                        {step.description}
                      </p>
                    </div>
                    {active && (
                      <span className="mt-0.5 rounded-full bg-white px-2 py-0.5 text-[13px] font-bold text-primary-700">
                        Now
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>}

          <VisitHistory task={task} />

          <section className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
            <p className="text-[13px] font-bold text-primary-700">
              Visit details
            </p>
            <dl className="mt-2">
              {[
                {
                  label: "Inspector",
                  value: task.acceptedBy?.name || "Not assigned yet",
                },
                {
                  label: "Requested by",
                  value: task.createdBy.name,
                },
                {
                  label: "Property pin",
                  value: `${task.targetLat.toFixed(5)}, ${task.targetLng.toFixed(5)}`,
                },
                {
                  label: "Proof rule",
                  value: "Within 100 m of pin",
                },
                {
                  label: "Last update",
                  value: formatDateTime(task.updatedAt),
                },
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
            <p className="mt-2 flex items-start gap-1.5 text-[13px] leading-relaxed text-surface-500">
              <ClockIcon size={12} className="mt-0.5 flex-shrink-0" />
              This page updates automatically as the visit moves.
            </p>
          </section>
        </aside>
      </div>

      {/* Sticky mobile action */}
      <div className="mobile-action-bar sm:hidden">
        <div className="flex items-center gap-2 rounded-2xl border border-surface-200 bg-white/95 p-2 shadow-elevated backdrop-blur">
          <div className="min-w-0 flex-1 pl-1.5">
            <p className="text-sm font-semibold text-surface-500">
              {mobileStep.eyebrow}
            </p>
            <p className="truncate text-[14px] font-bold text-surface-900">
              {mobileStep.label}
            </p>
          </div>
          {mobileStep.action}
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
              alt="Property proof submitted by the inspector"
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
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Complete this visit?"
        description="Only close the visit once you’re happy with the proof photo and its details."
        size="sm"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              disabled={completeTask.isPending}
            >
              Not yet
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => void handleComplete()}
              isLoading={completeTask.isPending}
            >
              Yes, mark complete
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3 rounded-2xl bg-primary-50 p-3.5">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-700 text-white">
            <CheckCircleIcon size={19} />
          </span>
          <div>
            <p className="text-[14px] font-bold text-primary-950">
              The proof will stay in your history.
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-primary-800/80">
              The photo, GPS location, and capture time are saved to this visit
              and can be reopened anytime.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function mobileNextStep(task: Task, onShare: () => void) {
  if (task.revisionNote) return { eyebrow: "Revision requested", label: "Waiting for updated proof.", action: <Button to={`/user/tasks/${task.id}#evidence`} variant="secondary" size="sm">Previous proof</Button> };
  switch (task.status) {
    case "CANCELLED":
      return { eyebrow: "Visit cancelled", label: "You can request a new visit.", action: <Button to="/user/create-task" size="sm">Book again</Button> };
    case "ACCEPTED":
      return { eyebrow: "Inspector assigned", label: "We’ll update you when the visit starts.", action: <Button onClick={onShare} variant="secondary" size="sm">Copy owner link</Button> };
    case "SUBMITTED":
      return {
        eyebrow: "Proof ready",
        label: "Review the photo, then close the visit.",
        action: (
          <Button
            to={`/user/tasks/${task.id}#evidence`}
            variant="accent"
            size="sm"
            className="min-h-11 flex-shrink-0"
          >
            Review
          </Button>
        ),
      };
    case "IN_PROGRESS":
      return {
        eyebrow: "On the way",
        label: "Your inspector is sharing location.",
        action: (
          <Button
            to={`/user/track/${task.id}`}
            variant="accent"
            size="sm"
            className="min-h-11 flex-shrink-0"
          >
            <NavigationIcon size={13} />
            Track live
          </Button>
        ),
      };
    case "COMPLETED":
      return {
        eyebrow: "Visit complete",
        label: "Your proof is saved.",
        action: (
          <Button
            to="/user/create-task"
            variant="accent"
            size="sm"
            className="min-h-11 flex-shrink-0"
          >
            Book again
          </Button>
        ),
      };
    default:
      return {
        eyebrow: "Visit in progress",
        label: "We’ll update you when someone accepts.",
        action: (
          <Button
            type="button"
            onClick={onShare}
            variant="secondary"
            size="sm"
            className="min-h-11 flex-shrink-0"
          >
            <ShareIcon size={13} />
            Copy owner link
          </Button>
        ),
      };
  }
}

function ActionPanel({
  task,
  onComplete,
  isCompleting,
}: {
  task: Task;
  onComplete: () => void;
  isCompleting: boolean;
}) {
  const status: TaskStatus = task.status;

  if (status === "CANCELLED") return <><h2 className="mt-2 text-xl font-bold">This visit is closed.</h2><p className="mt-2 text-sm text-primary-200">The cancellation and its reason are saved in your visit history.</p><Button to="/user/create-task" variant="inverse" className="mt-4">Book another visit</Button></>;

  if (task.revisionNote) return <><h2 className="mt-2 text-xl font-bold">Waiting for revised proof.</h2><p className="mt-2 text-sm text-primary-200">Your inspector can read your feedback and submit a replacement report. We’ll update this page when it arrives.</p></>;

  if (status === "SUBMITTED") {
    return (
      <>
        <h2 className="mt-2 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em]">
          Your proof is ready.
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-primary-200">
          Check the photo and location details. Mark the visit complete once
          you’re happy.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a
            href="#evidence"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/25 px-3 text-[14px] font-bold text-white transition-colors hover:bg-white/10"
          >
            Review proof
          </a>
          <Button
            onClick={onComplete}
            isLoading={isCompleting}
            variant="inverse"
            size="sm"
            className="min-h-11 flex-1"
          >
            Mark complete
          </Button>
        </div>
      </>
    );
  }

  if (status === "IN_PROGRESS") {
    return (
      <>
        <h2 className="mt-2 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em]">
          An inspector is on the way.
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-primary-200">
          Follow the trip live. The proof photo will appear here once they reach
          the property.
        </p>
        <Button
          to={`/user/track/${task.id}`}
          variant="inverse"
          size="sm"
          className="mt-4 w-full min-h-11"
        >
          <NavigationIcon size={14} />
          Track live visit
        </Button>
      </>
    );
  }

  if (status === "ACCEPTED") {
    return (
      <>
        <h2 className="mt-2 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em]">
          An inspector has accepted.
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-primary-200">
          This page will update when they start travelling to the property.
        </p>
        <p className="mt-4 flex items-start gap-2 border-t border-white/15 pt-3.5 text-[13px] leading-relaxed text-primary-300">
          <ClockIcon size={13} className="mt-0.5 flex-shrink-0" />
          Timing depends on the inspector’s availability and property access.
        </p>
      </>
    );
  }

  if (status === "COMPLETED") {
    return (
      <>
        <p className="mt-2 flex items-center gap-1.5 text-[13px] font-bold text-accent-300">
          <CheckIcon size={12} />
          Visit complete
        </p>
        <h2 className="mt-1.5 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em]">
          All done. Your proof is saved.
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-primary-200">
          The photo and visit details stay in your dashboard for as long as you
          need them.
        </p>
        <Button
          to="/user/create-task"
          variant="inverse"
          size="sm"
          className="mt-4 w-full min-h-11"
        >
          Book another visit
        </Button>
      </>
    );
  }

  return (
    <>
      <h2 className="mt-2 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em]">
        Waiting for a local inspector.
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-primary-200">
        Your request is visible to inspectors nearby. Most visits are accepted
        within a few hours.
      </p>
      <p className="mt-4 flex items-start gap-2 border-t border-white/15 pt-3.5 text-[13px] leading-relaxed text-primary-300">
        <MapPinIcon size={13} className="mt-0.5 flex-shrink-0" />
        You can leave this page. It updates automatically when someone accepts.
      </p>
    </>
  );
}
