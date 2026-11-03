"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { parseServerDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BotAiComment } from "@/types/bot";
import { formatJobTime } from "../job-tables/options";
import { DeleteAction } from "./delete-action";

export const columns: ColumnDef<BotAiComment>[] = [
  {
    id: "author",
    header: "쓴 사람",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="font-medium">{row.original.authorName}</span>
        <Badge
          variant="outline"
          className={cn(
            "font-normal",
            row.original.isCreator
              ? "border-primary/30 bg-primary/10 text-primary"
              : "text-muted-foreground",
          )}
        >
          {row.original.isCreator ? "크리에이터" : "팬"}
        </Badge>
      </div>
    ),
    enableSorting: false,
    meta: { label: "쓴 사람" },
  },
  {
    id: "content",
    header: "내용",
    cell: ({ row }) => (
      <p
        className={cn(
          "max-w-md text-sm whitespace-pre-wrap",
          row.original.isDeleted && "text-muted-foreground line-through",
        )}
      >
        {row.original.content}
      </p>
    ),
    enableSorting: false,
    meta: { label: "내용" },
  },
  {
    id: "post",
    header: "포스트",
    cell: ({ row }) => (
      <span
        className="text-muted-foreground block max-w-60 truncate text-sm"
        title={row.original.postSummary}
      >
        {row.original.postSummary}
      </span>
    ),
    enableSorting: false,
    meta: { label: "포스트" },
  },
  {
    id: "createdAt",
    header: "쓴 시각",
    cell: ({ row }) => (
      <span className="text-sm whitespace-nowrap tabular-nums">
        {formatJobTime(parseServerDate(row.original.createdAt))}
      </span>
    ),
    enableSorting: false,
    meta: { label: "쓴 시각" },
  },
  {
    id: "actions",
    header: () => <div className="text-center">관리</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <DeleteAction data={row.original} />
      </div>
    ),
    enableSorting: false,
    meta: { label: "관리" },
  },
];
