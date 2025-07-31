// Class Schedule Data Types
export interface ClassSchedule {
  id: number;
  date: string;
  time: string;
  className: string;
  roomNumber: string;
  buildingNumber: string;
}

// Energy Usage Data Types
export interface EnergyUsage {
  id: number;
  dateTime: string;
  buildingNumber: string;
  energyUsedKwh: number;
}

// Rate Data Types
export interface RateData {
  id: number;
  rateTier: string;
  pricePerKwh: number;
  description: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}
