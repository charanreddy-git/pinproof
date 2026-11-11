import api from "./api";
import type {
  ApiResponse,
  AuthModeResponse,
  AuthResponse,
  DemoResetResponse,
  OtpRequestResponse,
  Role,
  VerifyOtpResponse,
  User,
} from "../types";

export async function fetchProfileApi(): Promise<User> {
  return (await api.get<ApiResponse<User>>("/auth/me")).data.data;
}

export async function updateProfileApi(input: { name: string; email: string }): Promise<User> {
  return (await api.patch<ApiResponse<User>>("/auth/me", input)).data.data;
}

export async function fetchAuthModeApi(): Promise<AuthModeResponse> {
  const { data } = await api.get<ApiResponse<AuthModeResponse>>("/auth/mode");
  return data.data;
}

export async function demoLoginApi(role: Role): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/demo", {
    role,
  });
  return data.data;
}

export async function resetDemoApi(): Promise<DemoResetResponse> {
  const { data } = await api.post<ApiResponse<DemoResetResponse>>(
    "/auth/demo/reset"
  );
  return data.data;
}

export async function requestOtpApi(
  phone: string
): Promise<OtpRequestResponse> {
  const { data } = await api.post<ApiResponse<OtpRequestResponse>>(
    "/auth/otp/request",
    { phone }
  );
  return data.data;
}

export async function verifyOtpApi(input: {
  phone: string;
  code: string;
  name?: string;
  role?: Role;
}): Promise<VerifyOtpResponse> {
  const { data } = await api.post<ApiResponse<VerifyOtpResponse>>(
    "/auth/otp/verify",
    input
  );
  return data.data;
}
