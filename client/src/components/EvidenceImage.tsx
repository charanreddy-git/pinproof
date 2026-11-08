import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { useAuth } from "../contexts";

function useEvidence(taskId: string) {
  const { token } = useAuth();
  const [result, setResult] = useState<{ key: string; url?: string; error?: boolean }>({ key: "" });
  const key = `${token}:${taskId}`;
  useEffect(() => {
    if (!token || !taskId) return;
    const controller = new AbortController();
    let objectUrl: string | undefined;
    fetch(`${import.meta.env.VITE_API_URL || "/api"}/tasks/${encodeURIComponent(taskId)}/evidence`, {
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
  }, [key, token, taskId]);
  return result.key === key ? result : { key };
}

export function EvidenceImage({ taskId, alt, ...props }: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { taskId: string }) {
  const { url, error } = useEvidence(taskId);
  return url ? <img {...props} src={url} alt={alt} /> : (
    <span role="status" className="flex min-h-12 items-center justify-center bg-surface-100 p-2 text-sm text-surface-600">
      {error ? "Photo unavailable. Reopen this visit to retry." : "Loading photo…"}
    </span>
  );
}

export function EvidenceDownload({ taskId }: { taskId: string }) {
  const { url, error } = useEvidence(taskId);
  return url ? <a href={url} download={`pinproof-${taskId}`} className="flex min-h-11 items-center justify-center rounded-xl border border-surface-300 text-sm font-semibold">Download proof photo</a>
    : <p role="status" className="text-sm text-surface-600">{error ? "Photo unavailable. Reopen this visit to retry." : "Preparing download…"}</p>;
}
