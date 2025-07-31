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

// HVAC System Types
export interface HVACSystem {
  id: number;
  systemName: string;
  buildingNumber: string;
  zones: string[]; // Array of room ranges like ["201-210", "211-220"]
}

// HVAC Schedule Types
export interface HVACSchedule {
  id: number;
  hvacSystemId: number;
  buildingNumber: string;
  systemName: string;
  timeSlot: string; // Format: "HH:MM"
  shouldBeOn: boolean;
  hasActiveClass: boolean;
  date: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}
