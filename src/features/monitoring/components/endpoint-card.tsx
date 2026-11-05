"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { PanelHeader } from "@/components/panel-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { HttpMetrics } from "@/types/monitoring";

type SortField = "count" | "avgTime";

function formatMs(ms: number) {
  if (ms < 1) return `${ms.toFixed(2)}ms`;
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function SortButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // 다른 표의 열 머리글과 같은 24px 알약, 오른쪽 정렬이라 오른쪽으로 당김
        "hover:text-foreground hover:bg-foreground/[0.06] focus-visible:ring-ring -mr-1.5 ml-auto inline-flex h-6 items-center gap-1 rounded-md px-1.5 transition-colors outline-none focus-visible:ring-2",
        active && "text-foreground",
      )}
    >
      {label}
      {active ? (
        <ArrowDown className="size-3.5" />
      ) : (
        <ArrowUp className="size-3.5 opacity-30" />
      )}
    </button>
  );
}

// 평소엔 상위만, 검색하거나 펼치면 전부
const TOP_COUNT = 5;

export function EndpointCard({ metrics }: { metrics: HttpMetrics }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortField>("count");
  const [expanded, setExpanded] = useState(false);

  const maxCount = Math.max(1, ...metrics.endpointStats.map((s) => s.count));
  const rows = useMemo(
    () =>
      metrics.endpointStats
        .filter((s) => s.endpoint.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => b[sort] - a[sort]),
    [metrics.endpointStats, query, sort],
  );
  const showAll = expanded || query.trim() !== "";
  const visible = showAll ? rows : rows.slice(0, TOP_COUNT);

  return (
    <Card className="gap-0 py-0">
      <PanelHeader
        title="엔드포인트 통계"
        aside={
          <div className="relative w-64 max-w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="엔드포인트 검색"
              aria-label="엔드포인트 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-[26px] pl-7 text-xs md:text-xs"
            />
          </div>
        }
      />
      <Table>
        {/* 페이지 스크롤에 붙어 따라오지 않게 고정하지 않음 */}
        <TableHeader className="bg-thead">
          <TableRow>
            <TableHead className="pl-4">엔드포인트</TableHead>
            <TableHead className="w-28 text-right">
              <SortButton
                label="요청 수"
                active={sort === "count"}
                onClick={() => setSort("count")}
              />
            </TableHead>
            <TableHead className="w-[28%]">비중</TableHead>
            <TableHead className="w-28 pr-4 text-right">
              <SortButton
                label="평균 응답"
                active={sort === "avgTime"}
                onClick={() => setSort("avgTime")}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-muted-foreground h-24 text-center"
              >
                {metrics.endpointStats.length === 0
                  ? "아직 요청이 없습니다"
                  : "엔드포인트가 없습니다"}
              </TableCell>
            </TableRow>
          ) : (
            visible.map((stat) => (
              <TableRow key={stat.endpoint}>
                <TableCell className="pl-4 font-mono text-xs">
                  {stat.endpoint}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {stat.count.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                    <div
                      className="bg-chart-1 h-full rounded-full"
                      style={{ width: `${(stat.count / maxCount) * 100}%` }}
                    />
                  </div>
                </TableCell>
                <TableCell
                  className={cn(
                    "pr-4 text-right tabular-nums",
                    stat.avgTime >= 500 && "text-destructive",
                  )}
                >
                  {formatMs(stat.avgTime)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!query.trim() && rows.length > TOP_COUNT && (
        <div className="border-t px-4 py-2.5">
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            className="text-xs font-medium hover:underline"
          >
            {expanded ? "접기" : `전체 보기 (${rows.length}개)`}
          </button>
        </div>
      )}
    </Card>
  );
}
