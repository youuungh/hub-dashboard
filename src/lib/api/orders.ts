import api from "./client";
import type { ApiResponse } from "@/types/api";
import type { OrderStatistics } from "@/types/order";

export async function getOrderStatistics(): Promise<OrderStatistics> {
  const response = await api.get<ApiResponse<OrderStatistics>>(
    "/orders/admin/statistics",
  );
  return response.data.data;
}
