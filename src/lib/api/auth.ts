import api from "./client";
import type { ApiResponse } from "@/types/api";
import type { AuthMe, Device, LoginRequest, LoginResponse } from "@/types/auth";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    credentials,
  );
  return response.data.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function getMe(): Promise<AuthMe> {
  const response = await api.get<ApiResponse<AuthMe>>("/auth/me");
  return response.data.data;
}

export async function getDevices(): Promise<Device[]> {
  const response =
    await api.get<ApiResponse<{ devices?: Device[] }>>("/auth/devices");
  return response.data.data?.devices ?? [];
}

export async function removeDevice(sessionId: string): Promise<void> {
  await api.delete(`/auth/devices/${sessionId}`);
}

// 비밀번호 재설정: 코드 발송, 검증, 새 비밀번호
export async function sendPasswordResetCode(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

export async function verifyPasswordResetCode(
  email: string,
  code: string,
): Promise<string> {
  const response = await api.post<ApiResponse<{ resetToken: string }>>(
    "/auth/verify-reset-code",
    { email, code },
  );
  return response.data.data.resetToken;
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  await api.post("/auth/reset-password", { token, newPassword });
}
