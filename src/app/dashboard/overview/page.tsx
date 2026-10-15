"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, UserCog, TrendingUp } from "lucide-react";
import { getUserStatistics } from "@/lib/api/users";
import { getOrderStatistics } from "@/lib/api/orders";
import { getCreatorStatistics } from "@/lib/api/creators";
import type { UserStatistics } from "@/types/user";
import type { OrderStatistics } from "@/types/order";
import type { CreatorStatistics } from "@/types/user";
import { StatCard } from "@/components/stat-card";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import PageContainer from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonitoringSummary } from "@/features/monitoring/components/monitoring-summary";
import { HttpMetricsCard } from "@/features/monitoring/components/http-metrics";
import { JvmMetricsCard } from "@/features/monitoring/components/jvm-metrics";
import { DatabaseMetricsCard } from "@/features/monitoring/components/database-metrics";
import { SystemMetricsCard } from "@/features/monitoring/components/system-metrics";
import { MaintenanceCard } from "@/features/monitoring/components/maintenance-card";
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getMonitoringMetrics, getHealthStatus } from "@/lib/api/monitoring";
import type { MonitoringMetrics, HealthStatus } from "@/types/monitoring";
import { calculateWeeklyChangeRate } from "@/features/monitoring/utils";

const MONITORING_INTERVAL_MS = 5000;

export default function OverviewPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const statistics = useQuery({
    queryKey: queryKeys.statistics,
    queryFn: async () => {
      const [users, orders, creators] = await Promise.all([
        getUserStatistics(),
        getOrderStatistics(),
        getCreatorStatistics(),
      ]);
      return { users, orders, creators };
    },
    meta: { errorMessage: "대시보드 데이터를 불러오는데 실패했습니다" },
  });
  const userStats: UserStatistics | null = statistics.data?.users ?? null;
  const orderStats: OrderStatistics | null = statistics.data?.orders ?? null;
  const creatorStats: CreatorStatistics | null =
    statistics.data?.creators ?? null;
  const loading = statistics.isPending;

  const monitoring = useQuery({
    queryKey: queryKeys.monitoring,
    queryFn: async () => {
      const [metrics, health] = await Promise.all([
        getMonitoringMetrics(),
        getHealthStatus(),
      ]);
      return { metrics, health };
    },
    // 실패하면 자동 갱신 중지, 오류 반복 방지
    refetchInterval: (query) =>
      autoRefresh && query.state.status !== "error"
        ? MONITORING_INTERVAL_MS
        : false,
    meta: { errorMessage: "모니터링 데이터를 불러오는데 실패했습니다" },
  });
  const metrics: MonitoringMetrics | null = monitoring.data?.metrics ?? null;
  const health: HealthStatus | null = monitoring.data?.health ?? null;
  const monitoringLoading = monitoring.isPending;

  const refreshMonitoring = async () => {
    setRefreshing(true);
    const result = await monitoring.refetch();
    // 첫 실패는 공통 오류 처리가 알림
    if (result.isError && result.data !== undefined) {
      toast.error("모니터링 데이터를 불러오는데 실패했습니다");
    }
    setRefreshing(false);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between space-y-2">
            <Skeleton className="h-9 w-36" />
          </div>

          <Skeleton className="h-9 w-36 rounded-full" />

          <div>
            <Skeleton className="mb-4 h-7 w-28" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="h-full">
                  <CardContent className="flex h-full flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="size-9 rounded-xl" />
                    </div>
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="mt-auto h-4 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
            {[4, 3].map((span) => (
              <div
                key={span}
                className={
                  span === 4 ? "col-span-4" : "col-span-4 md:col-span-3"
                }
              >
                <Card className="h-full">
                  <CardHeader>
                    <Skeleton className="h-6 w-24" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3, 4].map((row) => (
                      <div
                        key={row}
                        className="flex items-center justify-between"
                      >
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">대시보드</h2>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="monitoring">모니터링</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div>
              <h3 className="mb-4 text-xl font-semibold">한눈에 보기</h3>
              <StaggerGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StaggerItem>
                  <StatCard
                    title="전체 사용자"
                    tooltip="서비스에 등록된 전체 사용자 수입니다."
                    icon={Users}
                    value={userStats?.totalUsers ?? 0}
                    caption={`오늘 +${userStats?.newUsersToday ?? 0}명`}
                    delta={calculateWeeklyChangeRate(
                      userStats?.newUsersToday ?? 0,
                      userStats?.newUsersThisWeek ?? 0,
                    )}
                  />
                </StaggerItem>
                <StaggerItem>
                  <StatCard
                    title="전체 주문"
                    tooltip="누적 주문 건수입니다."
                    icon={ShoppingBag}
                    value={orderStats?.totalOrders ?? 0}
                    caption={`오늘 +${orderStats?.ordersToday ?? 0}건`}
                    delta={calculateWeeklyChangeRate(
                      orderStats?.ordersToday ?? 0,
                      orderStats?.ordersThisWeek ?? 0,
                    )}
                  />
                </StaggerItem>
                <StaggerItem>
                  <StatCard
                    title="활동 크리에이터"
                    tooltip="현재 활동 중인 크리에이터 수입니다."
                    icon={UserCog}
                    value={creatorStats?.totalActiveCreators ?? 0}
                    caption={`신청 대기 ${creatorStats?.pendingApplications ?? 0}건`}
                  />
                </StaggerItem>
                <StaggerItem>
                  <StatCard
                    title="총 매출"
                    tooltip="취소를 제외한 누적 매출입니다."
                    icon={TrendingUp}
                    prefix="₩"
                    value={Math.floor(
                      parseFloat(orderStats?.totalRevenue || "0"),
                    )}
                    caption={`이번 달 ₩${Math.floor(
                      parseFloat(orderStats?.revenueThisMonth || "0"),
                    ).toLocaleString()}`}
                    delta={calculateWeeklyChangeRate(
                      parseFloat(orderStats?.revenueToday || "0"),
                      parseFloat(orderStats?.revenueThisWeek || "0"),
                    )}
                    deltaTooltip="주간 평균 매출 대비 오늘의 변화율입니다."
                  />
                </StaggerItem>
              </StaggerGroup>

              <StaggerGroup className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7 mt-6">
                <StaggerItem className="col-span-4">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>사용자 통계</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          전체 사용자
                        </span>
                        <span className="font-medium">
                          {userStats?.totalUsers.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          크리에이터
                        </span>
                        <span className="font-medium">
                          {userStats?.totalCreators.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          이번 주 신규
                        </span>
                        <span className="font-medium text-green-600">
                          +{userStats?.newUsersThisWeek.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          활성 사용자 (최근 30일)
                        </span>
                        <span className="font-medium">
                          {userStats?.activeUsers.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>

                <StaggerItem className="col-span-4 md:col-span-3">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>주문 통계</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          전체 주문
                        </span>
                        <span className="font-medium">
                          {orderStats?.totalOrders.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          결제 대기
                        </span>
                        <span className="font-medium text-yellow-600">
                          {orderStats?.pendingOrders.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          완료
                        </span>
                        <span className="font-medium text-green-600">
                          {orderStats?.completedOrders.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          취소
                        </span>
                        <span className="font-medium text-red-600">
                          {orderStats?.cancelledOrders.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          평균 주문 금액
                        </span>
                        <span className="font-medium">
                          ₩
                          {Math.floor(
                            parseFloat(orderStats?.avgOrderValue || "0"),
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          이번 주 주문
                        </span>
                        <span className="font-medium">
                          {orderStats?.ordersThisWeek.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              </StaggerGroup>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">서버 상태</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="auto-refresh-overview"
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                    />
                    <Label
                      htmlFor="auto-refresh-overview"
                      className="text-sm cursor-pointer"
                    >
                      자동 갱신
                    </Label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshMonitoring}
                    disabled={refreshing || monitoringLoading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                    />
                    새로고침
                  </Button>
                </div>
              </div>
              {monitoringLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-4 w-24 mb-4" />
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : metrics && health ? (
                <MonitoringSummary metrics={metrics} health={health} />
              ) : (
                <div className="flex items-center justify-center p-8">
                  <p className="text-muted-foreground">
                    데이터를 불러올 수 없습니다
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">상세 지표</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="auto-refresh-metrics"
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                  <Label
                    htmlFor="auto-refresh-metrics"
                    className="text-sm cursor-pointer"
                  >
                    자동 갱신
                  </Label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshMonitoring}
                  disabled={refreshing || monitoringLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                  />
                  새로고침
                </Button>
              </div>
            </div>
            {monitoringLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : metrics ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold mb-3">HTTP 지표</h4>
                  <HttpMetricsCard metrics={metrics.http} />
                </div>

                <Separator />

                <div>
                  <h4 className="text-lg font-semibold mb-3">JVM 지표</h4>
                  <JvmMetricsCard metrics={metrics.jvm} />
                </div>

                <Separator />

                <div>
                  <h4 className="text-lg font-semibold mb-3">
                    데이터베이스 지표
                  </h4>
                  <DatabaseMetricsCard metrics={metrics.database} />
                </div>

                <Separator />

                <div>
                  <h4 className="text-lg font-semibold mb-3">시스템 지표</h4>
                  <SystemMetricsCard metrics={metrics.system} />
                </div>

                <Separator />

                <div>
                  <h4 className="mb-3 text-lg font-semibold">운영</h4>
                  <MaintenanceCard />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">
                  데이터를 불러올 수 없습니다
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
