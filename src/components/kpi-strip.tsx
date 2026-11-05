"use client";

import { ArrowDownRight, ArrowUpRight, HelpCircle } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function KpiStrip({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
  );
}

interface KpiItemProps {
  title: string;
  tooltip?: string;
  value?: number;
  /** 숫자 대신 그대로 보일 글자, 카운트업 없음 */
  text?: string;
  prefix?: string;
  suffix?: string;
  /** 증감률, null이면 숨김 */
  delta?: number | null;
  deltaLabel?: string;
  /** 숫자 아래 줄, delta 대신 */
  footer?: React.ReactNode;
  /** 기준을 넘은 값은 빨갛게 */
  danger?: boolean;
}

export function KpiItem({
  title,
  tooltip,
  value = 0,
  text,
  prefix,
  suffix,
  delta,
  deltaLabel = "주간 평균 대비 오늘",
  footer,
  danger = false,
}: KpiItemProps) {
  const hasDelta = delta !== null && delta !== undefined && delta !== 0;
  const isUp = (delta ?? 0) > 0;

  return (
    <div className="bg-card flex min-w-0 flex-col rounded-lg border px-4 py-3.5">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <span>{title}</span>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="text-muted-foreground/70 size-3 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div
        className={cn(
          "mt-1.5 truncate text-[22px] leading-7 font-semibold tracking-tight tabular-nums",
          danger && "text-destructive",
        )}
      >
        {text ?? (
          <>
            {prefix}
            <CountUp value={value} />
            {suffix}
          </>
        )}
      </div>
      <div className="text-muted-foreground mt-1 flex min-h-4 items-center gap-1.5 text-xs">
        {hasDelta ? (
          <>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                isUp
                  ? "text-green-700 dark:text-green-500"
                  : "text-destructive",
              )}
            >
              {isUp ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {isUp ? "+" : "-"}
              {Math.abs(delta ?? 0).toFixed(1)}%
            </span>
            {deltaLabel}
          </>
        ) : (
          footer
        )}
      </div>
    </div>
  );
}
