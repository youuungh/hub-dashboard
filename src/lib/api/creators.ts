import api from "./client";
import type { ApiResponse } from "@/types/api";
import type {
  CreatorApplication,
  CreatorApplicationListResponse,
  CreatorStatistics,
} from "@/types/user";

export const getCreatorApplications = async (
  status?: string,
  page = 1,
  limit = 20,
  search?: string,
  sortBy?: string,
  sortOrder?: string,
): Promise<CreatorApplicationListResponse> => {
  const params = new URLSearchParams();
  if (status && status !== "ALL") params.append("status", status);
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (search) params.append("search", search);
  if (sortBy) params.append("sortBy", sortBy);
  if (sortOrder) params.append("sortOrder", sortOrder);

  const response = await api.get<ApiResponse<CreatorApplicationListResponse>>(
    `/admin/creator/applications?${params}`,
  );
  return response.data.data;
};

export const approveCreatorApplication = async (
  id: number,
): Promise<CreatorApplication> => {
  const response = await api.post<ApiResponse<CreatorApplication>>(
    `/admin/creator/applications/${id}/approve`,
  );
  return response.data.data;
};

export const rejectCreatorApplication = async (
  id: number,
  rejectionReason: string,
): Promise<CreatorApplication> => {
  const response = await api.post<ApiResponse<CreatorApplication>>(
    `/admin/creator/applications/${id}/reject`,
    { rejectionReason },
  );
  return response.data.data;
};

export const demoteCreator = async (userId: number): Promise<string> => {
  const response = await api.post<ApiResponse<string>>(
    `/admin/creator/${userId}/demote`,
  );
  return response.data.data;
};

export const getCreatorStatistics = async (): Promise<CreatorStatistics> => {
  const response = await api.get<ApiResponse<CreatorStatistics>>(
    "/admin/creator/statistics",
  );
  return response.data.data;
};
