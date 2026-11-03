import api from "./client";
import type { ApiResponse, PagedResponse } from "@/types/api";
import type {
  BotAiComment,
  BotJobGroup,
  BotJob,
  BotJobStatus,
  BotScheduleRow,
  BotSummary,
} from "@/types/bot";

interface GetBotJobsParams {
  status?: BotJobStatus;
  group?: BotJobGroup;
  page?: number;
  limit?: number;
}

export async function getBotSummary(): Promise<BotSummary> {
  const response = await api.get<ApiResponse<BotSummary>>("/admin/bot");
  return response.data.data;
}

export async function toggleBot(enabled: boolean): Promise<BotSummary> {
  const response = await api.post<ApiResponse<BotSummary>>(
    "/admin/bot/toggle",
    { isEnabled: enabled },
  );
  return response.data.data;
}

export async function getBotJobs(
  params: GetBotJobsParams = {},
): Promise<PagedResponse<BotJob>> {
  const response = await api.get<ApiResponse<PagedResponse<BotJob>>>(
    "/admin/bot/jobs",
    { params },
  );
  return response.data.data;
}

export async function retryBotJob(id: number): Promise<void> {
  await api.post(`/admin/bot/jobs/${id}/retry`);
}

export async function getBotSchedule(): Promise<BotScheduleRow[]> {
  const response = await api.get<ApiResponse<BotScheduleRow[]>>(
    "/admin/bot/schedule",
  );
  return response.data.data;
}

export async function getBotAiComments(params: {
  page: number;
  limit: number;
}): Promise<PagedResponse<BotAiComment>> {
  const response = await api.get<ApiResponse<PagedResponse<BotAiComment>>>(
    "/admin/bot/ai-comments",
    { params },
  );
  return response.data.data;
}

export async function deleteBotAiComment(commentId: number): Promise<void> {
  await api.post(`/admin/bot/ai-comments/${commentId}/delete`);
}
