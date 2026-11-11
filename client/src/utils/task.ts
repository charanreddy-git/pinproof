import type { TaskStatus } from "../types";

/** Must match the server's CAPTAIN_DISCOVERY_RADIUS_KM. */
export const CAPTAIN_DISCOVERY_RADIUS_KM = 7;

export const TASK_STEPS: {
  status: TaskStatus;
  label: string;
  description: string;
}[] = [
  { status: "OPEN", label: "Request sent", description: "Finding a local inspector" },
  { status: "ACCEPTED", label: "Inspector assigned", description: "Your inspector is confirmed" },
  { status: "IN_PROGRESS", label: "On the way", description: "Travelling to the property" },
  { status: "SUBMITTED", label: "Proof ready", description: "Review the photo and details" },
  { status: "COMPLETED", label: "Completed", description: "The visit is reviewed and closed" },
];

export const STATUS_ORDER: Record<TaskStatus, number> = {
  OPEN: 0,
  ACCEPTED: 1,
  IN_PROGRESS: 2,
  SUBMITTED: 3,
  COMPLETED: 4,
  CANCELLED: -1,
};

export const ACTIVE_STATUSES: TaskStatus[] = [
  "OPEN",
  "ACCEPTED",
  "IN_PROGRESS",
  "SUBMITTED",
];

export function isActiveStatus(status: TaskStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

// The visit that needs the requester's attention first: proof review, then a
// moving visit, then an assigned inspector, then an open request.
const REQUESTER_PRIORITY: Record<TaskStatus, number> = {
  SUBMITTED: 0,
  IN_PROGRESS: 1,
  ACCEPTED: 2,
  OPEN: 3,
  COMPLETED: 4,
  CANCELLED: 5,
};

export function sortForRequester<T extends { status: TaskStatus }>(tasks: T[]): T[] {
  return [...tasks].sort(
    (a, b) => REQUESTER_PRIORITY[a.status] - REQUESTER_PRIORITY[b.status]
  );
}

export function visitRef(id: string): string {
  return `#${id.slice(-5).toUpperCase()}`;
}
