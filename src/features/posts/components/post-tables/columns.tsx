"use client";

import { Badge } from "@/components/ui/badge";
import { DateCell } from "@/components/table/date-cell";
import { tierLabel } from "@/lib/format";
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
    meta: { label: "작성자", kind: "entity" },
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
                ? "font-normal"
                : "bg-muted text-muted-foreground border-transparent font-normal"
            }
          >
            {isActive ? "공개" : "숨김"}
          </Badge>
          {(requiredTier !== "FREE" || isSecret) && (
            <Badge
              variant="outline"
              className="bg-muted text-muted-foreground border-transparent font-normal"
            >
              <Lock className="size-3" />
              {requiredTier !== "FREE" ? tierLabel(requiredTier) : "비밀글"}
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: false,
    meta: { label: "상태", kind: "badge", width: 140 },
  },
  {
    id: "content",
    header: "본문",
    cell: ({ row }) => <PostDialog data={row.original} />,
    enableSorting: false,
    meta: { label: "본문", kind: "text" },
  },
  {
    accessorKey: "createdAt",
    header: "작성일",
    cell: ({ row }) => <DateCell value={row.original.createdAt} />,
    enableSorting: false,
    meta: { label: "작성일", kind: "date" },
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
