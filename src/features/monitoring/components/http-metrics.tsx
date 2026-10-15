"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HttpMetrics } from "@/types/monitoring";
import {
  Globe,
  Clock,
  AlertCircle,
  Activity,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  HelpCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface HttpMetricsProps {
  metrics: HttpMetrics;
}

type SortField = "endpoint" | "count" | "avgTime";
type SortDirection = "asc" | "desc";

export function HttpMetricsCard({ metrics }: HttpMetricsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("count");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // 초당 요청 계산용 이전 값
  const prevRequestsRef = useRef<{ count: number; timestamp: number } | null>(
    null,
  );
  const [calculatedRequestsPerSecond, setCalculatedRequestsPerSecond] =
    useState<number>(0);

  const formatTime = (ms: number) => {
    if (ms < 1) return `${ms.toFixed(2)}ms`;
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatErrorRate = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  const getResponseTimeColor = (ms: number) => {
    if (ms < 100) return "text-emerald-600 dark:text-emerald-400";
    if (ms < 300) return "text-yellow-600";
    if (ms < 500) return "text-orange-600";
    return "text-destructive";
  };

  const hasData = metrics.totalRequests > 0;

  useEffect(() => {
    const now = Date.now();
    const prev = prevRequestsRef.current;

    if (prev) {
      const timeDiffSeconds = (now - prev.timestamp) / 1000;
      const requestDiff = metrics.totalRequests - prev.count;

      if (timeDiffSeconds > 0) {
        const requestsPerSecond = requestDiff / timeDiffSeconds;
        setCalculatedRequestsPerSecond(Math.max(0, requestsPerSecond));
      }
    }

    prevRequestsRef.current = {
      count: metrics.totalRequests,
      timestamp: now,
    };
  }, [metrics.totalRequests]);

  const filteredAndSortedStats = useMemo(() => {
    let filtered = metrics.endpointStats.filter((stat) =>
      stat.endpoint.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortField) {
          case "endpoint":
            aValue = a.endpoint;
            bValue = b.endpoint;
            break;
          case "count":
            aValue = a.count;
            bValue = b.count;
            break;
          case "avgTime":
            aValue = a.avgTime;
            bValue = b.avgTime;
            break;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          return sortDirection === "asc"
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number);
        }
      });
    }

    return filtered;
  }, [metrics.endpointStats, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // 같은 필드면 방향만 뒤집음
      if (sortDirection === "desc") {
        setSortDirection("asc");
      } else {
        setSortDirection("desc");
      }
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  return (
    <div className="space-y-3">
      {!hasData && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">HTTP 요청 데이터가 아직 없습니다.</p>
              <p className="text-xs mt-2">
                API 요청이 발생하면 메트릭이 표시됩니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">총 요청</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>서버 시작 이후 총 HTTP 요청 수입니다.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalRequests.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasData ? "누적 요청" : "아직 요청이 없습니다"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                평균 응답 시간
              </CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>모든 HTTP 요청의 평균 응답 시간입니다.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(metrics.avgResponseTime)}
            </div>
            <p className="text-xs text-muted-foreground">평균 지연</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">오류율</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    4xx, 5xx 에러 응답의 비율입니다.
                    <br />
                    5% 이상이면 높은 에러율로 표시됩니다.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatErrorRate(metrics.errorRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.errorRate > 0.05 ? (
                <span className="text-destructive">오류율 높음</span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">
                  정상
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">초당 요청</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    초당 요청 수입니다.
                    <br />
                    실시간으로 계산되어 표시됩니다.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasData ? calculatedRequestsPerSecond.toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasData ? "현재 처리량" : "계산 중..."}
            </p>
          </CardContent>
        </Card>
      </div>

      {hasData && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>엔드포인트 통계</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="엔드포인트 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-card max-h-[500px] overflow-y-auto rounded-md border">
              <Table>
                <TableHeader className="bg-card/70 sticky top-0 z-10 border-b backdrop-blur-lg backdrop-saturate-180">
                  <TableRow>
                    <TableHead className="pl-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-2 px-2"
                        onClick={() => handleSort("endpoint")}
                      >
                        엔드포인트
                        {getSortIcon("endpoint")}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right pr-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -mr-2 px-2"
                        onClick={() => handleSort("count")}
                      >
                        요청 수{getSortIcon("count")}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right pr-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -mr-2 px-2"
                        onClick={() => handleSort("avgTime")}
                      >
                        평균 시간
                        {getSortIcon("avgTime")}
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedStats.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-8"
                      >
                        {searchQuery
                          ? "엔드포인트가 없습니다"
                          : "엔드포인트 데이터가 없습니다"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedStats.map((stat, index) => (
                      <TableRow key={`${stat.endpoint}-${index}`}>
                        <TableCell
                          className="font-mono text-sm max-w-[400px] truncate"
                          title={stat.endpoint}
                        >
                          {stat.endpoint}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {stat.count.toLocaleString()}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${getResponseTimeColor(stat.avgTime)}`}
                        >
                          {formatTime(stat.avgTime)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {filteredAndSortedStats.length > 0 && (
              <p className="text-xs text-muted-foreground mt-4">
                전체 {metrics.endpointStats.length}개 중{" "}
                {filteredAndSortedStats.length}개 표시
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
