import api from "./client";
import type { ApiResponse, PagedResponse } from "@/types/api";
import type { AdminPost } from "@/types/post";

export async function getAdminPosts(
  page = 1,
  limit = 20,
): Promise<PagedResponse<AdminPost>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await api.get<ApiResponse<PagedResponse<AdminPost>>>(
    `/posts/admin?${params}`,
  );
  return response.data.data;
}
