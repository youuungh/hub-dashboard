"use client";

import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import {
  ROLE_LABELS,
  UserProfileCell,
  getRoleBadgeColor,
} from "@/components/user-profile-dialog";
import { Column, ColumnDef } from "@tanstack/react-table";
import { Text } from "lucide-react";
import { CellAction } from "./cell-action";
import { ROLE_OPTIONS } from "./options";

interface User {
  id: number;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: "USER" | "CREATOR" | "ADMIN";
  followerCount: number;
  followingCount: number;
  postCount: number;
}

export const columns: ColumnDef<User>[] = [
  {
    id: "username",
    accessorKey: "username",
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title="사용자" />
    ),
    cell: ({ row }) => (
      <UserProfileCell userId={row.original.id} user={row.original} complete />
    ),
    meta: {
      label: "사용자",
      placeholder: "아이디 검색...",
      variant: "text",
      icon: Text,
    },
    enableColumnFilter: true,
  },
  {
    id: "role",
    accessorKey: "role",
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title="권한" />
    ),
    cell: ({ cell }) => {
      const role = cell.getValue<User["role"]>();
      return (
        <Badge variant="outline" className={getRoleBadgeColor(role)}>
          {ROLE_LABELS[role] ?? role}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: "권한",
      variant: "select",
      options: ROLE_OPTIONS,
    },
  },
  {
    accessorKey: "followerCount",
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title="팔로워" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.original.followerCount.toLocaleString()}
      </div>
    ),
    meta: { label: "팔로워" },
  },
  {
    accessorKey: "followingCount",
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title="팔로잉" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.original.followingCount.toLocaleString()}
      </div>
    ),
    meta: { label: "팔로잉" },
  },
  {
    accessorKey: "postCount",
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title="게시물" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.original.postCount.toLocaleString()}
      </div>
    ),
    meta: { label: "게시물" },
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
