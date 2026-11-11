import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, useLiveLocation } from "../contexts";
import { sendTaskLocation } from "../services";
import type { Task } from "../types";

/** Lives in the dashboard shell so sharing survives navigation to proof and lists. */
export function InspectorLocationSharing({ tasks }: { tasks: Task[] }) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { fix, error: locationError, retry } = useLiveLocation();
  const taskIds = tasks.filter((task) => task.status === "IN_PROGRESS").map((task) => task.id).sort().join(",");
  const [paused, setPaused] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ key: string; error?: string; shared?: boolean }>({ key: "" });

  useEffect(() => {
    if (!taskIds || paused || !fix || !token) return;
    let active = true;
    let sending = false;
    const ids = taskIds.split(",");
    const position = { latitude: fix.latitude, longitude: fix.longitude };

    async function share() {
      if (!active || sending) return;
      sending = true;
      try {
        await Promise.all(ids.map((id) => sendTaskLocation(id, position.latitude, position.longitude)));
        if (active) setState({ key: taskIds, shared: true });
      } catch {
        if (!active) return;
        setState({ key: taskIds, error: "Could not share your location. Check your connection and retry." });
        void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } finally {
        sending = false;
      }
    }

    void share();
    const timer = setInterval(() => void share(), 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [taskIds, paused, fix, token, attempt, queryClient]);

  if (!taskIds) return null;
  const current = state.key === taskIds ? state : null;
  const failure = paused ? null : locationError ?? current?.error ?? null;
  const shared = !paused && !failure && current?.shared;

  return <div className="no-print flex flex-wrap items-center justify-between gap-2 border-b border-surface-200 bg-primary-50 px-4 py-3 text-sm sm:px-6 lg:px-8" role="status">
    <div className="min-w-0 flex-1">
      <p className="font-semibold text-primary-900">{paused ? "Location sharing paused" : failure ? "Location is not being shared" : shared ? "Sharing your location with the requester" : "Getting your location…"}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-surface-600">{failure ? failure : "Keep PinProof open while travelling. Sharing stops when you submit proof."}</p>
    </div>
    {failure && !paused && <button type="button" onClick={() => { retry(); setAttempt((value) => value + 1); }} className="min-h-11 rounded-lg border border-surface-300 bg-white px-3 font-semibold">Retry location</button>}
    <button type="button" onClick={() => { setPaused((value) => !value); setState({ key: "" }); }} className="min-h-11 rounded-lg px-3 font-semibold text-primary-900 underline underline-offset-4">{paused ? "Resume sharing" : "Pause sharing"}</button>
  </div>;
}
