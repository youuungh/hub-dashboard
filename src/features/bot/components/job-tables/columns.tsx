"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { parseServerDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BotJob, BotJobStatus } from "@/types/bot";
import { RetryAction } from "./retry-action";
import {
  formatShortTime,
  GROUP_LABELS,
  GROUP_OPTIONS,
  KIND_GROUPS,
  KIND_LABELS,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from "./options";

const STATUS_STYLES: Record<BotJobStatus, string> = {
  PENDING: "text-muted-foreground font-normal",
  DONE: "font-normal",
  SKIPPED: "bg-muted text-muted-foreground border-transparent font-normal",
  FAILED: "border-destructive/30 bg-destructive/10 text-destructive",
};

// 예정 시각 아래 끝난 시각, 한국어가 한 글자씩 꺾이지 않게 줄바꿈 막음
function TimeCell({
  runAt,
  finishedAt,
}: {
  runAt: string;
  finishedAt: string | null;
}) {
  return (
    <div className="text-sm whitespace-nowrap tabular-nums">
      <div>{formatShortTime(parseServerDate(runAt))}</div>
      <div className="text-muted-foreground text-xs">
        {finishedAt
          ? `끝남 ${formatShortTime(parseServerDate(finishedAt)).split(" ")[1]}`
          : "-"}
      </div>
    </div>
  );
}

export const columns: ColumnDef<BotJob>[] = [
  {
    // 필터는 묶음, 칸에는 묶음과 세부 종류
    id: "group",
    accessorFn: (job) => job.kind,
    header: ({ column }: { column: Column<BotJob, unknown> }) => (
      <DataTableColumnHeader column={column} title="종류" />
    ),
    cell: ({ row }) => {
      const group = GROUP_LABELS[KIND_GROUPS[row.original.kind]];
      const kind = KIND_LABELS[row.original.kind];
      return (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Badge
            variant="outline"
            className="bg-muted text-muted-foreground border-transparent font-normal"
          >
            {group}
          </Badge>
          {kind !== group && (
            <span className="text-muted-foreground text-xs">{kind}</span>
          )}
        </div>
      );
    },
    enableColumnFilter: true,
    enableSorting: false,
    meta: {
      label: "종류",
      kind: "badge",
      width: 170,
      variant: "select",
      options: GROUP_OPTIONS,
    },
  },
  {
    id: "target",
    header: "대상",
    cell: ({ row }) => (
      <span className="block truncate text-sm" title={row.original.target}>
        {row.original.target}
      </span>
    ),
    enableSorting: false,
    meta: { label: "대상", kind: "text" },
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }: { column: Column<BotJob, unknown> }) => (
      <DataTableColumnHeader column={column} title="상태" />
    ),
    cell: ({ row }) => {
      const { status, attempts } = row.original;
      return (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Badge variant="outline" className={STATUS_STYLES[status]}>
            {STATUS_LABELS[status]}
          </Badge>
          {attempts > 1 && (
            <span className="text-muted-foreground text-xs tabular-nums">
              {attempts}회 시도
            </span>
          )}
        </div>
      );
    },
    enableColumnFilter: true,
    enableSorting: false,
    meta: {
      label: "상태",
      kind: "badge",
      width: 150,
      variant: "select",
      options: STATUS_OPTIONS,
    },
  },
  {
    id: "runAt",
    header: "예정 · 끝남",
    cell: ({ row }) => (
      <TimeCell
        runAt={row.original.runAt}
        finishedAt={row.original.finishedAt}
      />
    ),
    enableSorting: false,
    meta: { label: "예정 · 끝남", kind: "date" },
  },
  {
    id: "error",
    header: "사유",
    cell: ({ row }) => {
      const { error, status } = row.original;
      if (!error) return <span className="text-muted-foreground">-</span>;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "block cursor-help truncate text-sm",
                status === "FAILED" && "text-destructive",
              )}
            >
              {error}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">{error}</TooltipContent>
        </Tooltip>
      );
    },
    enableSorting: false,
    meta: { label: "사유", kind: "text" },
  },
  {
    id: "actions",
    header: () => <div className="text-center">관리</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.original.status === "FAILED" && (
          <RetryAction id={row.original.id} />
        )}
      </div>
    ),
    enableSorting: false,
    meta: { label: "관리", kind: "actions" },
  },
];
