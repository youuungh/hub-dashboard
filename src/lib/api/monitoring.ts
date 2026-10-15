import api from "./client";
import type { ApiResponse } from "@/types/api";
import type { MonitoringMetrics, HealthStatus } from "@/types/monitoring";

export async function getMonitoringMetrics(): Promise<MonitoringMetrics> {
  const response = await api.get<ApiResponse<MonitoringMetrics>>(
    "/admin/monitoring/metrics",
  );
  return response.data.data;
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const response = await api.get<ApiResponse<HealthStatus>>(
    "/admin/monitoring/health",
  );
  return response.data.data;
}
