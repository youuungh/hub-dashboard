import api from "./client";
import type { ApiResponse } from "@/types/api";
import type {
  MyProfile,
  UpdateProfileRequest,
  UserListResponse,
  UserProfile,
  UserStatistics,
} from "@/types/user";

export async function getUserStatistics(): Promise<UserStatistics> {
  const response = await api.get<ApiResponse<UserStatistics>>(
    "/users/admin/statistics",
  );
  return response.data.data;
}

export async function getUserProfile(userId: number): Promise<UserProfile> {
  const response = await api.get<ApiResponse<UserProfile>>(
    `/profile/${userId}`,
  );
  return response.data.data;
}

export async function getUsers(
  page = 1,
  limit = 20,
  role?: string,
  search?: string,
  sortBy?: string,
  sortOrder?: string,
): Promise<UserListResponse> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (role) params.append("role", role);
  if (search) params.append("search", search);
  if (sortBy) params.append("sortBy", sortBy);
  if (sortOrder) params.append("sortOrder", sortOrder);

  const response = await api.get<ApiResponse<UserListResponse>>(
    `/users?${params}`,
  );
  return response.data.data;
}

export async function getMyProfile(): Promise<MyProfile> {
  const response = await api.get<ApiResponse<MyProfile>>("/profile/me");
  return response.data.data;
}

export async function updateMyProfile(
  body: UpdateProfileRequest,
): Promise<MyProfile> {
  const response = await api.put<ApiResponse<MyProfile>>("/profile", body);
  return response.data.data;
}

// 기본 JSON 헤더면 FormData가 JSON으로 바뀜
export async function uploadMyAvatar(file: File): Promise<MyProfile> {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await api.post<ApiResponse<MyProfile>>(
    "/profile/avatar",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data.data;
}
