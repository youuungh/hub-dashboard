"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DateCell } from "@/components/table/date-cell";
import { ColumnDef } from "@tanstack/react-table";
import { Lock } from "lucide-react";
import { UserProfileCell } from "@/components/user-profile-dialog";
import { PostDialog } from "./post-dialog";
import { CellAction } from "./cell-action";
import type { AdminPost } from "@/types/post";

// 서버가 page·limit만 받아 정렬·필터 없음
export const columns: ColumnDef<AdminPost>[] = [
  {
    id: "author",
    header: "작성자",
    cell: ({ row }) => (
      <UserProfileCell
        userId={row.original.author.id}
        user={row.original.author}
      />
    ),
    enableSorting: false,
    meta: { label: "작성자" },
  },
  {
    id: "state",
    header: "상태",
    cell: ({ row }) => {
      const { isActive, isSecret, requiredTier } = row.original;
      return (
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={
              isActive
                ? "text-muted-foreground font-normal"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }
          >
            {isActive ? "공개" : "숨김"}
          </Badge>
          {isSecret && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Lock className="text-muted-foreground h-3.5 w-3.5" />
                </TooltipTrigger>
                <TooltipContent>비밀글</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {requiredTier !== "FREE" && (
            <Badge variant="outline" className="font-normal">
              {requiredTier}
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: false,
    meta: { label: "상태" },
  },
  {
    id: "content",
    header: "본문",
    cell: ({ row }) => <PostDialog data={row.original} />,
    enableSorting: false,
    meta: { label: "본문" },
  },
  {
    id: "engagement",
    header: "반응",
    cell: ({ row }) => {
      const { likeCount, commentCount } = row.original;
      return (
        <span className="text-sm tabular-nums">
          좋아요 {likeCount.toLocaleString()} · 댓글{" "}
          {commentCount.toLocaleString()}
        </span>
      );
    },
    enableSorting: false,
    meta: { label: "반응" },
  },
  {
    accessorKey: "createdAt",
    header: "작성일",
    cell: ({ row }) => <DateCell value={row.original.createdAt} />,
    enableSorting: false,
    meta: { label: "작성일" },
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
