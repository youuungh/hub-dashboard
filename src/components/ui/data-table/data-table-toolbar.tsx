"use client";

import type { Column, Table } from "@tanstack/react-table";
import * as React from "react";

import { DataTableDateFilter } from "@/components/ui/data-table/data-table-date-filter";
import { DataTableFacetedFilter } from "@/components/ui/data-table/data-table-faceted-filter";
import { DataTableSliderFilter } from "@/components/ui/data-table/data-table-slider-filter";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Search } from "lucide-react";

interface DataTableToolbarProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
  children,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const columns = React.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table],
  );
  const tabColumn = columns.find((column) => column.columnDef.meta?.asTabs);
  const filterColumns = columns.filter((column) => column !== tabColumn);

  // 탭은 전체 탭이 초기화 역할
  const isFiltered = table
    .getState()
    .columnFilters.some((filter) => filter.id !== tabColumn?.id);

  const onReset = React.useCallback(() => {
    table.setColumnFilters((filters) =>
      filters.filter((filter) => filter.id === tabColumn?.id),
    );
  }, [table, tabColumn]);

  const filters = (
    <>
      {filterColumns.map((column) => (
        <DataTableToolbarFilter key={column.id} column={column} />
      ))}
      {isFiltered && (
        <Button
          aria-label="필터 초기화"
          variant="outline"
          size="sm"
          className="border-dashed"
          onClick={onReset}
        >
          <Cross2Icon />
          초기화
        </Button>
      )}
    </>
  );

  // 탭은 제목 밑, 필터는 회색 띠
  return (
    <>
      {tabColumn && <DataTableTabsFilter column={tabColumn} />}
      <div
        role="toolbar"
        aria-orientation="horizontal"
        className={cn(
          "flex w-full shrink-0 flex-wrap items-center gap-2 border-y px-4 py-2 md:px-6",
          !tabColumn && "mt-4",
          className,
        )}
        {...props}
      >
        {filters}
        <div className="ml-auto flex items-center gap-2">
          {children}
          <DataTableViewOptions table={table} />
        </div>
      </div>
    </>
  );
}

function DataTableTabsFilter<TData>({ column }: { column: Column<TData> }) {
  const meta = column.columnDef.meta;
  const filterValue = column.getFilterValue();
  const selected = Array.isArray(filterValue) ? filterValue[0] : undefined;
  const tabs = [{ label: "전체", value: undefined }, ...(meta?.options ?? [])];

  return (
    <div
      role="tablist"
      aria-label={meta?.label}
      className="flex shrink-0 items-stretch gap-5 overflow-x-auto px-4 pt-2 md:px-6"
    >
      {tabs.map((tab) => {
        const active = tab.value === selected;
        return (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() =>
              column.setFilterValue(tab.value ? [tab.value] : undefined)
            }
            className={cn(
              "text-muted-foreground hover:text-foreground focus-visible:outline-ring border-b-2 border-transparent px-px pt-1.5 pb-2.5 text-[13px] whitespace-nowrap transition-colors focus-visible:outline-2",
              active && "text-foreground border-foreground font-medium",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>;
}

function DataTableToolbarFilter<TData>({
  column,
}: DataTableToolbarFilterProps<TData>) {
  const columnMeta = column.columnDef.meta;
  const filterValue = (column.getFilterValue() as string) ?? "";
  const [inputValue, setInputValue] = React.useState<string>(filterValue);

  // 필터 값이 외부에서 변경되면 입력값 동기화
  React.useEffect(() => {
    setInputValue(filterValue);
  }, [filterValue]);

  const handleSearch = React.useCallback(() => {
    column.setFilterValue(inputValue);
  }, [column, inputValue]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch],
  );

  if (!columnMeta?.variant) return null;

  switch (columnMeta.variant) {
    case "text":
      return (
        <div className="relative w-[260px] max-w-full">
          <button
            type="button"
            aria-label="검색"
            onClick={handleSearch}
            className="text-muted-foreground hover:text-foreground absolute inset-y-0 left-0 flex w-7 items-center justify-center"
          >
            <Search className="size-3.5" />
          </button>
          <Input
            type="search"
            placeholder={columnMeta.placeholder ?? columnMeta.label}
            aria-label={columnMeta.placeholder ?? columnMeta.label}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            className="h-[26px] pl-7 text-xs md:text-xs"
          />
        </div>
      );

    case "number":
      return (
        <div className="relative">
          <Input
            type="number"
            inputMode="numeric"
            placeholder={columnMeta.placeholder ?? columnMeta.label}
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(event) => column.setFilterValue(event.target.value)}
            className={cn(
              "h-[26px] w-[120px] text-xs md:text-xs",
              columnMeta.unit && "pr-8",
            )}
          />
          {columnMeta.unit && (
            <span className="bg-accent text-muted-foreground absolute top-0 right-0 bottom-0 flex items-center rounded-r-md px-2 text-sm">
              {columnMeta.unit}
            </span>
          )}
        </div>
      );

    case "range":
      return (
        <DataTableSliderFilter
          column={column}
          title={columnMeta.label ?? column.id}
        />
      );

    case "date":
    case "dateRange":
      return (
        <DataTableDateFilter
          column={column}
          title={columnMeta.label ?? column.id}
          multiple={columnMeta.variant === "dateRange"}
        />
      );

    case "select":
    case "multiSelect":
      return (
        <DataTableFacetedFilter
          column={column}
          title={columnMeta.label ?? column.id}
          options={columnMeta.options ?? []}
          multiple={columnMeta.variant === "multiSelect"}
        />
      );

    default:
      return null;
  }
}
