"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MonitoringMetrics, HealthStatus } from "@/types/monitoring";
import {
  Database,
  Cpu,
  MemoryStick,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { isMemoryWarning, isCpuWarning, isConnectionWarning } from "../utils";

interface MonitoringSummaryProps {
  metrics: MonitoringMetrics;
  health: HealthStatus;
}

export function MonitoringSummary({ metrics, health }: MonitoringSummaryProps) {
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes <= 0 || !isFinite(bytes)) return "0 B";
    const absBytes = Math.abs(bytes);
    if (absBytes < 1024) return `${bytes} B`;
    if (absBytes < 1024 * 1024) return `${(absBytes / 1024).toFixed(0)} KB`;
    if (absBytes < 1024 * 1024 * 1024)
      return `${(absBytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(absBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatTime = (ms: number) => {
    if (!ms || ms <= 0 || !isFinite(ms)) return "0s";
    const absMs = Math.abs(ms);
    if (absMs < 1000) return `${absMs.toFixed(0)}ms`;
    if (absMs < 60000) return `${(absMs / 1000).toFixed(1)}s`;
    return `${(absMs / 60000).toFixed(1)}m`;
  };

  const heapUsagePercent =
    metrics.jvm.heapMax > 0
      ? Math.min(
          100,
          Math.max(0, (metrics.jvm.heapUsed / metrics.jvm.heapMax) * 100),
        )
      : 0;
  const connectionUsagePercent =
    metrics.database.maxConnections > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (metrics.database.totalConnections /
              metrics.database.maxConnections) *
              100,
          ),
        )
      : 0;
  const isHealthy = health.status === "UP";

  const heapWarning = isMemoryWarning(heapUsagePercent);
  const cpuWarning = isCpuWarning(metrics.system.cpuUsage);
  const connectionWarning = isConnectionWarning(connectionUsagePercent);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">서버 상태</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  서버의 전반적인 상태입니다.
                  <br />
                  UP은 정상 작동 중을 의미합니다.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          {isHealthy ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={isHealthy ? "default" : "destructive"}>
              {health.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatTime(health.uptime)} 가동
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">CPU 사용률</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  시스템 CPU 사용률입니다.
                  <br />
                  90% 이상이면 경고가 표시됩니다.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.system.cpuUsage.toFixed(1)}%
          </div>
          <div className="mt-2">
            <Progress value={metrics.system.cpuUsage} className="h-2" />
          </div>
          <p
            className={`text-xs mt-1 ${cpuWarning ? "text-destructive font-medium" : "text-muted-foreground"}`}
          >
            {metrics.system.cpuUsage > 80
              ? "높음"
              : metrics.system.cpuUsage > 50
                ? "보통"
                : "정상"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">메모리</CardTitle>
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
            {formatBytes(metrics.jvm.heapUsed)}
          </div>
          <div className="mt-2">
            <Progress value={heapUsagePercent} className="h-2" />
          </div>
          <p
            className={`text-xs mt-1 ${heapWarning ? "text-destructive font-medium" : "text-muted-foreground"}`}
          >
            {heapUsagePercent.toFixed(1)}% / {formatBytes(metrics.jvm.heapMax)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">데이터베이스</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  데이터베이스 연결 풀 상태입니다.
                  <br />
                  활성 연결 수를 표시합니다.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.database.activeConnections}
          </div>
          <div className="mt-2">
            <Progress value={connectionUsagePercent} className="h-2" />
          </div>
          <p
            className={`text-xs mt-1 ${connectionWarning ? "text-destructive font-medium" : "text-muted-foreground"}`}
          >
            {metrics.database.totalConnections} /{" "}
            {metrics.database.maxConnections} 연결
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
