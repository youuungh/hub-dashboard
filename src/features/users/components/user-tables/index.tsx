"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";

interface UserTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
  totalPages?: number;
  columns: ColumnDef<TData, TValue>[];
  loading?: boolean;
  stale?: boolean;
}

export function UserTable<TData, TValue>({
  data,
  totalItems,
  totalPages,
  columns,
  loading,
  stale,
}: UserTableParams<TData, TValue>) {
  const [pageSize] = useQueryState("perPage", parseAsInteger.withDefault(20));

  // totalPages가 없으면 직접 계산
  const pageCount = totalPages ?? Math.ceil(totalItems / pageSize);

  // URL만 바꿈, 서버 이동이면 조회가 두 번
  const { table } = useDataTable({
    data,
    columns,
    pageCount: pageCount,
    rowCount: totalItems,
    debounceMs: 500,
  });

  return (
    <DataTable table={table} loading={loading} stale={stale}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
