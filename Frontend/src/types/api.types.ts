export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  pendingCustomCakes: number;
  activeProducts: number;
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  categoryDistribution: { category: string; count: number }[];
  orderStatusCounts: { status: string; count: number }[];
  topProduct?: string | null;
}
