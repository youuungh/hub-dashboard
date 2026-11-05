import { useQuery } from "@tanstack/react-query";
import { getHealthStatus, getMonitoringMetrics } from "@/lib/api/monitoring";
import { queryKeys } from "@/lib/query-keys";

// 실패하면 자동 갱신 중지, 오류 반복 방지
export function useMonitoring(intervalMs: number | false) {
  return useQuery({
    queryKey: queryKeys.monitoring,
    queryFn: async () => {
      const [metrics, health] = await Promise.all([
        getMonitoringMetrics(),
        getHealthStatus(),
      ]);
      return { metrics, health };
    },
    refetchInterval: (query) =>
      intervalMs && query.state.status !== "error" ? intervalMs : false,
    meta: { errorMessage: "모니터링 데이터를 불러오는데 실패했습니다" },
  });
}
