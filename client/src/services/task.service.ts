import api from "./api";
import type { ApiResponse, Coordinates, Task, CreateTaskInput, UpdateTaskInput } from "../types";

export async function fetchTasks(
  filter?: string,
  location?: Coordinates
): Promise<Task[]> {
  const params: Record<string, string> = {};
  if (filter) params.filter = filter;
  if (location) {
    params.latitude = String(location.latitude);
    params.longitude = String(location.longitude);
  }

  const { data } = await api.get<ApiResponse<Task[]>>("/tasks", {
    params: Object.keys(params).length > 0 ? params : undefined,
  });
  return data.data;
}

export async function fetchTaskById(id: string): Promise<Task> {
  const { data } = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
  return data.data;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data } = await api.post<ApiResponse<Task>>("/tasks", input);
  return data.data;
}


export async function acceptTask(id: string): Promise<Task> {
  const { data } = await api.post<ApiResponse<Task>>(`/tasks/${id}/accept`);
  return data.data;
}

export async function startTask(id: string): Promise<Task> {
  const { data } = await api.post<ApiResponse<Task>>(`/tasks/${id}/start`);
  return data.data;
}

export async function submitTask(
  id: string,
  formData: FormData
): Promise<Task> {
  const { data } = await api.post<ApiResponse<Task>>(
    `/tasks/${id}/submit`,
    formData
  );
  return data.data;
}

export async function completeTask(id: string): Promise<Task> {
  const { data } = await api.post<ApiResponse<Task>>(`/tasks/${id}/complete`);
  return data.data;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, input);
  return data.data;
}

export async function changeTask(id: string, action: "cancel" | "release" | "revision", reason: string): Promise<Task> {
  const { data } = await api.post<ApiResponse<Task>>(`/tasks/${id}/${action}`, { reason });
  return data.data;
}
