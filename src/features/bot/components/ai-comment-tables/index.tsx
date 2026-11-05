"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryState } from "nuqs";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { DEFAULT_PAGE_SIZE, useDataTable } from "@/hooks/use-data-table";
import { getBotAiComments } from "@/lib/api/bot";
import { queryKeys } from "@/lib/query-keys";
import type { BotAiComment } from "@/types/bot";
import { columns } from "./columns";

const EMPTY: BotAiComment[] = [];

export function AiCommentTable() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  );

  const { data, isPending, isPlaceholderData } = useQuery({
    queryKey: [...queryKeys.bot, "ai-comments", { page, perPage }],
    queryFn: () => getBotAiComments({ page, limit: perPage }),
    placeholderData: keepPreviousData,
    meta: { errorMessage: "AI 글을 불러오는데 실패했습니다" },
  });

  const { table } = useDataTable({
    data: data?.items ?? EMPTY,
    columns,
    pageCount: data?.totalPages ?? 0,
    rowCount: data?.totalCount ?? 0,
  });

  return (
    <DataTable table={table} loading={isPending} stale={isPlaceholderData}>
      <DataTableToolbar table={table} className="mt-0" />
    </DataTable>
  );
}
