import { useState } from "react";
import type { Task } from "../types";
import { useAuth } from "../contexts";
import { Button, Modal } from "./ui";
import { EvidenceImage, EvidenceDownload } from "./EvidenceImage";

export function VisitReportSummary({ task }: { task: Task }) {
  const { user } = useAuth();
  const [photoId, setPhotoId] = useState<string | null>(null);
  if (!task.evidenceImage) return null;
  return <section className="space-y-4 rounded-2xl border border-surface-200 bg-white p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-bold text-surface-900">Visit report</h2>
      <Button to={`/${user?.role === "CAPTAIN" ? "captain" : "user"}/tasks/${task.id}/report`} variant="secondary" size="sm">View / print report</Button>
    </div>
    <div><h3 className="text-sm font-semibold text-surface-800">Inspector’s notes</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-surface-600">{task.inspectorNotes || "No additional notes were submitted."}</p>
    </div>
    {!!task.photos?.length && <div>
      <h3 className="text-sm font-semibold text-surface-800">Supporting photos ({task.photos.length})</h3>
      <p className="mt-1 text-sm text-surface-600">Uploaded images; original capture time and location are not verified.</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {task.photos.map((photo, index) => <button key={photo.id} type="button" onClick={() => setPhotoId(photo.id)} className="overflow-hidden rounded-xl border border-surface-200 bg-surface-50 text-left" aria-label={`Open supporting photo ${index + 1}`}>
          <EvidenceImage taskId={task.id} photoId={photo.id} alt={`Supporting property photo ${index + 1}`} className="aspect-square w-full object-cover" />
          <span className="block p-2 text-xs font-semibold text-surface-600">Photo {index + 2}</span>
        </button>)}
      </div>
    </div>}
    <Modal open={!!photoId} onClose={() => setPhotoId(null)} title="Supporting photo" size="xl">
      {photoId && <div className="space-y-3">
        <EvidenceImage taskId={task.id} photoId={photoId} alt="Supporting property photo" className="max-h-[65dvh] w-full rounded-xl object-contain" />
        <EvidenceDownload taskId={task.id} photoId={photoId} />
      </div>}
    </Modal>
  </section>;
}
