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
import { DatabaseMetrics } from "@/types/monitoring";
import {
  Database,
  Activity,
  Users,
  Maximize2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";
import { isConnectionWarning } from "../utils";

interface DatabaseMetricsProps {
  metrics: DatabaseMetrics;
}

export function DatabaseMetricsCard({ metrics }: DatabaseMetricsProps) {
  const connectionUsagePercent =
    metrics.maxConnections > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (metrics.totalConnections / metrics.maxConnections) * 100,
          ),
        )
      : 0;
  const activePercent =
    metrics.maxConnections > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (metrics.activeConnections / metrics.maxConnections) * 100,
          ),
        )
      : 0;
  const idlePercent =
    metrics.maxConnections > 0
      ? Math.min(
          100,
          Math.max(0, (metrics.idleConnections / metrics.maxConnections) * 100),
        )
      : 0;

  const connectionWarning = isConnectionWarning(connectionUsagePercent);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">활성 연결</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>현재 활성화된 데이터베이스 연결 수입니다.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.activeConnections}
            </div>
            <div className="mt-2">
              <Progress value={activePercent} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activePercent.toFixed(1)}% (최대 대비)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">유휴 연결</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>현재 유휴 상태인 데이터베이스 연결 수입니다.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.idleConnections}</div>
            <div className="mt-2">
              <Progress value={idlePercent} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {idlePercent.toFixed(1)}% (최대 대비)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">전체 연결</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    전체 데이터베이스 연결 수입니다.
                    <br />
                    90% 이상이면 경고가 표시됩니다.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalConnections}</div>
            <div className="mt-2">
              <Progress value={connectionUsagePercent} className="h-2" />
            </div>
            <p
              className={`text-xs mt-1 ${connectionWarning ? "text-destructive font-medium" : "text-muted-foreground"}`}
            >
              {connectionUsagePercent.toFixed(1)}% of {metrics.maxConnections}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">최대 연결</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>데이터베이스 연결 풀의 최대 연결 수입니다.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Maximize2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.maxConnections}</div>
            <p className="text-xs text-muted-foreground">풀 용량</p>
          </CardContent>
        </Card>
      </div>

      <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>커넥션 풀 상태</CardTitle>
                {connectionWarning && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    사용량 높음
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
                  <span className="text-muted-foreground">활성</span>
                  <span className="font-medium">
                    {metrics.activeConnections}개 연결
                  </span>
                </div>
                <Progress value={activePercent} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">유휴</span>
                  <span className="font-medium">
                    {metrics.idleConnections}개 연결
                  </span>
                </div>
                <Progress value={idlePercent} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">전체 사용량</span>
                  <div className="flex items-center gap-2">
                    {connectionWarning && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      </Badge>
                    )}
                    <span className="font-medium">
                      {metrics.totalConnections} / {metrics.maxConnections}
                    </span>
                  </div>
                </div>
                <Progress value={connectionUsagePercent} />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
