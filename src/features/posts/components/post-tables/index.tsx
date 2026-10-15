"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { ColumnDef } from "@tanstack/react-table";
import type { AdminPost } from "@/types/post";

interface PostTableProps {
  data: AdminPost[];
  pageCount: number;
  totalCount: number;
  columns: ColumnDef<AdminPost>[];
  loading?: boolean;
  stale?: boolean;
}

export function PostTable({
  data,
  pageCount,
  totalCount,
  columns,
  loading,
  stale,
}: PostTableProps) {
  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    rowCount: totalCount,
    debounceMs: 500,
  });

  return (
    <DataTable table={table} loading={loading} stale={stale}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
