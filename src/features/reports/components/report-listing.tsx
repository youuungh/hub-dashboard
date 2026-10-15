"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { getReportedTargets } from "@/lib/api/reports";
import { queryKeys } from "@/lib/query-keys";
import type { ReportedTarget, ReportTargetType } from "@/types/report";
import { ReportTable } from "./report-tables";
import { columns } from "./report-tables/columns";

const EMPTY: ReportedTarget[] = [];

// 클라이언트에서 Bearer로 로드
export default function ReportListingPage() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [targetType] = useQueryState("targetType", parseAsString);

  const { data, isPending, isPlaceholderData } = useQuery({
    queryKey: [...queryKeys.reports, { page, perPage, targetType }],
    queryFn: () =>
      getReportedTargets({
        targetType: (targetType as ReportTargetType) || undefined,
        page,
        limit: perPage,
      }),
    // 새 응답이 올 때까지 이전 행 유지
    placeholderData: keepPreviousData,
    meta: { errorMessage: "신고 목록을 불러오는데 실패했습니다" },
  });

  return (
    <ReportTable
      data={data?.items ?? EMPTY}
      pageCount={data?.totalPages ?? 0}
      totalCount={data?.totalCount ?? 0}
      columns={columns}
      loading={isPending}
      stale={isPlaceholderData}
    />
  );
}
