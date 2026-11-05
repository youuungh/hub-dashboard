"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { KpiItem, KpiStrip } from "@/components/kpi-strip";
import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { EndpointCard } from "./endpoint-card";
import { MaintenanceCard } from "./maintenance-card";
import { DatabaseCard, JvmCard, SystemCard } from "./resource-cards";
import { useMonitoring } from "../use-monitoring";
import { errorRateOf, formatUptime } from "../utils";

const MONITORING_INTERVAL_MS = 5000;

export default function MonitoringView() {
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const monitoring = useMonitoring(
    autoRefresh ? MONITORING_INTERVAL_MS : false,
  );
  const metrics = monitoring.data?.metrics ?? null;
  const health = monitoring.data?.health ?? null;
  const healthy = health?.status === "UP";
  const errors = metrics ? errorRateOf(metrics.http) : null;

  // 초당 요청은 직전 갱신과의 누적 요청 차이로 계산, 첫 갱신 전엔 계산 중
  const lastSample = useRef<{ count: number; at: number } | null>(null);
  const [requestsPerSecond, setRequestsPerSecond] = useState<number | null>(
    null,
  );
  const totalRequests = metrics?.http.totalRequests;
  useEffect(() => {
    if (totalRequests === undefined) return;
    const now = Date.now();
    const last = lastSample.current;
    if (last && now > last.at) {
      setRequestsPerSecond(
        Math.max(0, (totalRequests - last.count) / ((now - last.at) / 1000)),
      );
    }
    lastSample.current = { count: totalRequests, at: now };
  }, [totalRequests]);

  const refresh = async () => {
    setRefreshing(true);
    const result = await monitoring.refetch();
    // 첫 실패는 공통 오류 처리가 알림
    if (result.isError && result.data !== undefined) {
      toast.error("모니터링 데이터를 불러오는데 실패했습니다");
    }
    setRefreshing(false);
  };

  return (
    <PageContainer className="gap-6 md:px-8 md:pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-semibold tracking-tight">서버 상태</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="cursor-pointer text-xs">
              자동 갱신
            </Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={refreshing || monitoring.isPending}
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} />
            새로고침
          </Button>
        </div>
      </div>

      {monitoring.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-[92px] w-full rounded-lg" />
          <Skeleton className="h-80 w-full rounded-lg" />
        </div>
      ) : metrics && health ? (
        <>
          <KpiStrip>
            <KpiItem
              title="상태"
              text={healthy ? "정상" : "확인 필요"}
              footer={
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      healthy ? "bg-green-600" : "bg-destructive",
                    )}
                  />
                  헬스 체크 {health.status}
                </span>
              }
            />
            <KpiItem title="가동 시간" text={formatUptime(health.uptime)} />
            <KpiItem
              title="평균 지연"
              text={`${Math.round(metrics.http.avgResponseTime)}ms`}
              footer={
                requestsPerSecond === null
                  ? "처리량 계산 중"
                  : `초당 ${requestsPerSecond.toFixed(1)}건 처리`
              }
            />
            <KpiItem
              title={errors!.title}
              text={`${(errors!.rate * 100).toFixed(2)}%`}
              danger={errors!.warn}
              footer={`요청 ${metrics.http.totalRequests.toLocaleString()}건 중 ${Math.round(errors!.rate * metrics.http.totalRequests).toLocaleString()}건`}
            />
          </KpiStrip>

          <EndpointCard metrics={metrics.http} />

          <div className="grid gap-3 lg:grid-cols-2">
            <JvmCard metrics={metrics.jvm} />
            <DatabaseCard metrics={metrics.database} />
            <SystemCard metrics={metrics.system} />
            <MaintenanceCard />
          </div>
        </>
      ) : (
        <p className="text-muted-foreground p-8 text-center">
          데이터를 불러올 수 없습니다
        </p>
      )}
    </PageContainer>
  );
}
