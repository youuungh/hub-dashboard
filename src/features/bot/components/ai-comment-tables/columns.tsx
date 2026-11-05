"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user-avatar";
import { parseServerDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BotAiComment } from "@/types/bot";
import { formatJobTime, formatShortTime } from "../job-tables/options";
import { DeleteAction } from "./delete-action";

export const columns: ColumnDef<BotAiComment>[] = [
  {
    id: "author",
    header: "쓴 사람",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 whitespace-nowrap">
        <UserAvatar className="size-8 shrink-0" />
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-sm font-medium">{row.original.authorName}</span>
          <Badge
            variant="outline"
            className={cn(
              "font-normal",
              !row.original.isCreator &&
                "bg-muted text-muted-foreground border-transparent",
            )}
          >
            {row.original.isCreator ? "크리에이터" : "팬"}
          </Badge>
        </div>
      </div>
    ),
    enableSorting: false,
    meta: { label: "쓴 사람", kind: "entity" },
  },
  {
    id: "content",
    header: "내용",
    cell: ({ row }) => (
      <p
        className={cn(
          "block truncate text-sm",
          row.original.isDeleted && "text-muted-foreground line-through",
        )}
      >
        {row.original.content}
      </p>
    ),
    enableSorting: false,
    meta: { label: "내용", kind: "text" },
  },
  {
    id: "post",
    header: "포스트",
    cell: ({ row }) => (
      <span
        className="text-muted-foreground block truncate text-sm"
        title={row.original.postSummary}
      >
        {row.original.postSummary}
      </span>
    ),
    enableSorting: false,
    meta: { label: "포스트", kind: "entity", width: 220 },
  },
  {
    id: "createdAt",
    header: "쓴 시각",
    // 날짜 칸이 좁아 짧게, 전체 시각은 올리면
    cell: ({ row }) => {
      const date = parseServerDate(row.original.createdAt);
      return (
        <span
          title={formatJobTime(date)}
          className="text-sm whitespace-nowrap tabular-nums"
        >
          {formatShortTime(date)}
        </span>
      );
    },
    enableSorting: false,
    meta: { label: "쓴 시각", kind: "date" },
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
    meta: { label: "관리", kind: "actions" },
  },
];
