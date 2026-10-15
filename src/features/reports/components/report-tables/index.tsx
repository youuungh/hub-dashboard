"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { ColumnDef } from "@tanstack/react-table";
import type { ReportedTarget } from "@/types/report";

interface ReportTableProps {
  data: ReportedTarget[];
  pageCount: number;
  totalCount: number;
  columns: ColumnDef<ReportedTarget>[];
  loading?: boolean;
  stale?: boolean;
}

export function ReportTable({
  data,
  pageCount,
  totalCount,
  columns,
  loading,
  stale,
}: ReportTableProps) {
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
