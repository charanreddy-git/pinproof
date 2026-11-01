import { useParams } from "react-router-dom";
import {
  Button,
  StatusBadge,
  MapView,
  targetIcon,
  PageLoader,
  useToast,
  CheckIcon,
  MapPinIcon,
  CameraIcon,
  NavigationIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "../../components";
import { useTaskDetail, useCompleteTask, useTaskUpdates } from "../../hooks";
import { useQueryClient } from "@tanstack/react-query";
import type { TaskStatus } from "../../types";
import { getApiOrigin } from "../../utils/api";
import { STATUS_ORDER, TASK_STEPS, visitRef } from "../../utils/task";

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
  const { data: task, isLoading, isError } = useTaskDetail(id!);
  const completeTask = useCompleteTask();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

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
        <Button to="/user/tasks" className="mt-6">
          Back to my visits
        </Button>
      </div>
    );
  }

  const handleComplete = async () => {
    try {
      await completeTask.mutateAsync(task.id);
      addToast("success", "Visit marked as completed.");
    } catch (err) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "Could not complete this visit. Please try again.";
      addToast("error", errorMsg);
    }
  };

  const baseUrl = getApiOrigin();
  const currentStep = STATUS_ORDER[task.status];
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${task.targetLat},${task.targetLng}`;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button to="/user/tasks" variant="ghost" size="sm" className="-ml-2 min-h-11">
          <span aria-hidden="true">←</span>
          My visits
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
        {/* Map + proof */}
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
            <section id="evidence" className="scroll-mt-24">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11.5px] font-bold text-primary-700">
                    Your proof
                  </p>
                  <h2 className="mt-0.5 text-[1.45rem] font-extrabold tracking-[-0.03em] text-surface-950">
                    Photo from the visit
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
                    alt="Property proof submitted by the inspector"
                    className="max-h-[30rem] w-full rounded-xl bg-surface-950 object-contain"
                  />
                </div>
                <figcaption className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-[10.5px] font-bold text-primary-800">
                    <CheckIcon size={11} />
                    GPS verified within 100 m
                  </span>
                  <span className="text-[10px] font-medium text-surface-500">
                    Photo · GPS · time
                  </span>
                </figcaption>
              </figure>

              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  ["Captured", task.evidenceCapturedAt ? formatDateTime(task.evidenceCapturedAt) : "Not recorded"],
                  ["Submitted", task.evidenceSubmittedAt ? formatDateTime(task.evidenceSubmittedAt) : "Not recorded"],
                  ["GPS accuracy", task.evidenceAccuracy != null ? `±${Math.round(task.evidenceAccuracy)} m` : "Not recorded"],
                  ["Photo location", task.evidenceLat != null && task.evidenceLng != null ? `${task.evidenceLat.toFixed(5)}, ${task.evidenceLng.toFixed(5)}` : "Not recorded"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 shadow-sm"
                  >
                    <dt className="text-[10px] font-semibold text-surface-500">
                      {label}
                    </dt>
                    <dd className="mt-0.5 text-[12px] font-bold text-surface-900">
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
                  className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-[11.5px] font-semibold text-primary-700 hover:text-primary-800"
                >
                  <MapPinIcon size={12} />
                  See where the photo was taken
                </a>
              )}
            </section>
          ) : (
            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11.5px] font-bold text-primary-700">
                    Your proof
                  </p>
                  <h2 className="mt-0.5 text-[1.45rem] font-extrabold tracking-[-0.03em] text-surface-950">
                    Photo from the visit
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
                <p className="max-w-xs text-[12px] leading-relaxed text-surface-500">
                  The proof photo, capture time, and GPS details will appear here
                  once the inspector submits the visit.
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Side column */}
        <aside className="space-y-5 lg:col-span-5">
          <section className="rounded-3xl bg-primary-900 p-5 text-white shadow-card">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold text-accent-300">Next step</p>
              <span className="h-2 w-2 rounded-full bg-accent-400" aria-hidden="true" />
            </div>
            <ActionPanel
              task={task}
              onComplete={handleComplete}
              isCompleting={completeTask.isPending}
            />
          </section>

          <section className="rounded-3xl border border-surface-200 bg-white p-5 shadow-card">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11.5px] font-bold text-primary-700">
                  Visit progress
                </p>
                <h2 className="mt-0.5 text-[1.3rem] font-extrabold tracking-[-0.025em] text-surface-950">
                  Where things stand
                </h2>
              </div>
              <span className="rounded-full bg-surface-100 px-2.5 py-1 text-[10px] font-bold text-surface-500">
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
                      className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${
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
                        className={`text-[12.5px] font-bold ${
                          active
                            ? "text-primary-900"
                            : done
                              ? "text-surface-800"
                              : "text-surface-500"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="mt-0.5 text-[10.5px] leading-relaxed text-surface-500">
                        {step.description}
                      </p>
                    </div>
                    {active && (
                      <span className="mt-0.5 rounded-full bg-white px-2 py-0.5 text-[9px] font-bold text-primary-700">
                        Now
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
            <p className="text-[11.5px] font-bold text-primary-700">
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
                  <dt className="text-[11px] font-semibold text-surface-500">
                    {row.label}
                  </dt>
                  <dd className="max-w-[60%] break-words text-right text-[11.5px] font-bold text-surface-900">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-surface-500">
              <ClockIcon size={12} className="mt-0.5 flex-shrink-0" />
              This page updates automatically as the visit moves.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ActionPanel({
  task,
  onComplete,
  isCompleting,
}: {
  task: { status: TaskStatus; id: string };
  onComplete: () => void;
  isCompleting: boolean;
}) {
  if (task.status === "SUBMITTED") {
    return (
      <>
        <h2 className="mt-2 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em]">
          Your proof is ready.
        </h2>
        <p className="mt-2 text-[11.5px] leading-relaxed text-primary-200">
          Check the photo and location details. Mark the visit complete once
          you’re happy.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a
            href="#evidence"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/25 px-3 text-[12px] font-bold text-white transition-colors hover:bg-white/10"
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

  if (task.status === "IN_PROGRESS") {
    return (
      <>
        <h2 className="mt-2 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em]">
          An inspector is on the way.
        </h2>
        <p className="mt-2 text-[11.5px] leading-relaxed text-primary-200">
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

  if (task.status === "ACCEPTED") {
    return (
      <>
        <h2 className="mt-2 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em]">
          An inspector has accepted.
        </h2>
        <p className="mt-2 text-[11.5px] leading-relaxed text-primary-200">
          This page will update when they start travelling to the property.
        </p>
        <p className="mt-4 flex items-start gap-2 border-t border-white/15 pt-3.5 text-[10.5px] leading-relaxed text-primary-300">
          <ClockIcon size={13} className="mt-0.5 flex-shrink-0" />
          Most visits begin within a few hours of acceptance.
        </p>
      </>
    );
  }

  if (task.status === "COMPLETED") {
    return (
      <>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-accent-300">
          <CheckIcon size={12} />
          Visit complete
        </p>
        <h2 className="mt-1.5 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em]">
          All done. Your proof is saved.
        </h2>
        <p className="mt-2 text-[11.5px] leading-relaxed text-primary-200">
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
      <p className="mt-2 text-[11.5px] leading-relaxed text-primary-200">
        Your request is visible to inspectors nearby. Most visits are accepted
        within a few hours.
      </p>
      <p className="mt-4 flex items-start gap-2 border-t border-white/15 pt-3.5 text-[10.5px] leading-relaxed text-primary-300">
        <MapPinIcon size={13} className="mt-0.5 flex-shrink-0" />
        You can leave this page — it updates automatically when someone accepts.
      </p>
    </>
  );
}
