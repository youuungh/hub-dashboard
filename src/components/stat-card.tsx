"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CountUp } from "@/components/motion/count-up";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  tooltip?: string;
  icon: LucideIcon;
  value: number;
  prefix?: string;
  /** 숫자 아래 보조 설명 */
  caption?: string;
  /** 증감률, null이면 숨김 */
  delta?: number | null;
  deltaTooltip?: string;
}

export function StatCard({
  title,
  tooltip,
  icon: Icon,
  value,
  prefix,
  caption,
  delta,
  deltaTooltip,
}: StatCardProps) {
  const hasDelta = delta !== null && delta !== undefined && delta !== 0;
  const isUp = (delta ?? 0) > 0;

  // 금액은 축약 대신 자릿수에 맞춰 글자를 줄임
  // 애니메이션 중 튀지 않게 최종 값 기준
  const rendered = `${prefix ?? ""}${value.toLocaleString()}`;
  const valueSize =
    rendered.length >= 14
      ? "text-xl"
      : rendered.length >= 11
        ? "text-2xl"
        : "text-3xl";

  return (
    <Card className="group hover:border-primary/30 h-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground text-sm font-medium">
              {title}
            </span>
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="text-muted-foreground/70 h-3.5 w-3.5 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
              </Tooltip>
            )}
          </div>
          <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105">
            <Icon className="size-4.5" />
          </span>
        </div>

        <div
          className={cn(
            "leading-none font-semibold tracking-tight tabular-nums",
            valueSize,
          )}
        >
          {prefix}
          <CountUp value={value} />
        </div>

        <div className="mt-auto flex items-center gap-2">
          {caption && (
            <span className="text-muted-foreground text-xs">{caption}</span>
          )}
          {hasDelta && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "inline-flex cursor-help items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
                    isUp
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  {isUp ? (
                    <ArrowUp className="size-3" />
                  ) : (
                    <ArrowDown className="size-3" />
                  )}
                  {Math.abs(delta ?? 0).toFixed(1)}%
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {deltaTooltip ?? "주간 평균 대비 오늘의 변화율입니다."}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
