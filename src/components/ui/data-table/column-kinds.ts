import type { Column } from "@tanstack/react-table";
import type { ColumnKind } from "@/types/data-table";

// 열 폭·정렬은 종류로만 정함. 긴 글(text)은 고정 폭 없이 남는 폭을 가져감
const KIND_WIDTHS: Record<ColumnKind, number | undefined> = {
  entity: 160,
  badge: 110,
  number: 96,
  date: 112,
  meter: 160,
  actions: 160,
  text: undefined,
};

// 긴 글 열이 없는 표에서 남는 폭을 나눠 받는 짧은 칸, 이름·버튼 칸은 고정
const STRETCH_KINDS = new Set<ColumnKind>(["badge", "number", "date", "meter"]);

// 짧은 값은 칸 가운데, 이름·긴 글은 왼쪽
const CENTER_KINDS = new Set<ColumnKind>([
  "badge",
  "number",
  "date",
  "meter",
  "actions",
]);

export function baseWidth<TData>(column: Column<TData>): number | undefined {
  const meta = column.columnDef.meta;
  return meta?.width ?? (meta?.kind ? KIND_WIDTHS[meta.kind] : undefined);
}

export function stretches<TData>(column: Column<TData>): boolean {
  const meta = column.columnDef.meta;
  return meta?.stretch ?? STRETCH_KINDS.has(meta?.kind ?? "text");
}

export function isCentered<TData>(column: Column<TData>): boolean {
  return CENTER_KINDS.has(column.columnDef.meta?.kind ?? "text");
}
