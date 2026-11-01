export type Role = "USER" | "CAPTAIN";
export type AuthMode = "otp" | "demo";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DemoAccount {
  role: Role;
  name: string;
  phone: string;
}

export interface AuthModeResponse {
  mode: AuthMode;
  demo: DemoAccount[];
}

export interface DemoResetResponse {
  tasks: number;
  accounts: DemoAccount[];
}

export type TaskStatus =
  | "OPEN"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "COMPLETED";

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: Role;
  createdAt: string;
}

export type TaskUser = Pick<User, "id" | "name" | "role"> & {
  phone?: string;
};

export interface Task {
  id: string;
  title: string;
  description: string;
  targetLat: number;
  targetLng: number;
  status: TaskStatus;
  evidenceImage: string | null;
  evidenceLat: number | null;
  evidenceLng: number | null;
  evidenceAccuracy: number | null;
  evidenceCapturedAt: string | null;
  evidenceSubmittedAt: string | null;
  createdById: string;
  acceptedById: string | null;
  createdBy: TaskUser;
  acceptedBy: TaskUser | null;
  locationLogs?: LocationLog[];
  /** Present on open visits returned to a captain with their coordinates. */
  distanceKm?: number;
  createdAt: string;
  updatedAt: string;
}

interface LocationLog {
  id: string;
  latitude: number;
  longitude: number;
  taskId: string;
  captainId: string;
  timestamp: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  isNew?: boolean;
}

export interface OtpRequestResponse {
  expiresIn: number;
  resendAfter: number;
  devOtp?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
}
