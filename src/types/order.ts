export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: string;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  revenueToday: string;
  revenueThisWeek: string;
  revenueThisMonth: string;
  avgOrderValue: string;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}
