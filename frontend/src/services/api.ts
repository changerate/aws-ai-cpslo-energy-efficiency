import { ApiResponse, ClassSchedule, EnergyUsage, RateData, AHUSystem, AHUSchedule } from '@/types';

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

// Fetch AHU systems
export async function fetchAHUSystems(building?: string): Promise<ApiResponse<AHUSystem[]>> {
  const endpoint = building ? `/data/ahu-systems?building=${building}` : '/data/ahu-systems';
  return fetchApi<AHUSystem[]>(endpoint);
}

// Fetch AHU schedule
export async function fetchAHUSchedule(building?: string, system?: string): Promise<ApiResponse<AHUSchedule[]>> {
  const params = new URLSearchParams();
  if (building) params.append('building', building);
  if (system) params.append('system', system);
  
  const endpoint = `/data/ahu-schedule${params.toString() ? `?${params.toString()}` : ''}`;
  return fetchApi<AHUSchedule[]>(endpoint);
}

// Fetch energy usage data
export async function fetchEnergyUsage(building?: string, timeframe?: string): Promise<ApiResponse<EnergyUsage[]>> {
  const params = new URLSearchParams();
  if (building) params.append('building', building);
  if (timeframe) params.append('timeframe', timeframe);
  
  const endpoint = `/data/energy-usage${params.toString() ? `?${params.toString()}` : ''}`;
  return fetchApi<EnergyUsage[]>(endpoint);
}

// Fetch rate data
export async function fetchRateData(): Promise<ApiResponse<RateData[]>> {
  return fetchApi<RateData[]>('/data/rates');
}

// Fetch energy savings comparison
export async function fetchSavingsComparison(building?: string, timeframe?: string): Promise<ApiResponse<any>> {
  const params = new URLSearchParams();
  if (building) params.append('building', building);
  if (timeframe) params.append('timeframe', timeframe);
  
  const endpoint = `/data/savings${params.toString() ? `?${params.toString()}` : ''}`;
  return fetchApi<any>(endpoint);
}

// Fetch CSV file information
export async function fetchCSVInfo(): Promise<ApiResponse<any>> {
  return fetchApi<any>('/data/csv-info');
}

// Set custom CSV file path
export async function setCSVPath(filePath: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/data/csv-path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error setting CSV path:', error);
    throw error;
  }
}

// Fetch data summary
export async function fetchDataSummary(): Promise<ApiResponse<any>> {
  return fetchApi<any>('/data/summary');
}
