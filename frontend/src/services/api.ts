import { ApiResponse, ClassSchedule, EnergyUsage, RateData } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100/api';

// Generic fetch function with error handling
async function fetchApi<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// Fetch class schedules
export async function fetchClassSchedules(): Promise<ApiResponse<ClassSchedule[]>> {
  return fetchApi<ClassSchedule[]>('/data/class-schedules');
}

// Fetch energy usage data
export async function fetchEnergyUsage(building?: string): Promise<ApiResponse<EnergyUsage[]>> {
  const endpoint = building ? `/data/energy-usage?building=${building}` : '/data/energy-usage';
  return fetchApi<EnergyUsage[]>(endpoint);
}

// Fetch rate data
export async function fetchRateData(): Promise<ApiResponse<RateData[]>> {
  return fetchApi<RateData[]>('/data/rates');
}

// Fetch data summary
export async function fetchDataSummary(): Promise<ApiResponse<any>> {
  return fetchApi<any>('/data/summary');
}
