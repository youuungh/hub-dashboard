"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { parseServerDate } from "@/lib/format";

const FULL = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeStyle: "short",
});
const SHORT = new Intl.DateTimeFormat("ko-KR", {
  month: "numeric",
  day: "numeric",
});

// 짧게 보이고 정확한 값은 hover로
export function DateCell({ value }: { value?: string | null }) {
  if (!value) return <span className="text-muted-foreground">-</span>;

  const date = parseServerDate(value);
  if (Number.isNaN(date.getTime())) {
    return <span className="text-muted-foreground">-</span>;
  }

  const now = new Date();
  // 경과 시간이 아니라 달력 날짜로 셈
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);
  // ko-KR 숫자 날짜는 "10. 23."처럼 끝에 점이 붙어 뗌
  const short = SHORT.format(date).replace(/\.$/, "");
  const label =
    diffDays === 0
      ? "오늘"
      : diffDays === 1
        ? "어제"
        : diffDays < 7
          ? `${diffDays}일 전`
          : date.getFullYear() === now.getFullYear()
            ? short
            : `${date.getFullYear().toString().slice(2)}. ${short}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help text-sm whitespace-nowrap tabular-nums">
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent>{FULL.format(date)}</TooltipContent>
    </Tooltip>
  );
}
