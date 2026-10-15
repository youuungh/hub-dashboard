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
import { SystemMetrics } from "@/types/monitoring";
import {
  Cpu,
  Clock,
  HardDrive,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";
import { isCpuWarning } from "../utils";

interface SystemMetricsProps {
  metrics: SystemMetrics;
}

export function SystemMetricsCard({ metrics }: SystemMetricsProps) {
  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes <= 0 || !isFinite(bytes)) return "0 B";
    const absBytes = Math.abs(bytes);
    if (absBytes < 1024) return `${bytes} B`;
    if (absBytes < 1024 * 1024) return `${(absBytes / 1024).toFixed(2)} KB`;
    if (absBytes < 1024 * 1024 * 1024)
      return `${(absBytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(absBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // 시스템 전체 메모리는 X, 프로세스 메모리만
  const cpuWarning = isCpuWarning(metrics.cpuUsage);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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
              {metrics.cpuUsage.toFixed(1)}%
            </div>
            <div className="mt-2">
              <Progress value={metrics.cpuUsage} className="h-2" />
            </div>
            <p
              className={`text-xs mt-1 ${cpuWarning ? "text-destructive font-medium" : "text-muted-foreground"}`}
            >
              {metrics.cpuUsage > 80
                ? "사용량 높음"
                : metrics.cpuUsage > 50
                  ? "사용량 보통"
                  : "정상"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">JVM 메모리</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>JVM이 사용 중인 힙과 비힙 메모리의 합입니다.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(metrics.processMemory)}
            </div>
            <p className="text-xs text-muted-foreground">사용 중 메모리</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">가동 시간</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>서버가 시작된 이후 경과된 시간입니다.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatUptime(metrics.uptime)}
            </div>
            <p className="text-xs text-muted-foreground">서버 구동 시간</p>
          </CardContent>
        </Card>
      </div>

      <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>시스템 리소스</CardTitle>
                {cpuWarning && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    CPU 높음
                  </Badge>
                )}
              </div>
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
                  <span className="text-muted-foreground">CPU 사용률</span>
                  <div className="flex items-center gap-2">
                    {cpuWarning && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      </Badge>
                    )}
                    <span className="font-medium">
                      {metrics.cpuUsage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Progress value={metrics.cpuUsage} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">JVM 메모리</span>
                  <span className="font-medium">
                    {formatBytes(metrics.processMemory)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">가동 시간</span>
                  <span className="font-medium">
                    {formatUptime(metrics.uptime)}
                  </span>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
