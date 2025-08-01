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

// AHU System Types
export interface AHUSystem {
  id: number;
  systemName: string;
  buildingNumber: string;
  zones: string[]; // Array of room ranges like ["201-210", "211-220"]
}

// AHU Schedule Types
export interface AHUSchedule {
  id: number;
  ahuSystemId: number;
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
