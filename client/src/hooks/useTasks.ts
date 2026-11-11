import { useAuth } from "../contexts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTasks,
  fetchTaskById,
  createTask,
  acceptTask,
  startTask,
  submitTask,
  completeTask,
  updateTask,
  changeTask,
} from "../services/task.service";
import type { Coordinates, CreateTaskInput, UpdateTaskInput } from "../types";

// HTTP polling replaces the previous real-time socket updates.
const TASK_LIST_POLL_INTERVAL_MS = 15_000;
const TASK_DETAIL_POLL_INTERVAL_MS = 5_000;

export function useTaskList(
  filter?: string,
  location?: Coordinates,
  options?: { enabled?: boolean }
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [
      "tasks",
      user?.id,
      filter ?? null,
      location?.latitude ?? null,
      location?.longitude ?? null,
    ],
    queryFn: () => fetchTasks(filter, location),
    enabled: !!user && (options?.enabled ?? true),
    refetchInterval: TASK_LIST_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useTaskDetail(id: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["task", id, user?.id],
    queryFn: () => fetchTaskById(id),
    enabled: !!id && !!user,
    refetchInterval: (query) =>
      ["COMPLETED", "CANCELLED"].includes(query.state.data?.status ?? "")
        ? false
        : TASK_DETAIL_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// Helper for invalidating tasks
function useTaskInvalidation() {
  const queryClient = useQueryClient();
  return (id: string) => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["task", id] });
  };
}

export function useAcceptTask() {
  const invalidate = useTaskInvalidation();
  return useMutation({
    mutationFn: (id: string) => acceptTask(id),
    onSuccess: (_, id) => invalidate(id),
  });
}

export function useStartTask() {
  const invalidate = useTaskInvalidation();
  return useMutation({
    mutationFn: (id: string) => startTask(id),
    onSuccess: (_, id) => invalidate(id),
  });
}

export function useSubmitTask() {
  const invalidate = useTaskInvalidation();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      submitTask(id, formData),
    onSuccess: (_, { id }) => invalidate(id),
  });
}

export function useCompleteTask() {
  const invalidate = useTaskInvalidation();
  return useMutation({
    mutationFn: (id: string) => completeTask(id),
    onSuccess: (_, id) => invalidate(id),
  });
}

export function useUpdateTask() {
  const invalidate = useTaskInvalidation();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => updateTask(id, input),
    onSuccess: (_, { id }) => invalidate(id),
  });
}

export function useChangeTask() {
  const invalidate = useTaskInvalidation();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: "cancel" | "release" | "revision"; reason: string }) => changeTask(id, action, reason),
    onSuccess: (_, { id }) => invalidate(id),
  });
}
