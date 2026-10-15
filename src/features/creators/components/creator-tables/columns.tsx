"use client";

import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { Column, ColumnDef } from "@tanstack/react-table";
import { Text } from "lucide-react";
import { DateCell } from "@/components/table/date-cell";
import { UserProfileCell } from "@/components/user-profile-dialog";
import { CellAction } from "./cell-action";
import { ApplicationDialog } from "./application-dialog";
import { STATUS_LABELS, STATUS_OPTIONS, getStatusBadgeColor } from "./options";
import type { CreatorApplication } from "@/types/user";

export const columns: ColumnDef<CreatorApplication>[] = [
  {
    id: "creatorUsername",
    accessorKey: "username",
    header: ({ column }: { column: Column<CreatorApplication, unknown> }) => (
      <DataTableColumnHeader column={column} title="신청자" />
    ),
    // 신청 응답엔 집계가 없어 누를 때 조회
    cell: ({ row }) => (
      <UserProfileCell userId={row.original.userId} user={row.original} />
    ),
    meta: {
      label: "신청자",
      placeholder: "아이디 검색...",
      variant: "text",
      icon: Text,
    },
    enableColumnFilter: true,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }: { column: Column<CreatorApplication, unknown> }) => (
      <DataTableColumnHeader column={column} title="상태" />
    ),
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={getStatusBadgeColor(row.original.status)}
      >
        {STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
    enableColumnFilter: true,
    meta: {
      label: "상태",
      variant: "select",
      options: STATUS_OPTIONS,
    },
  },
  {
    accessorKey: "reason",
    header: "신청 사유",
    cell: ({ row }) => <ApplicationDialog data={row.original} />,
    meta: { label: "신청 사유" },
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }: { column: Column<CreatorApplication, unknown> }) => (
      <DataTableColumnHeader column={column} title="신청일" />
    ),
    cell: ({ row }) => <DateCell value={row.original.createdAt} />,
    meta: { label: "신청일" },
  },
  {
    accessorKey: "reviewedAt",
    header: ({ column }: { column: Column<CreatorApplication, unknown> }) => (
      <DataTableColumnHeader column={column} title="처리일" />
    ),
    cell: ({ row }) => <DateCell value={row.original.reviewedAt} />,
    meta: { label: "처리일" },
  },
  {
    id: "actions",
    header: () => <div className="text-center">관리</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <CellAction data={row.original} />
      </div>
    ),
    meta: { label: "관리" },
    enableSorting: false,
  },
];
