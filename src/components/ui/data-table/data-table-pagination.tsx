import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";

interface DataTablePaginationProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const rowCount = table.getRowCount();
  const shown = table.getRowModel().rows.length;
  const from = shown > 0 ? pageIndex * pageSize + 1 : 0;
  const selected = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div
      className={cn(
        "text-muted-foreground flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs",
        className,
      )}
      {...props}
    >
      <div className="whitespace-nowrap tabular-nums">
        {selected > 0
          ? `${rowCount.toLocaleString()}개 중 ${selected}개 선택됨`
          : shown > 0
            ? `${rowCount.toLocaleString()}개 중 ${from}–${from + shown - 1}`
            : `${rowCount.toLocaleString()}개`}
      </div>
      <div className="flex items-center gap-1">
        <span className="mr-1 whitespace-nowrap">페이지당</span>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="mr-2 h-[26px] gap-1 px-2 text-xs [&_svg]:size-3.5 [&[data-size]]:h-[26px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          aria-label="첫 페이지"
          variant="outline"
          size="icon-sm"
          className="hidden sm:inline-flex"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <DoubleArrowLeftIcon />
        </Button>
        <Button
          aria-label="이전 페이지"
          variant="outline"
          size="icon-sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeftIcon />
        </Button>
        <span className="text-foreground px-1.5 tabular-nums">
          {pageIndex + 1} / {Math.max(table.getPageCount(), 1)}
        </span>
        <Button
          aria-label="다음 페이지"
          variant="outline"
          size="icon-sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRightIcon />
        </Button>
        <Button
          aria-label="마지막 페이지"
          variant="outline"
          size="icon-sm"
          className="hidden sm:inline-flex"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <DoubleArrowRightIcon />
        </Button>
      </div>
    </div>
  );
}
