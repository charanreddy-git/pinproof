import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { useAuth } from "../contexts";

function useEvidence(taskId: string, photoId?: string, version?: string | null) {
  const { token } = useAuth();
  const [result, setResult] = useState<{ key: string; url?: string; error?: boolean }>({ key: "" });
  const [attempt, setAttempt] = useState(0);
  const key = `${token}:${taskId}:${photoId}:${version}:${attempt}`;
  useEffect(() => {
    if (!token || !taskId) return;
    const controller = new AbortController();
    let objectUrl: string | undefined;
    const resource = photoId ? `photos/${encodeURIComponent(photoId)}` : "evidence";
    fetch(`${import.meta.env.VITE_API_URL || "/api"}/tasks/${encodeURIComponent(taskId)}/${resource}`, {
      headers: { Authorization: `Bearer ${token}` }, signal: controller.signal, cache: "no-store",
    }).then(async (response) => {
      if (!response.ok) throw new Error("Evidence unavailable");
      const blob = await response.blob();
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(blob);
      setResult({ key, url: objectUrl });
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ key, error: true });
    });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [key, token, taskId, photoId]);
  return { ...(result.key === key ? result : { key }), retry: () => setAttempt((value) => value + 1) };
}

type EvidenceProps = { taskId: string; photoId?: string; version?: string | null };

export function EvidenceImage({ taskId, photoId, version, alt, ...props }: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & EvidenceProps) {
  const { url, error } = useEvidence(taskId, photoId, version);
  return url ? <img {...props} src={url} alt={alt} /> : (
    <span role="status" className="flex min-h-12 items-center justify-center bg-surface-100 p-2 text-sm text-surface-600">
      {error ? "Photo unavailable. Reopen this visit to retry." : "Loading photo…"}
    </span>
  );
}

export function EvidenceDownload({ taskId, photoId, version }: EvidenceProps) {
  const { url, error, retry } = useEvidence(taskId, photoId, version);
  return url ? <a href={url} download={`pinproof-${taskId}`} className="flex min-h-11 items-center justify-center rounded-xl border border-surface-300 text-sm font-semibold">Download proof photo</a>
    : error ? <button type="button" onClick={retry} className="min-h-11 text-sm font-semibold underline">Retry photo download</button> : <p role="status" className="text-sm text-surface-600">Preparing download…</p>;
}
