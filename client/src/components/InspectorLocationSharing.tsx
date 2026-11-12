import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, useLiveLocation } from "../contexts";
import { sendTaskLocation } from "../services";
import type { Task } from "../types";
import { isFreshFix } from "../utils/location-verification";

/** Lives in the dashboard shell so sharing survives navigation to proof and lists. */
export function InspectorLocationSharing({ tasks }: { tasks: Task[] }) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { fix, error: locationError, retry, requestAccess, permissionRequested } = useLiveLocation();
  const taskIds = tasks.filter((task) => task.status === "IN_PROGRESS").map((task) => task.id).sort().join(",");
  const [paused, setPaused] = useState(false);
  const inFlight = useRef(false);
  const lastSentAt = useRef(0);
  const latestFix = useRef(fix);
  const [state, setState] = useState<{ key: string; error?: string; shared?: boolean }>({ key: "" });

  useEffect(() => { latestFix.current = fix; }, [fix]);

  useEffect(() => {
    if (!taskIds || paused || !token || !permissionRequested) return;
    let active = true;
    const ids = taskIds.split(",");

    async function share() {
      const position = latestFix.current;
      if (!active || inFlight.current || !isFreshFix(position) || Date.now() - lastSentAt.current < 5000) return;
      inFlight.current = true;
      lastSentAt.current = Date.now();
      try {
        await Promise.all(ids.map((id) => sendTaskLocation(id, position!.latitude, position!.longitude)));
        if (active) setState({ key: taskIds, shared: true });
      } catch {
        if (!active) return;
        setState({ key: taskIds, error: "Could not share your location. Check your connection and retry." });
        void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } finally {
        inFlight.current = false;
      }
    }

    void share();
    const timer = setInterval(() => void share(), 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [taskIds, paused, token, permissionRequested, queryClient]);

  if (!taskIds) return null;
  const current = state.key === taskIds ? state : null;
  const failure = paused ? null : locationError ?? current?.error ?? null;
  const shared = !paused && !!fix && !failure && current?.shared;

  return <div className="no-print flex flex-wrap items-center justify-between gap-2 border-b border-surface-200 bg-primary-50 px-4 py-3 text-sm sm:px-6 lg:px-8" role="status">
    <div className="min-w-0 flex-1">
      <p className="font-semibold text-primary-900">{paused ? "Location sharing paused" : !permissionRequested ? "Location permission needed" : failure ? "Location is not being shared" : shared ? "Sharing your location with the requester" : "Waiting for a fresh GPS fix…"}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-surface-600">{failure ? failure : !permissionRequested ? "Allow location so your requester can track this visit and your on-site proof can be checked." : "Keep PinProof open while travelling. Sharing stops when you submit proof."}</p>
    </div>
    {!permissionRequested && <button type="button" onClick={requestAccess} className="min-h-11 rounded-lg border border-surface-300 bg-white px-3 font-semibold">Allow location</button>}
    {permissionRequested && (failure || !fix) && !paused && <button type="button" onClick={retry} className="min-h-11 rounded-lg border border-surface-300 bg-white px-3 font-semibold">Retry location</button>}
    <button type="button" onClick={() => { setPaused((value) => !value); setState({ key: "" }); }} className="min-h-11 rounded-lg px-3 font-semibold text-primary-900 underline underline-offset-4">{paused ? "Resume sharing" : "Pause sharing"}</button>
  </div>;
}
