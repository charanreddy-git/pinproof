import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts";
import { useChangeTask, useUpdateTask } from "../hooks/useTasks";
import type { Task } from "../types";
import { Button, Input, Modal } from "./ui";
import { useToast } from "./ui/Toast";

const ACTIONS = {
  cancel: { title: "Cancel visit", description: "The visit will close and your inspector will see the reason. You can book another visit anytime.", label: "Why are you cancelling?", success: "Visit cancelled." },
  release: { title: "Release visit", description: "This request will become available to another inspector. You can only release a visit before starting it.", label: "Why can’t you take this visit?", success: "Visit released for another inspector." },
  revision: { title: "Request revised proof", description: "Tell the inspector what needs another look. They’ll return to the proof step and submit an updated report.", label: "What needs to be checked again?", success: "Revision requested. Your inspector can now update the proof." },
};

export function VisitManagement({ task }: { task: Task }) {
  const { user } = useAuth();
  const owner = user?.id === task.createdById;
  const [action, setAction] = useState<keyof typeof ACTIONS | "edit" | null>(null);
  const change = useChangeTask();
  const update = useUpdateTask();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const busy = change.isPending || update.isPending;
  const contact = owner ? task.acceptedBy : task.status !== "OPEN" ? task.createdBy : null;
  const canEdit = owner && task.status === "OPEN";
  const canCancel = owner && ["OPEN", "ACCEPTED"].includes(task.status);
  const canRevise = owner && task.status === "SUBMITTED";
  const canRelease = !owner && task.acceptedById === user?.id && task.status === "ACCEPTED";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!action || busy) return;
    const data = new FormData(event.currentTarget);
    try {
      if (action === "edit") {
        await update.mutateAsync({ id: task.id, input: {
          title: String(data.get("title")), description: String(data.get("description")),
          latitude: Number(data.get("latitude")), longitude: Number(data.get("longitude")),
        } });
        addToast("success", "Visit details updated.");
      } else {
        await change.mutateAsync({ id: task.id, action, reason: String(data.get("reason")) });
        addToast("success", ACTIONS[action].success);
        if (action === "release") navigate("/captain/accepted");
      }
      setAction(null);
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Could not save your changes. Try again.");
    }
  }

  return <>
    {task.revisionNote && <section className="rounded-2xl border border-warning-200 bg-warning-50 p-5" role="status">
      <h2 className="font-bold text-warning-800">Revised proof requested</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-warning-800">{task.revisionNote}</p>
      <p className="mt-2 text-sm text-surface-600">The previous proof stays visible until the inspector submits its replacement.</p>
    </section>}
    {task.cancellationReason && <section className="rounded-2xl border border-surface-200 bg-white p-5">
      <h2 className="font-bold text-surface-900">Visit cancelled</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm text-surface-600">{task.cancellationReason}</p>
    </section>}
    {(contact?.phone || canEdit || canCancel || canRevise || canRelease) && <section className="rounded-2xl border border-surface-200 bg-white p-5">
      <h2 className="font-bold text-surface-900">Manage this visit</h2>
      {contact?.phone && <a href={`tel:${contact.phone}`} className="mt-3 flex min-h-11 items-center text-sm font-semibold text-primary-800 underline underline-offset-4">Call {contact.name}</a>}
      <div className="mt-3 flex flex-wrap gap-2">
        {canEdit && <Button variant="secondary" size="sm" onClick={() => setAction("edit")}>Edit request</Button>}
        {canRevise && <Button variant="secondary" size="sm" onClick={() => setAction("revision")}>Request revised proof</Button>}
        {canCancel && <Button variant="ghost" size="sm" onClick={() => setAction("cancel")}>Cancel visit</Button>}
        {canRelease && <Button variant="secondary" size="sm" onClick={() => setAction("release")}>Release visit</Button>}
      </div>
    </section>}
    <Modal open={action !== null} onClose={() => { if (!busy) setAction(null); }}
      title={action === "edit" ? "Edit request" : action ? ACTIONS[action].title : "Manage visit"}
      description={action === "edit" ? "Update your instructions or correct the pin before an inspector accepts." : action ? ACTIONS[action].description : undefined}>
      <form onSubmit={submit} className="space-y-4" key={action}>
        {action === "edit" ? <>
          <Input label="Visit title" name="title" defaultValue={task.title} minLength={3} maxLength={160} required />
          <label className="block text-sm font-semibold text-surface-800">Instructions
            <textarea name="description" defaultValue={task.description} minLength={10} maxLength={5000} required rows={5} className="mt-2 w-full rounded-xl border border-surface-300 p-3 text-base font-normal" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Latitude" name="latitude" type="number" min={-90} max={90} step="any" defaultValue={task.targetLat} required />
            <Input label="Longitude" name="longitude" type="number" min={-180} max={180} step="any" defaultValue={task.targetLng} required />
          </div>
        </> : action && <label className="block text-sm font-semibold text-surface-800">{ACTIONS[action].label}
          <textarea autoFocus name="reason" required minLength={10} maxLength={2000} rows={5} className="mt-2 w-full rounded-xl border border-surface-300 p-3 text-base font-normal" />
          <span className="mt-1 block text-sm font-normal text-surface-500">At least 10 characters. This is shared with the other participant.</span>
        </label>}
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" disabled={busy} onClick={() => setAction(null)}>Go back</Button>
          <Button type="submit" isLoading={busy}>{action === "edit" ? "Save changes" : action ? ACTIONS[action].title : "Save"}</Button>
        </div>
      </form>
    </Modal>
  </>;
}
