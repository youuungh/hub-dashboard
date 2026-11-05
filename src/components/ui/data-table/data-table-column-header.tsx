"use client";

import type { Column } from "@tanstack/react-table";
import { EyeOff } from "lucide-react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isCentered } from "@/components/ui/data-table/column-kinds";
import { cn } from "@/lib/utils";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CaretSortIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.ComponentProps<typeof DropdownMenuTrigger> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  // 마우스로 연 메뉴는 닫혀도 포커스를 되돌리지 않아 테두리가 안 남음
  const openedByPointer = React.useRef(false);

  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onPointerDown={() => {
          openedByPointer.current = true;
        }}
        onKeyDown={() => {
          openedByPointer.current = false;
        }}
        className={cn(
          // 32px 머리줄 안에 24px로, 테두리는 키보드 이동 때만
          "hover:bg-foreground/[0.06] hover:text-foreground data-[state=open]:bg-foreground/[0.06] data-[state=open]:text-foreground focus-visible:ring-ring [&_svg]:text-muted-foreground flex h-6 items-center gap-1 rounded-md px-1.5 transition-colors outline-none focus-visible:ring-2 [&_svg]:size-3.5 [&_svg]:shrink-0",
          // 왼쪽 칸은 글자가 내용과 같은 선에 오도록 여백만큼 당김
          isCentered(column) ? "mx-auto" : "-ml-1.5",
          className,
        )}
        {...props}
      >
        {title}
        {column.getCanSort() &&
          (column.getIsSorted() === "desc" ? (
            <ChevronDownIcon />
          ) : column.getIsSorted() === "asc" ? (
            <ChevronUpIcon />
          ) : (
            <CaretSortIcon />
          ))}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-36"
        onCloseAutoFocus={(event) => {
          if (openedByPointer.current) event.preventDefault();
        }}
      >
        {column.getCanSort() && (
          <>
            <DropdownMenuCheckboxItem
              className="[&_svg]:text-muted-foreground relative pr-8 pl-2 whitespace-nowrap [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
              checked={column.getIsSorted() === "asc"}
              onClick={() => column.toggleSorting(false)}
            >
              <ChevronUpIcon />
              오름차순
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              className="[&_svg]:text-muted-foreground relative pr-8 pl-2 whitespace-nowrap [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
              checked={column.getIsSorted() === "desc"}
              onClick={() => column.toggleSorting(true)}
            >
              <ChevronDownIcon />
              내림차순
            </DropdownMenuCheckboxItem>
            {column.getIsSorted() && (
              <DropdownMenuItem
                className="[&_svg]:text-muted-foreground pl-2 whitespace-nowrap"
                onClick={() => column.clearSorting()}
              >
                <Cross2Icon />
                정렬 해제
              </DropdownMenuItem>
            )}
          </>
        )}
        {column.getCanHide() && (
          <DropdownMenuCheckboxItem
            className="[&_svg]:text-muted-foreground relative pr-8 pl-2 whitespace-nowrap [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
            checked={!column.getIsVisible()}
            onClick={() => column.toggleVisibility(false)}
          >
            <EyeOff />열 숨기기
          </DropdownMenuCheckboxItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
