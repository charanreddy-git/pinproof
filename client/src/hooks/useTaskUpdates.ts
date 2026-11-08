import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts";
import { fetchTaskLocation } from "../services";
import { useTaskDetail } from "./useTasks";
import type { TaskLocation, TaskStatus } from "../types";

const TASK_STATUS_ORDER: TaskStatus[] = [
  "OPEN",
  "ACCEPTED",
  "IN_PROGRESS",
  "SUBMITTED",
  "COMPLETED",
];

const LOCATION_POLL_INTERVAL_MS = 5_000;

interface TaskEvent {
  taskId: string;
  captainId?: string;
  captainName?: string;
  evidenceImage?: string;
}

/**
 * Watches a visit through the polled task query and fires lifecycle callbacks
 * when its status advances. The initial status is not reported.
 */
export function useTaskUpdates(
  taskId: string | undefined,
  callbacks?: {
    onAccepted?: (data: TaskEvent) => void;
    onStarted?: (data: TaskEvent) => void;
    onSubmitted?: (data: TaskEvent) => void;
    onCompleted?: (data: TaskEvent) => void;
  }
) {
  const { data: task } = useTaskDetail(taskId ?? "");
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  const previousRef = useRef<{
    taskId?: string;
    status?: TaskStatus;
  }>({});

  useEffect(() => {
    if (!taskId || !task) return;

    const previous = previousRef.current;

    if (previous.taskId !== taskId || !previous.status) {
      previousRef.current = { taskId, status: task.status };
      return;
    }

    const previousIndex = TASK_STATUS_ORDER.indexOf(previous.status);
    const currentIndex = TASK_STATUS_ORDER.indexOf(task.status);
    previousRef.current = { taskId, status: task.status };

    if (currentIndex <= previousIndex) return;

    if (previousIndex < 1 && currentIndex >= 1) {
      callbacksRef.current?.onAccepted?.({
        taskId,
        captainId: task.acceptedBy?.id,
        captainName: task.acceptedBy?.name,
      });
    }
    if (previousIndex < 2 && currentIndex >= 2) {
      callbacksRef.current?.onStarted?.({ taskId });
    }
    if (previousIndex < 3 && currentIndex >= 3) {
      callbacksRef.current?.onSubmitted?.({
        taskId,
        evidenceImage: task.evidenceImage ?? undefined,
      });
    }
    if (previousIndex < 4 && currentIndex >= 4) {
      callbacksRef.current?.onCompleted?.({ taskId });
    }
  }, [taskId, task]);
}

/**
 * Polls the authorized latest-location endpoint for a visit.
 */
export function useLiveLocation(
  taskId: string | undefined,
  active = true
): {
  location: TaskLocation | null;
  isConnected: boolean;
  isLoading: boolean;
} {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["task-location", taskId, user?.id],
    queryFn: () => fetchTaskLocation(taskId!),
    enabled: !!taskId && !!user,
    refetchInterval: active ? LOCATION_POLL_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
    retry: 1,
  });

  return {
    location: query.data ?? null,
    isConnected: !query.isError,
    isLoading: query.isLoading,
  };
}
