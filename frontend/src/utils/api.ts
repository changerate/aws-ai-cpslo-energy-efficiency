import axios from 'axios';
import { EnergyUsage, EnergyUsageAggregated, DashboardSummary, EnergyEfficiencyMetrics } from '@/types/energy';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const energyApi = {
  // Get energy usage data
  getUsage: async (params?: {
    startDate?: string;
    endDate?: string;
    resourceType?: string;
    region?: string;
    limit?: number;
  }): Promise<{
    usage: EnergyUsage[];
    total: number;
    summary: {
      totalEnergyConsumed: number;
      totalCost: number;
      totalCarbonEmissions: number;
    };
  }> => {
    const response = await api.get<ApiResponse<any>>('/api/energy/usage', { params });
    return response.data.data;
  },

  // Get aggregated energy data for charts
  getAggregated: async (params?: {
    period?: 'hour' | 'day' | 'week' | 'month';
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  }): Promise<{
    aggregated: EnergyUsageAggregated[];
    period: string;
    total: number;
  }> => {
    const response = await api.get<ApiResponse<any>>('/api/energy/aggregated', { params });
    return response.data.data;
  },

  // Get efficiency metrics and recommendations
  getMetrics: async (): Promise<EnergyEfficiencyMetrics> => {
    const response = await api.get<ApiResponse<EnergyEfficiencyMetrics>>('/api/energy/metrics');
    return response.data.data;
  },

  // Get dashboard summary
  getDashboard: async (): Promise<DashboardSummary> => {
    const response = await api.get<ApiResponse<DashboardSummary>>('/api/energy/dashboard');
    return response.data.data;
  },
};

export default api;
