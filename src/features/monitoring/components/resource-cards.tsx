import { PanelHeader } from "@/components/panel-header";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  DatabaseMetrics,
  JvmMetrics,
  SystemMetrics,
} from "@/types/monitoring";
import { formatBytes } from "../utils";

const ratio = (part: number, max: number) =>
  max > 0 ? Math.min(100, Math.max(0, (part / max) * 100)) : 0;

// 90% 넘으면 위험으로 강조
function Meter({
  label,
  value,
  detail,
  percent,
}: {
  label: string;
  value: string;
  detail?: string;
  percent: number;
}) {
  const danger = percent >= 90;
  return (
    <div className="space-y-1.5 border-t py-3 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <span className="text-muted-foreground text-xs">
          <span
            className={cn(
              "text-foreground font-semibold tabular-nums",
              danger && "text-destructive",
            )}
          >
            {value}
          </span>
          {detail && ` / ${detail}`}
        </span>
      </div>
      <div className="bg-muted h-1.5 overflow-hidden rounded-full">
        <div
          className={cn(
            "h-full rounded-full",
            danger ? "bg-destructive" : "bg-chart-1",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function Fact({
  label,
  value,
  dot,
}: {
  label: string;
  value: string;
  dot?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t py-2 last:pb-0">
      <span className="text-muted-foreground flex items-center gap-2">
        {dot && <span className={cn("size-2 rounded-full", dot)} />}
        {label}
      </span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

export function JvmCard({ metrics }: { metrics: JvmMetrics }) {
  return (
    <Card className="gap-0 py-0">
      <PanelHeader title="JVM" />
      <div className="px-4 py-3.5">
        <Meter
          label="힙 메모리"
          value={formatBytes(metrics.heapUsed)}
          detail={formatBytes(metrics.heapMax)}
          percent={ratio(metrics.heapUsed, metrics.heapMax)}
        />
        {/* 논힙 최대치는 JVM이 그때그때 늘리는 확보량이라 경고 막대 대신 값만 */}
        <Fact
          label="논힙 메모리"
          value={
            metrics.nonHeapMax > 0
              ? `${formatBytes(metrics.nonHeapUsed)} / 확보 ${formatBytes(metrics.nonHeapMax)}`
              : formatBytes(metrics.nonHeapUsed)
          }
        />
        <Fact label="활성 스레드" value={metrics.threads.toLocaleString()} />
        <Fact
          label="GC 시간 (누적)"
          value={`${(metrics.gcTime / 1000).toFixed(1)}초`}
        />
      </div>
    </Card>
  );
}

export function DatabaseCard({ metrics }: { metrics: DatabaseMetrics }) {
  const max = metrics.maxConnections;
  return (
    <Card className="gap-0 py-0">
      <PanelHeader
        title="데이터베이스"
        aside={<span className="text-muted-foreground text-xs">커넥션 풀</span>}
      />
      <div className="px-4 py-3.5">
        <div className="space-y-1.5 pb-3">
          <div className="flex items-center justify-between gap-3">
            <span>풀 사용</span>
            <span className="text-muted-foreground text-xs">
              <span className="text-foreground font-semibold tabular-nums">
                {metrics.totalConnections}
              </span>{" "}
              / 최대 {max}
            </span>
          </div>
          <div
            className="bg-muted flex h-1.5 gap-0.5 overflow-hidden rounded-full"
            role="img"
            aria-label={`활성 ${metrics.activeConnections}, 유휴 ${metrics.idleConnections}, 최대 ${max}`}
          >
            <div
              className="bg-chart-1"
              style={{ width: `${ratio(metrics.activeConnections, max)}%` }}
            />
            <div
              className="bg-chart-2"
              style={{ width: `${ratio(metrics.idleConnections, max)}%` }}
            />
          </div>
        </div>
        <Fact
          label="활성 연결"
          value={String(metrics.activeConnections)}
          dot="bg-chart-1"
        />
        <Fact
          label="유휴 연결"
          value={String(metrics.idleConnections)}
          dot="bg-chart-2"
        />
        <Fact label="최대 연결" value={String(max)} />
      </div>
    </Card>
  );
}

export function SystemCard({ metrics }: { metrics: SystemMetrics }) {
  return (
    <Card className="gap-0 py-0">
      <PanelHeader title="시스템" />
      <div className="px-4 py-3.5">
        <Meter
          label="CPU 사용률"
          value={`${metrics.cpuUsage.toFixed(1)}%`}
          percent={ratio(metrics.cpuUsage, 100)}
        />
        {/* 작은 EC2에서 서버를 멈추게 하는 건 앱보다 서버 전체 메모리·디스크 */}
        {!!metrics.memoryTotal && (
          <Meter
            label="서버 메모리"
            value={formatBytes(
              metrics.memoryTotal - (metrics.memoryAvailable ?? 0),
            )}
            detail={formatBytes(metrics.memoryTotal)}
            percent={ratio(
              metrics.memoryTotal - (metrics.memoryAvailable ?? 0),
              metrics.memoryTotal,
            )}
          />
        )}
        {!!metrics.diskTotal && (
          <Meter
            label="서버 디스크"
            value={formatBytes(metrics.diskTotal - (metrics.diskUsable ?? 0))}
            detail={formatBytes(metrics.diskTotal)}
            percent={ratio(
              metrics.diskTotal - (metrics.diskUsable ?? 0),
              metrics.diskTotal,
            )}
          />
        )}
        <Fact
          label="프로세스 메모리"
          value={formatBytes(metrics.processMemory)}
        />
      </div>
    </Card>
  );
}
