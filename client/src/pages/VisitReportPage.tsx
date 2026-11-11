import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts";
import { useTaskDetail } from "../hooks";
import { Button, Logo, PageLoader, StatusBadge } from "../components";
import { EvidenceImage } from "../components/EvidenceImage";
import { VisitHistory } from "../components/VisitHistory";
import { formatVisitQuote } from "../content/visitPlans";
import { visitRef } from "../utils/task";
import type { Task } from "../types";
import "./report.css";

export function VisitReportPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: task, isLoading, refetch } = useTaskDetail(id!);
  const base = user?.role === "CAPTAIN" ? "captain" : "user";
  if (isLoading) return <PageLoader />;
  if (!task) return <main className="mx-auto max-w-lg p-8"><h1 className="text-2xl font-bold">Report unavailable</h1><p className="mt-3">Sign in with a visit participant’s account, or try loading it again.</p><Button onClick={() => void refetch()} className="mt-4">Try again</Button><Button to={`/${base}/tasks/${id}`} variant="ghost">Back to visit</Button></main>;
  return <Report task={task} base={base} key={`${task.id}:${task.evidenceSubmittedAt}`} />;
}

function Report({ task, base }: { task: Task; base: string }) {
  const [loaded, setLoaded] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);
  const photos = task.photos ?? [];
  const expected = task.evidenceImage ? 1 + photos.length : 0;
  const ready = loaded.length >= expected;
  const date = (value?: string | null) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" }) : "Not recorded";
  const onLoad = (key: string) => setLoaded((previous) => previous.includes(key) ? previous : [...previous, key]);
  return <main className="report-page min-h-screen bg-surface-100 px-4 py-6 sm:px-8 sm:py-10">
    <div className="no-print mx-auto mb-5 flex max-w-4xl flex-wrap items-center justify-between gap-3">
      <Button to={`/${base}/tasks/${task.id}`} variant="secondary" size="sm">Back to visit</Button>
      <div className="flex flex-wrap gap-2">{!ready && <Button variant="secondary" size="sm" onClick={() => { setLoaded([]); setAttempt((value) => value + 1); }}>Reload photos</Button>}<Button onClick={() => window.print()} disabled={!ready}>{ready ? "Print / save as PDF" : "Loading photos…"}</Button></div>
      <p className="w-full text-sm text-surface-600">Choose “Save as PDF” in the print dialog to keep a copy with all photos and visit details.</p>
    </div>
    <article className="visit-report mx-auto max-w-4xl bg-white p-5 shadow-sm sm:p-10">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b-4 border-accent-400 pb-6">
        <Logo size="sm" to={`/${base}/tasks/${task.id}`} /><div className="text-right"><p className="text-sm font-semibold text-surface-900">Property visit report</p><p className="mt-1 text-xs text-surface-600">Visit {visitRef(task.id)}</p></div>
      </header>
      <div className="my-7"><StatusBadge status={task.status} /><h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-surface-950">{task.title}</h1><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-surface-600">{task.description}</p></div>
      {task.revisionNote && <p className="mb-6 border-l-4 border-warning-400 bg-warning-50 p-4 text-sm">Revision pending: {task.revisionNote}</p>}
      <dl className="mb-7 grid gap-x-8 gap-y-4 border-y border-surface-200 py-5 text-sm sm:grid-cols-2">
        {[
          ["Requested by", task.createdBy.name], ["Inspector", task.acceptedBy?.name ?? "Not assigned"],
          ["Property pin", `${task.targetLat.toFixed(6)}, ${task.targetLng.toFixed(6)}`], ["Visit quote", formatVisitQuote(task.visitPlan, task.quotedPricePaise)],
          ["Requested", date(task.createdAt)], ["Proof submitted", date(task.evidenceSubmittedAt)],
          ["Completed", date(task.completedAt)], ["Submission GPS", task.evidenceLat != null && task.evidenceLng != null ? `${task.evidenceLat.toFixed(6)}, ${task.evidenceLng.toFixed(6)}` : "Not recorded"],
          ["GPS accuracy", task.evidenceAccuracy != null ? `±${Math.round(task.evidenceAccuracy)} m` : "Not recorded"],
          ["Primary photo capture", task.evidenceSource === "CAMERA" ? date(task.evidenceCapturedAt) : "Uploaded image · capture time unknown"],
        ].map(([label, value]) => <div key={label}><dt className="text-xs text-surface-600">{label}</dt><dd className="mt-1 font-semibold text-surface-900">{value}</dd></div>)}
      </dl>
      <section className="mb-7"><h2 className="text-xl font-bold text-surface-900">Inspector’s findings</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-surface-600">{task.inspectorNotes || "No additional findings were recorded."}</p></section>
      {task.evidenceImage ? <section key={attempt} className="space-y-7">
        <figure className="report-photo"><EvidenceImage taskId={task.id} version={task.evidenceSubmittedAt} onLoad={() => onLoad("primary")} alt="Primary property proof" className="max-h-[28rem] w-full object-contain" /><figcaption className="mt-2 text-xs text-surface-600">Photo 1 · {task.evidenceSource === "CAMERA" ? "In-browser camera" : "Uploaded image"}</figcaption></figure>
        {photos.map((photo, index) => <figure key={photo.id} className="report-photo"><EvidenceImage taskId={task.id} photoId={photo.id} onLoad={() => onLoad(photo.id)} alt={`Supporting property photo ${index + 2}`} className="max-h-[28rem] w-full object-contain" /><figcaption className="mt-2 text-xs text-surface-600">Photo {index + 2} · Supporting upload</figcaption></figure>)}
      </section> : <p className="py-6 text-sm text-surface-600">Proof has not been submitted for this visit.</p>}
      <div className="mt-8"><VisitHistory task={task} /></div>
      <footer className="mt-8 border-t border-surface-200 pt-5 text-xs leading-relaxed text-surface-600">GPS and camera capture time are device-reported. The server checks that submission GPS is within 100 metres of the property pin. Uploaded images have no verified original capture time or location. This report records a property visit; the quoted price is not a payment receipt.<p className="mt-2 break-all">Visit ID: {task.id}</p></footer>
    </article>
  </main>;
}
