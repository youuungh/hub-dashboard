export interface EndpointStat {
  endpoint: string;
  count: number;
  avgTime: number;
}

export interface HttpMetrics {
  avgResponseTime: number;
  errorRate: number;
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
