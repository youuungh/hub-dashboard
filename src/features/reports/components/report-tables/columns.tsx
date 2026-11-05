"use client";

import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Column, ColumnDef } from "@tanstack/react-table";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { TargetDialog } from "./target-dialog";
import { CellAction } from "./cell-action";
import { TARGET_TYPE_OPTIONS } from "./options";
import { AUTO_BLIND_THRESHOLD, type ReportedTarget } from "@/types/report";

export const columns: ColumnDef<ReportedTarget>[] = [
  {
    id: "targetType",
    accessorKey: "targetType",
    header: ({ column }: { column: Column<ReportedTarget, unknown> }) => (
      <DataTableColumnHeader column={column} title="대상" />
    ),
    cell: ({ row }) => <TargetDialog data={row.original} />,
    enableColumnFilter: true,
    enableSorting: false,
    meta: {
      label: "대상",
      kind: "entity",
      variant: "select",
      options: TARGET_TYPE_OPTIONS,
      asTabs: true,
    },
  },
  {
    id: "state",
    header: "상태",
    cell: ({ row }) => {
      const { isBlinded, moderationLocked } = row.original;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              isBlinded
                ? "bg-muted text-muted-foreground border-transparent font-normal"
                : "font-normal"
            }
          >
            {isBlinded ? "숨김" : "공개"}
          </Badge>
          {moderationLocked && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="bg-muted text-muted-foreground cursor-help border-transparent font-normal"
                  >
                    <ShieldCheck className="size-3" />
                    해제됨
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  관리자가 해제한 대상 — 자동 블라인드가 다시 적용되지 않습니다
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
    enableSorting: false,
    meta: { label: "상태", kind: "badge", width: 140 },
  },
  {
    accessorKey: "reportCount",
    header: "신고 수",
    cell: ({ row }) => {
      const count = row.original.reportCount;
      const reachedThreshold = count >= AUTO_BLIND_THRESHOLD;
      // 막대는 자동 블라인드 임계치까지의 비율
      const meter = (
        <span className="bg-muted h-1.5 w-24 shrink-0 overflow-hidden rounded-full">
          <span
            className={cn(
              "block h-full rounded-full",
              reachedThreshold ? "bg-destructive" : "bg-muted-foreground/40",
            )}
            style={{
              width: `${Math.min(100, (count / AUTO_BLIND_THRESHOLD) * 100)}%`,
            }}
          />
        </span>
      );

      if (!reachedThreshold) {
        return (
          <div className="flex items-center gap-2.5">
            <span className="min-w-6 font-medium tabular-nums">{count}</span>
            {meter}
          </div>
        );
      }

      // 빨간 강조 이유는 툴팁으로
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex cursor-help items-center gap-2.5">
                <span className="text-destructive min-w-6 font-semibold tabular-nums">
                  {count}
                </span>
                {meter}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              자동 블라인드 임계치({AUTO_BLIND_THRESHOLD}) 도달
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
    meta: { label: "신고 수", kind: "meter" },
  },
  {
    id: "actions",
    header: () => <div className="text-center">관리</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <CellAction data={row.original} />
      </div>
    ),
    enableSorting: false,
    meta: { label: "관리", kind: "actions" },
  },
];
