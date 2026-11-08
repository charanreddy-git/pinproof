import api from "./api";
import type { ApiResponse, TaskLocation } from "../types";

export async function fetchTaskLocation(
  taskId: string
): Promise<TaskLocation | null> {
  const { data } = await api.get<ApiResponse<TaskLocation | null>>(
    `/tasks/${taskId}/location`
  );
  return data.data;
}

export async function sendTaskLocation(
  taskId: string,
  latitude: number,
  longitude: number
): Promise<TaskLocation> {
  const { data } = await api.post<ApiResponse<TaskLocation>>(
    `/tasks/${taskId}/location`,
    { latitude, longitude }
  );
  return data.data;
}
