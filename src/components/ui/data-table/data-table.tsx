import { type Table as TanstackTable, flexRender } from "@tanstack/react-table";
import type * as React from "react";

import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCommonPinningStyles } from "@/lib/data-table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  /** 첫 조회 중, 본문 행은 스켈레톤 */
  loading?: boolean;
  /** 새 응답 대기 중 이전 행 표시 */
  stale?: boolean;
}

export function DataTable<TData>({
  table,
  actionBar,
  loading = false,
  stale = false,
  children,
}: DataTableProps<TData>) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {children}
      <div className="bg-card min-h-0 flex-1 overflow-hidden rounded-xl border shadow-sm">
        <div className="h-full w-full overflow-auto">
          <Table>
            <TableHeader className="bg-card/70 sticky top-0 z-10 border-b backdrop-blur-lg backdrop-saturate-180">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        ...getCommonPinningStyles({ column: header.column }),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody
              aria-busy={loading || stale}
              className={cn("transition-opacity", stale && "opacity-60")}
            >
              {loading ? (
                // 조회 중에는 본문 행만 스켈레톤
                Array.from({
                  length: table.getState().pagination.pageSize,
                }).map((_, rowIndex) => (
                  <TableRow key={rowIndex} className="hover:bg-transparent">
                    {table.getVisibleLeafColumns().map((column) => (
                      <TableCell key={column.id}>
                        <div className="flex h-9 items-center">
                          <Skeleton className="h-4 w-full max-w-40" />
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, rowIndex) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="animate-row-in"
                    style={{
                      animationDelay: `${Math.min(rowIndex, 24) * 18}ms`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          ...getCommonPinningStyles({ column: cell.column }),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-24 text-center"
                  >
                    결과가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  );
}
