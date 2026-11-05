export interface EndpointStat {
  endpoint: string;
  count: number;
  avgTime: number;
}

export interface HttpMetrics {
  avgResponseTime: number;
  /** 4xx+5xx, 토큰 만료·없는 글도 포함 */
  errorRate: number;
  /** 5xx만, 새 Hub부터 */
  serverErrorRate?: number;
  totalRequests: number;
  endpointStats: EndpointStat[];
}

export interface JvmMetrics {
  heapUsed: number;
  heapMax: number;
  nonHeapUsed: number;
  nonHeapMax: number;
  threads: number;
  gcTime: number;
}

export interface DatabaseMetrics {
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
  maxConnections: number;
}

export interface SystemMetrics {
  uptime: number;
  cpuUsage: number;
  processMemory: number;
  /** 아래 넷은 새 Hub부터, 메모리 여유는 캐시 제외 */
  memoryTotal?: number;
  memoryAvailable?: number;
  diskTotal?: number;
  diskUsable?: number;
}

export interface MonitoringMetrics {
  http: HttpMetrics;
  jvm: JvmMetrics;
  database: DatabaseMetrics;
  system: SystemMetrics;
}

export interface HealthStatus {
  status: string;
  uptime: number;
}
