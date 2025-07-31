import { ClassSchedule, EnergyUsage, RateData } from '../types';

// Mock Class Schedule Data
export const mockClassSchedules: ClassSchedule[] = [
  {
    id: 1,
    date: '2025-08-01',
    time: '09:00',
    className: 'Computer Science 101',
    roomNumber: '201',
    buildingNumber: '14'
  },
  {
    id: 2,
    date: '2025-08-01',
    time: '10:30',
    className: 'Mathematics 150',
    roomNumber: '105',
    buildingNumber: '26'
  },
  {
    id: 3,
    date: '2025-08-01',
    time: '13:00',
    className: 'Physics 211',
    roomNumber: '301',
    buildingNumber: '52'
  },
  {
    id: 4,
    date: '2025-08-01',
    time: '14:30',
    className: 'Engineering Design',
    roomNumber: '150',
    buildingNumber: '14'
  },
  {
    id: 5,
    date: '2025-08-01',
    time: '16:00',
    className: 'Data Structures',
    roomNumber: '220',
    buildingNumber: '26'
  }
];

// Generate mock energy usage data (15-minute intervals)
export const generateMockEnergyUsage = (): EnergyUsage[] => {
  const data: EnergyUsage[] = [];
  const baseDate = new Date('2025-08-01T00:00:00');
  const buildings = ['14', '26', '52'];
  
  let id = 1;
  
  // Generate data for each building for 5 time intervals (75 minutes total)
  buildings.forEach(building => {
    for (let i = 0; i < 5; i++) {
      const dateTime = new Date(baseDate.getTime() + (i * 15 * 60 * 1000)); // 15-minute intervals
      const baseUsage = building === '14' ? 35 : building === '26' ? 28 : 42; // Different base usage per building
      const variation = (Math.random() - 0.5) * 10; // ±5 kWh variation
      
      data.push({
        id: id++,
        dateTime: dateTime.toISOString(),
        buildingNumber: building,
        energyUsedKwh: Math.round((baseUsage + variation) * 100) / 100 // Round to 2 decimal places
      });
    }
  });
  
  return data.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
};

// Mock Rate Data
export const mockRateData: RateData[] = [
  {
    id: 1,
    rateTier: 'Peak',
    pricePerKwh: 0.32,
    description: 'Weekdays 4 PM - 9 PM'
  },
  {
    id: 2,
    rateTier: 'Off-Peak',
    pricePerKwh: 0.18,
    description: 'Weekdays 9 PM - 4 PM, All Weekend'
  },
  {
    id: 3,
    rateTier: 'Super Off-Peak',
    pricePerKwh: 0.12,
    description: 'Weekdays 12 AM - 6 AM'
  },
  {
    id: 4,
    rateTier: 'Partial Peak',
    pricePerKwh: 0.25,
    description: 'Weekdays 8 AM - 4 PM'
  },
  {
    id: 5,
    rateTier: 'Holiday',
    pricePerKwh: 0.15,
    description: 'Federal holidays and weekends'
  }
];

// Generate fresh energy data each time
export const mockEnergyUsage = generateMockEnergyUsage();
