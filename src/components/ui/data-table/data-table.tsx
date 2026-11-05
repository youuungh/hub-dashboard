import {
  type Column,
  type Table as TanstackTable,
  flexRender,
} from "@tanstack/react-table";
import * as React from "react";

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
import {
  baseWidth,
  isCentered,
  stretches,
} from "@/components/ui/data-table/column-kinds";

// 화면이 좁아도 긴 글 열이 이 폭 밑으로는 안 줄고 표가 옆으로 스크롤됨
const TEXT_MIN_WIDTH = 280;

// 가운데 칸은 안쪽 flex 묶음도 가운데로
const CENTER_CELL = "text-center [&>div]:justify-center";

// 긴 글 열이 없을 때만 남는 폭을 늘어나는 열에 나눔
function columnWidths<TData>(
  columns: Column<TData>[],
  boxWidth: number,
): (number | undefined)[] {
  const bases = columns.map(baseWidth);
  if (bases.some((width) => width === undefined)) return bases;

  const total = bases.reduce<number>((sum, width) => sum + (width ?? 0), 0);
  const stretchTotal = columns.reduce(
    (sum, column, index) =>
      stretches(column) ? sum + (bases[index] ?? 0) : sum,
    0,
  );
  const extra = boxWidth - total;
  if (extra <= 0 || stretchTotal === 0) return bases;

  return columns.map((column, index) => {
    const base = bases[index] ?? 0;
    return stretches(column)
      ? Math.floor(base + (extra * base) / stretchTotal)
      : base;
  });
}

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
  const boxRef = React.useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = React.useState(0);

  React.useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    setBoxWidth(box.clientWidth);
    const observer = new ResizeObserver(() => setBoxWidth(box.clientWidth));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const columns = table.getVisibleLeafColumns();
  const widths = columnWidths(columns, boxWidth);
  const widthOf = new Map(
    columns.map((column, index) => [column.id, widths[index]]),
  );
  const fluidCount = widths.filter((width) => width === undefined).length;
  const minWidth =
    columns
      .map(baseWidth)
      .reduce<number>((sum, width) => sum + (width ?? 0), 0) +
    fluidCount * TEXT_MIN_WIDTH;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {children}
      {/* 브라우저 기본 스크롤, 막대 자리는 늘 비워 둬서 열 폭이 흔들리지 않게 */}
      <div
        ref={boxRef}
        className="bg-thead-gutter scroll-below-thead min-h-0 w-full flex-1 overflow-auto [scrollbar-gutter:stable]"
      >
        <Table className="table-fixed" style={{ minWidth }}>
          <TableHeader className="bg-thead sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(isCentered(header.column) && CENTER_CELL)}
                    style={{
                      ...getCommonPinningStyles({ column: header.column }),
                      width: widthOf.get(header.column.id),
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
              Array.from({
                length: table.getState().pagination.pageSize,
              }).map((_, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-transparent">
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn(isCentered(column) && CENTER_CELL)}
                    >
                      <div className="flex h-8 items-center">
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
                      className={cn(isCentered(cell.column) && CENTER_CELL)}
                      style={{
                        ...getCommonPinningStyles({ column: cell.column }),
                        width: widthOf.get(cell.column.id),
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
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  결과가 없습니다
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        table={table}
        className="bg-background shrink-0 border-t px-4 py-2 md:px-6"
      />
      {actionBar &&
        table.getFilteredSelectedRowModel().rows.length > 0 &&
        actionBar}
    </div>
  );
}
