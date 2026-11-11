import type { Task } from "../types";

const LABELS: Record<string, string> = {
  CREATED: "Visit requested", UPDATED: "Request updated", ACCEPTED: "Inspector assigned",
  STARTED: "Visit started", SUBMITTED: "Proof submitted", COMPLETED: "Proof approved · visit completed",
  CANCELLED: "Visit cancelled", RELEASED: "Inspector released the visit", REVISION_REQUESTED: "Revised proof requested",
};

export function VisitHistory({ task }: { task: Task }) {
  if (!task.events?.length) return null;
  return <section className="rounded-2xl border border-surface-200 bg-white p-5">
    <h2 className="font-bold text-surface-900">Visit history</h2>
    <ol className="mt-4 space-y-4">
      {task.events.map((event) => <li key={event.id} className="border-l-2 border-accent-400 pl-3">
        <p className="text-sm font-semibold text-surface-900">{LABELS[event.action] ?? "Visit updated"}</p>
        <time dateTime={event.createdAt} className="mt-1 block text-xs text-surface-600">{new Date(event.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</time>
        {event.note && <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-surface-600">{event.note}</p>}
      </li>)}
    </ol>
  </section>;
}
