import api from "./client";
import type { ApiResponse } from "@/types/api";

// 서버 배치를 관리자가 즉시 실행
interface ExpireResult {
  expiredCount: number;
  message: string;
}

export async function expirePoints(): Promise<ExpireResult> {
  const response = await api.post<ApiResponse<ExpireResult>>("/points/expire");
  return response.data.data;
}

export async function expireCoupons(): Promise<ExpireResult> {
  const response = await api.post<ApiResponse<ExpireResult>>("/coupons/expire");
  return response.data.data;
}
