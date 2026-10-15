import api from "./client";
import type { ApiResponse, PagedResponse } from "@/types/api";
import type {
  ReportedTarget,
  ReportedTargetDetail,
  ReportTargetType,
} from "@/types/report";

interface GetReportedTargetsParams {
  targetType?: ReportTargetType;
  page?: number;
  limit?: number;
}

export async function getReportedTargets(
  params: GetReportedTargetsParams = {},
): Promise<PagedResponse<ReportedTarget>> {
  const response = await api.get<ApiResponse<PagedResponse<ReportedTarget>>>(
    "/admin/reports",
    { params },
  );
  return response.data.data;
}

export async function blindTarget(
  targetType: ReportTargetType,
  targetId: number,
): Promise<void> {
  await api.post("/admin/reports/blind", { targetType, targetId });
}

export async function unblindTarget(
  targetType: ReportTargetType,
  targetId: number,
): Promise<void> {
  await api.post("/admin/reports/unblind", { targetType, targetId });
}

export const getReportedTargetDetail = async (
  targetType: ReportTargetType,
  targetId: number,
): Promise<ReportedTargetDetail> => {
  const response = await api.get<ApiResponse<ReportedTargetDetail>>(
    `/admin/reports/${targetType}/${targetId}`,
  );
  return response.data.data;
};
