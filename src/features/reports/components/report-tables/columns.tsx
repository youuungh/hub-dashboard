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
import { Lock } from "lucide-react";
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
      variant: "select",
      options: TARGET_TYPE_OPTIONS,
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
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "text-muted-foreground font-normal"
            }
          >
            {isBlinded ? "숨김" : "공개"}
          </Badge>
          {moderationLocked && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Lock className="text-muted-foreground h-3.5 w-3.5" />
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
    meta: { label: "상태" },
  },
  {
    accessorKey: "reportCount",
    header: "신고 수",
    cell: ({ row }) => {
      const count = row.original.reportCount;
      const reachedThreshold = count >= AUTO_BLIND_THRESHOLD;

      if (!reachedThreshold) {
        return <span className="font-medium">{count}</span>;
      }

      // 빨간 강조 이유는 툴팁으로
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help font-semibold text-destructive">
                {count}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              자동 블라인드 임계치({AUTO_BLIND_THRESHOLD}) 도달
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
    meta: { label: "신고 수" },
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
    meta: { label: "관리" },
  },
];
