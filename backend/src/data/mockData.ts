import { ClassSchedule, EnergyUsage, RateData, AHUSystem, AHUSchedule } from '../types';

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
  },
  {
    id: 6,
    date: '2025-08-01',
    time: '11:00',
    className: 'Chemistry Lab',
    roomNumber: '101',
    buildingNumber: '52'
  },
  {
    id: 7,
    date: '2025-08-01',
    time: '15:30',
    className: 'Biology 101',
    roomNumber: '205',
    buildingNumber: '14'
  },
  {
    id: 8,
    date: '2025-08-01',
    time: '08:00',
    className: 'Statistics',
    roomNumber: '110',
    buildingNumber: '26'
  }
];

// Mock AHU Systems Data
export const mockAHUSystems: AHUSystem[] = [
  // Building 14 AHU Systems
  { id: 1, systemName: 'AHU-1', buildingNumber: '14', zones: ['201-210', '211-220'] },
  { id: 2, systemName: 'AHU-2', buildingNumber: '14', zones: ['150-160', '161-170'] },
  { id: 3, systemName: 'AHU-3', buildingNumber: '14', zones: ['200-210', '211-220'] },
  { id: 4, systemName: 'AHU-4', buildingNumber: '14', zones: ['171-180', '181-190'] },
  { id: 5, systemName: 'AHU-5', buildingNumber: '14', zones: ['191-210', '211-230'] },
  
  // Building 26 AHU Systems
  { id: 6, systemName: 'AHU-1', buildingNumber: '26', zones: ['100-115', '116-130'] },
  { id: 7, systemName: 'AHU-2', buildingNumber: '26', zones: ['105-120', '121-135'] },
  { id: 8, systemName: 'AHU-3', buildingNumber: '26', zones: ['210-225', '226-240'] },
  { id: 9, systemName: 'AHU-4', buildingNumber: '26', zones: ['241-255', '256-270'] },
  { id: 10, systemName: 'AHU-5', buildingNumber: '26', zones: ['271-285', '286-300'] },
  
  // Building 52 AHU Systems
  { id: 11, systemName: 'AHU-1', buildingNumber: '52', zones: ['100-115', '116-130'] },
  { id: 12, systemName: 'AHU-2', buildingNumber: '52', zones: ['300-315', '316-330'] },
  { id: 13, systemName: 'AHU-3', buildingNumber: '52', zones: ['331-345', '346-360'] },
  { id: 14, systemName: 'AHU-4', buildingNumber: '52', zones: ['361-375', '376-390'] },
  { id: 15, systemName: 'AHU-5', buildingNumber: '52', zones: ['391-405', '406-420'] }
];

// Generate AHU Schedule based on class schedules
export const generateAHUSchedule = (): AHUSchedule[] => {
  const schedules: AHUSchedule[] = [];
  const buildings = ['14', '26', '52'];
  
  // Generate time slots from 7:00 AM to 10:00 PM in 30-minute increments
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 22 && minute > 0) break; // Stop at 10:00 PM
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  
  buildings.forEach(buildingNumber => {
    const buildingAHUs = mockAHUSystems.filter(ahu => ahu.buildingNumber === buildingNumber);
    const buildingClasses = mockClassSchedules.filter(cls => cls.buildingNumber === buildingNumber);
    
    buildingAHUs.forEach(ahu => {
      timeSlots.forEach(timeSlot => {
        // Check if there's a class during this time slot that affects this AHU system
        const hasActiveClass = buildingClasses.some(cls => {
          const classTime = cls.time;
          const classTimeParts = classTime.split(':');
          const classHour = parseInt(classTimeParts[0] || '0');
          const classMinute = parseInt(classTimeParts[1] || '0');
          const timeSlotParts = timeSlot.split(':');
          const slotHour = parseInt(timeSlotParts[0] || '0');
          const slotMinute = parseInt(timeSlotParts[1] || '0');
          
          // Assume each class runs for 1.5 hours
          const classStartMinutes = classHour * 60 + classMinute;
          const classEndMinutes = classStartMinutes + 90; // 1.5 hours
          const slotMinutes = slotHour * 60 + slotMinute;
          
          // Check if the room is in the AHU zone and if the time overlaps
          const roomNumber = cls.roomNumber;
          const isInZone = ahu.zones.some(zone => {
            const zoneParts = zone.split('-');
            const start = parseInt(zoneParts[0] || '0');
            const end = parseInt(zoneParts[1] || '0');
            const room = parseInt(roomNumber);
            return room >= start && room <= end;
          });
          
          return isInZone && slotMinutes >= classStartMinutes && slotMinutes < classEndMinutes;
        });
        
        schedules.push({
          id: schedules.length + 1,
          ahuSystemId: ahu.id,
          buildingNumber,
          systemName: ahu.systemName,
          timeSlot,
          shouldBeOn: hasActiveClass,
          hasActiveClass,
          date: '2025-08-01'
        });
      });
    });
  });
  
  return schedules;
};

// Generate fresh energy data each time
export const mockEnergyUsage = generateMockEnergyUsage();
export const mockAHUSchedules = generateAHUSchedule();

// Generate mock energy usage data (15-minute intervals)
export function generateMockEnergyUsage(): EnergyUsage[] {
  const data: EnergyUsage[] = [];
  const baseDate = new Date('2025-06-15T00:00:00'); // Changed to June 15, 2025
  const buildings = ['14', '26', '52'];
  
  let id = 1;
  
  // Generate data for each building for a full day (96 intervals of 15 minutes)
  buildings.forEach(building => {
    const baseUsage = building === '14' ? 35 : building === '26' ? 28 : 42;
    
    for (let i = 0; i < 96; i++) { // 24 hours * 4 (15-minute intervals per hour)
      const dateTime = new Date(baseDate.getTime() + (i * 15 * 60 * 1000)); // 15-minute intervals
      const hour = dateTime.getHours();
      
      // Create realistic usage patterns based on time of day
      let timeMultiplier = 1;
      if (hour >= 6 && hour <= 8) timeMultiplier = 1.3; // Morning peak
      else if (hour >= 9 && hour <= 17) timeMultiplier = 1.5; // Business hours
      else if (hour >= 18 && hour <= 20) timeMultiplier = 1.2; // Evening
      else if (hour >= 21 || hour <= 5) timeMultiplier = 0.6; // Night/early morning
      
      const variation = (Math.random() - 0.5) * 8; // ±4 kWh variation
      const usage = baseUsage * timeMultiplier + variation;
      
      data.push({
        id: id++,
        dateTime: dateTime.toISOString(),
        buildingNumber: building,
        energyUsedKwh: Math.round(Math.max(usage, 5) * 100) / 100 // Minimum 5 kWh, round to 2 decimal places
      });
    }
  });
  
  return data.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
}

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
