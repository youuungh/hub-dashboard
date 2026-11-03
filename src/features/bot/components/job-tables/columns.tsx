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
  formatJobTime,
  GROUP_OPTIONS,
  KIND_LABELS,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from "./options";

const STATUS_STYLES: Record<BotJobStatus, string> = {
  PENDING: "text-muted-foreground font-normal",
  DONE: "border-primary/30 bg-primary/10 text-primary",
  SKIPPED: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  FAILED: "border-destructive/30 bg-destructive/10 text-destructive",
};

function TimeCell({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground">-</span>;
  return (
    <span className="text-sm whitespace-nowrap tabular-nums">
      {formatJobTime(parseServerDate(value))}
    </span>
  );
}

export const columns: ColumnDef<BotJob>[] = [
  {
    // 필터는 묶음, 칸에는 세부 종류
    id: "group",
    accessorFn: (job) => job.kind,
    header: ({ column }: { column: Column<BotJob, unknown> }) => (
      <DataTableColumnHeader column={column} title="종류" />
    ),
    cell: ({ row }) => (
      <span className="font-medium whitespace-nowrap">
        {KIND_LABELS[row.original.kind]}
      </span>
    ),
    enableColumnFilter: true,
    enableSorting: false,
    meta: { label: "종류", variant: "select", options: GROUP_OPTIONS },
  },
  {
    id: "target",
    header: "대상",
    cell: ({ row }) => (
      <span
        className="block max-w-md truncate text-sm"
        title={row.original.target}
      >
        {row.original.target}
      </span>
    ),
    enableSorting: false,
    meta: { label: "대상" },
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
        <div className="flex items-center gap-2">
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
    meta: { label: "상태", variant: "select", options: STATUS_OPTIONS },
  },
  {
    id: "runAt",
    header: "예정",
    cell: ({ row }) => <TimeCell value={row.original.runAt} />,
    enableSorting: false,
    meta: { label: "예정" },
  },
  {
    id: "finishedAt",
    header: "끝난 시각",
    cell: ({ row }) => <TimeCell value={row.original.finishedAt} />,
    enableSorting: false,
    meta: { label: "끝난 시각" },
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
                "block max-w-64 cursor-help truncate text-sm",
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
    meta: { label: "사유" },
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
    meta: { label: "관리" },
  },
];
