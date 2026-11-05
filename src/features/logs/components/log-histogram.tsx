"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LogBucket } from "@/types/logs";
import { formatClock } from "../options";

// 기간을 60칸으로 나눈 수준별 막대, 오류가 몰린 때를 찾는 용도
export function LogHistogram({ buckets }: { buckets: LogBucket[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.error + b.warn + b.info));
  const ticks = [0, 15, 30, 45].filter((index) => buckets[index]);

  return (
    <div className="shrink-0 border-b px-4 py-3 md:px-6">
      <div className="flex h-16 items-end gap-0.5">
        {buckets.map((bucket) => {
          const total = bucket.error + bucket.warn + bucket.info;
          return (
            <Tooltip key={bucket.start}>
              <TooltipTrigger asChild>
                <div className="flex h-full min-w-0 flex-1 cursor-help flex-col-reverse gap-px">
                  <div
                    className="bg-chart-4 rounded-t-[2px]"
                    style={{ height: `${(bucket.info / max) * 100}%` }}
                  />
                  <div
                    className="rounded-t-[2px] bg-amber-500"
                    style={{ height: `${(bucket.warn / max) * 100}%` }}
                  />
                  <div
                    className="rounded-t-[2px] bg-red-600"
                    style={{ height: `${(bucket.error / max) * 100}%` }}
                  />
                  {total === 0 && <div className="bg-muted h-px" />}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {formatClock(bucket.start)}부터 · 오류 {bucket.error} · 경고{" "}
                {bucket.warn} · 정보 {bucket.info}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      <div className="text-muted-foreground mt-1.5 flex justify-between font-mono text-[11.5px]">
        {ticks.map((index) => (
          <span key={index}>{formatClock(buckets[index].start)}</span>
        ))}
        <span>지금</span>
      </div>
    </div>
  );
}
