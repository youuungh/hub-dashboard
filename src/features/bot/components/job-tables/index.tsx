"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { getBotJobs } from "@/lib/api/bot";
import { queryKeys } from "@/lib/query-keys";
import type { BotJob, BotJobGroup, BotJobStatus } from "@/types/bot";
import { columns } from "./columns";

const EMPTY: BotJob[] = [];

// 상태를 고르지 않으면 끝난 작업만 최근 순
export function JobTable() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage] = useQueryState("perPage", parseAsInteger.withDefault(20));
  const [status] = useQueryState("status", parseAsString);
  const [group] = useQueryState("group", parseAsString);

  const { data, isPending, isPlaceholderData } = useQuery({
    queryKey: [...queryKeys.bot, "jobs", { page, perPage, status, group }],
    queryFn: () =>
      getBotJobs({
        status: (status as BotJobStatus) || undefined,
        group: (group as BotJobGroup) || undefined,
        page,
        limit: perPage,
      }),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
    meta: { errorMessage: "작업 기록을 불러오는데 실패했습니다" },
  });

  const { table } = useDataTable({
    data: data?.items ?? EMPTY,
    columns,
    pageCount: data?.totalPages ?? 0,
    rowCount: data?.totalCount ?? 0,
    initialState: { pagination: { pageIndex: 0, pageSize: 20 } },
    debounceMs: 500,
  });

  return (
    <DataTable table={table} loading={isPending} stale={isPlaceholderData}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
