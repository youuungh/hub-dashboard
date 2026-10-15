"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { JvmMetrics } from "@/types/monitoring";
import {
  MemoryStick,
  Cpu,
  Timer,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";
import { isMemoryWarning } from "../utils";

interface JvmMetricsProps {
  metrics: JvmMetrics;
}

export function JvmMetricsCard({ metrics }: JvmMetricsProps) {
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes <= 0 || !isFinite(bytes)) return "0 B";
    const absBytes = Math.abs(bytes);
    if (absBytes < 1024) return `${bytes} B`;
    if (absBytes < 1024 * 1024) return `${(absBytes / 1024).toFixed(2)} KB`;
    if (absBytes < 1024 * 1024 * 1024)
      return `${(absBytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(absBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatTime = (ms: number) => {
    if (!ms || ms <= 0 || !isFinite(ms)) return "0ms";
    const absMs = Math.abs(ms);
    if (absMs < 1000) return `${absMs.toFixed(0)}ms`;
    if (absMs < 60000) return `${(absMs / 1000).toFixed(1)}s`;
    return `${(absMs / 60000).toFixed(1)}m`;
  };

  const heapUsagePercent =
    metrics.heapMax > 0
      ? Math.min(100, Math.max(0, (metrics.heapUsed / metrics.heapMax) * 100))
      : 0;
  const nonHeapUsagePercent =
    metrics.nonHeapMax > 0
      ? Math.min(
          100,
          Math.max(0, (metrics.nonHeapUsed / metrics.nonHeapMax) * 100),
        )
      : 0;

  const heapWarning = isMemoryWarning(heapUsagePercent);
  const nonHeapWarning = isMemoryWarning(nonHeapUsagePercent);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">힙 사용</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    JVM 힙 메모리 사용량입니다.
                    <br />
                    90% 이상이면 경고가 표시됩니다.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(metrics.heapUsed)}
            </div>
            <div className="mt-2">
              <Progress value={heapUsagePercent} className="h-2" />
            </div>
            <p
              className={`text-xs mt-1 ${heapWarning ? "text-destructive font-medium" : "text-muted-foreground"}`}
            >
              {heapUsagePercent.toFixed(1)}% of {formatBytes(metrics.heapMax)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">논힙 사용</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    JVM 비힙 메모리 사용량입니다.
                    <br />
                    메타스페이스, 코드 캐시 등을 포함합니다.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(metrics.nonHeapUsed)}
            </div>
            <div className="mt-2">
              <Progress value={nonHeapUsagePercent} className="h-2" />
            </div>
            <p
              className={`text-xs mt-1 ${nonHeapWarning ? "text-destructive font-medium" : "text-muted-foreground"}`}
            >
              {nonHeapUsagePercent.toFixed(1)}% of{" "}
              {formatBytes(metrics.nonHeapMax)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">스레드</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>현재 활성화된 JVM 스레드 수입니다.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.threads.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">활성 스레드</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">GC 시간</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>가비지 컬렉션에 소요된 총 시간입니다.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(metrics.gcTime)}
            </div>
            <p className="text-xs text-muted-foreground">총 GC 시간</p>
          </CardContent>
        </Card>
      </div>

      <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>메모리 사용 상세</CardTitle>
              <CollapsibleTrigger asChild>
                <button className="cursor-pointer hover:bg-muted/50 rounded-md p-1 transition-colors">
                  {isDetailsOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">힙 메모리</span>
                  <div className="flex items-center gap-2">
                    {heapWarning && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      </Badge>
                    )}
                    <span className="font-medium">
                      {formatBytes(metrics.heapUsed)} /{" "}
                      {formatBytes(metrics.heapMax)}
                    </span>
                  </div>
                </div>
                <Progress value={heapUsagePercent} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">논힙 메모리</span>
                  <span className="font-medium">
                    {formatBytes(metrics.nonHeapUsed)} /{" "}
                    {formatBytes(metrics.nonHeapMax)}
                  </span>
                </div>
                <Progress value={nonHeapUsagePercent} />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
