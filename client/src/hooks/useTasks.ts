import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTasks,
  fetchTaskById,
  createTask,
  acceptTask,
  startTask,
  submitTask,
  completeTask,
} from "../services/task.service";
import type { Coordinates, CreateTaskInput } from "../types";

export function useTaskList(
  filter?: string,
  location?: Coordinates,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [
      "tasks",
      filter ?? null,
      location?.latitude ?? null,
      location?.longitude ?? null,
    ],
    queryFn: () => fetchTasks(filter, location),
    enabled: options?.enabled ?? true,
  });
}

export function useTaskDetail(id: string) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => fetchTaskById(id),
    enabled: !!id,
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
