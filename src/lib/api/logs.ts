import api from "./client";
import type { ApiResponse } from "@/types/api";
import type { LogQueryParams, LogQueryResult } from "@/types/logs";

export async function getLogs(params: LogQueryParams): Promise<LogQueryResult> {
  const response = await api.get<ApiResponse<LogQueryResult>>(
    "/admin/monitoring/logs",
    {
      params: {
        minutes: params.minutes,
        level: params.level ?? undefined,
        source: params.source ?? undefined,
        q: params.keyword || undefined,
      },
    },
  );
  return response.data.data;
}
