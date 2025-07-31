// Test script to verify HVAC logic
const testSchedule = [
  {
    id: 0,
    courseName: 'Mathematics 101',
    instructor: 'Dr. Smith',
    days: 'Monday Wednesday Friday',
    startTime: '09:00',
    endTime: '10:30',
    room: 'Room 101',
    building: 'Science Building'
  },
  {
    id: 1,
    courseName: 'Physics 201',
    instructor: 'Prof. Johnson',
    days: 'Tuesday Thursday',
    startTime: '11:00',
    endTime: '12:30',
    room: 'Room 205',
    building: 'Science Building'
  }
];

// Helper function to parse time string to hour
const parseTimeToHour = (timeStr) => {
  if (!timeStr) return 0;
  
  const cleanTime = timeStr.trim().toLowerCase();
  let hour = 0;
  
  if (cleanTime.includes(':')) {
    hour = parseInt(cleanTime.split(':')[0]);
  } else {
    hour = parseInt(cleanTime);
  }
  
  if (cleanTime.includes('pm') && hour !== 12) {
    hour += 12;
  } else if (cleanTime.includes('am') && hour === 12) {
    hour = 0;
  }
  
  return hour;
};

// Helper function to check if a day matches
const dayMatches = (scheduleDays, targetDay) => {
  if (!scheduleDays) return false;
  
  const dayMappings = {
    'monday': ['monday', 'mon', 'm'],
    'tuesday': ['tuesday', 'tue', 'tues', 't'],
    'wednesday': ['wednesday', 'wed', 'w'],
    'thursday': ['thursday', 'thu', 'thur', 'th', 'r'],
    'friday': ['friday', 'fri', 'f'],
    'saturday': ['saturday', 'sat', 's'],
    'sunday': ['sunday', 'sun', 'su']
  };
  
  const targetDayLower = targetDay.toLowerCase();
  const scheduleDaysLower = scheduleDays.toLowerCase();
  
  return dayMappings[targetDayLower]?.some(abbrev => 
    scheduleDaysLower.includes(abbrev)
  ) || false;
};

// Test the logic
console.log('Testing HVAC Schedule Logic:');
console.log('============================');

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

days.forEach(day => {
  console.log(`\n${day}:`);
  
  // Test a few key hours
  const testHours = [8, 9, 10, 11, 12, 13];
  
  testHours.forEach(hour => {
    const hasClasses = testSchedule.some(classItem => {
      if (!classItem.days) return false;
      
      if (dayMatches(classItem.days, day)) {
        const startHour = parseTimeToHour(classItem.startTime);
        const endHour = parseTimeToHour(classItem.endTime);
        
        const hvacStartHour = Math.max(0, startHour - 1);
        const hvacEndHour = endHour;
        
        return hour >= hvacStartHour && hour <= hvacEndHour;
      }
      return false;
    });
    
    const classDetails = testSchedule.filter(classItem => {
      if (!classItem.days) return false;
      
      if (dayMatches(classItem.days, day)) {
        const startHour = parseTimeToHour(classItem.startTime);
        const endHour = parseTimeToHour(classItem.endTime);
        return hour >= startHour && hour <= endHour;
      }
      return false;
    });
    
    let reason = 'No classes - energy saving mode';
    if (hasClasses) {
      if (classDetails.length > 0) {
        const classNames = classDetails.map(c => c.courseName).join(', ');
        reason = `Classes: ${classNames}`;
      } else {
        reason = 'Pre-cooling/heating for upcoming class';
      }
    }
    
    console.log(`  ${hour.toString().padStart(2, '0')}:00 - ${hasClasses ? 'ON' : 'OFF'} (${reason})`);
  });
});

console.log('\n✅ HVAC Logic Test Complete!');
