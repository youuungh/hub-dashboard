import type { DataTableConfig } from "@/config/data-table";
import type { ColumnSort, RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- 선언 병합은 원본과 동일한 타입 파라미터 시그니처 필요
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    placeholder?: string;
    variant?: FilterVariant;
    options?: Option[];
    range?: [number, number];
    unit?: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    /** select 필터를 표 위 탭으로 표시 */
    asTabs?: boolean;
    /** 열 폭은 종류로 정함, 없으면 긴 글처럼 남는 폭을 나눠 가짐 */
    kind?: ColumnKind;
    /** 종류 폭이 안 맞는 열만 px로 덮어씀 */
    width?: number;
    /** 남는 폭을 나눠 받을지, 종류 기본값을 덮어씀 */
    stretch?: boolean;
  }
}

export type ColumnKind =
  "entity" | "badge" | "number" | "date" | "meter" | "actions" | "text";

export interface Option {
  label: string;
  value: string;
  count?: number;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export type FilterVariant = DataTableConfig["filterVariants"][number];
export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, "id"> {
  id: Extract<keyof TData, string>;
}
