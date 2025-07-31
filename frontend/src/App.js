import React, { useState } from 'react';
import './App.css';
import ScheduleUpload from './components/ScheduleUpload';
import EnergyChart from './components/EnergyChart';
import HVACSchedule from './components/HVACSchedule';
import CostAnalysis from './components/CostAnalysis';

function App() {
  const [classSchedule, setClassSchedule] = useState([]);
  const [energyData, setEnergyData] = useState([]);
  const [hvacSchedule, setHvacSchedule] = useState([]);
  const [costData, setCostData] = useState({
    currentCost: 0,
    projectedCost: 0,
    savings: 0
  });

  // Sample energy data for demonstration
  const sampleEnergyData = [
    { time: '00:00', current: 45, optimized: 20, day: 'Monday' },
    { time: '01:00', current: 42, optimized: 18, day: 'Monday' },
    { time: '02:00', current: 40, optimized: 15, day: 'Monday' },
    { time: '03:00', current: 38, optimized: 15, day: 'Monday' },
    { time: '04:00', current: 35, optimized: 15, day: 'Monday' },
    { time: '05:00', current: 40, optimized: 15, day: 'Monday' },
    { time: '06:00', current: 55, optimized: 25, day: 'Monday' },
    { time: '07:00', current: 75, optimized: 45, day: 'Monday' },
    { time: '08:00', current: 95, optimized: 85, day: 'Monday' },
    { time: '09:00', current: 110, optimized: 100, day: 'Monday' },
    { time: '10:00', current: 125, optimized: 115, day: 'Monday' },
    { time: '11:00', current: 130, optimized: 120, day: 'Monday' },
    { time: '12:00', current: 135, optimized: 125, day: 'Monday' },
    { time: '13:00', current: 140, optimized: 130, day: 'Monday' },
    { time: '14:00', current: 145, optimized: 135, day: 'Monday' },
    { time: '15:00', current: 140, optimized: 130, day: 'Monday' },
    { time: '16:00', current: 135, optimized: 125, day: 'Monday' },
    { time: '17:00', current: 120, optimized: 110, day: 'Monday' },
    { time: '18:00', current: 85, optimized: 35, day: 'Monday' },
    { time: '19:00', current: 70, optimized: 25, day: 'Monday' },
    { time: '20:00', current: 60, optimized: 20, day: 'Monday' },
    { time: '21:00', current: 55, optimized: 20, day: 'Monday' },
    { time: '22:00', current: 50, optimized: 18, day: 'Monday' },
    { time: '23:00', current: 48, optimized: 18, day: 'Monday' }
  ];

  React.useEffect(() => {
    setEnergyData(sampleEnergyData);
    calculateCosts(sampleEnergyData);
  }, []);

  const calculateCosts = (data) => {
    const currentTotal = data.reduce((sum, item) => sum + item.current, 0);
    const optimizedTotal = data.reduce((sum, item) => sum + item.optimized, 0);
    const ratePerKWh = 0.12; // $0.12 per kWh
    
    const currentCost = currentTotal * ratePerKWh;
    const projectedCost = optimizedTotal * ratePerKWh;
    const savings = currentCost - projectedCost;

    setCostData({
      currentCost: currentCost.toFixed(2),
      projectedCost: projectedCost.toFixed(2),
      savings: savings.toFixed(2)
    });
  };

  const handleScheduleUpload = (schedule) => {
    setClassSchedule(schedule);
    generateHVACSchedule(schedule);
  };

  const generateHVACSchedule = (schedule) => {
    // Generate HVAC schedule based on class schedule
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // Helper function to parse time string to hour
    const parseTimeToHour = (timeStr) => {
      if (!timeStr) return 0;
      
      // Handle different time formats: "09:00", "9:00", "9:00 AM", etc.
      const cleanTime = timeStr.trim().toLowerCase();
      let hour = 0;
      
      if (cleanTime.includes(':')) {
        hour = parseInt(cleanTime.split(':')[0]);
      } else {
        hour = parseInt(cleanTime);
      }
      
      // Handle AM/PM format
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
      
      // Check if any of the day abbreviations match
      return dayMappings[targetDayLower]?.some(abbrev => 
        scheduleDaysLower.includes(abbrev)
      ) || false;
    };
    
    const hvacData = days.map(day => {
      const daySchedule = hours.map(hour => {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        
        // Check if there are classes during this hour
        const hasClasses = schedule.some(classItem => {
          if (!classItem.days) return false;
          
          // Check if this day has classes
          if (dayMatches(classItem.days, day)) {
            const startHour = parseTimeToHour(classItem.startTime);
            const endHour = parseTimeToHour(classItem.endTime);
            
            // HVAC should be on 1 hour before class starts and during class
            const hvacStartHour = Math.max(0, startHour - 1);
            const hvacEndHour = endHour;
            
            return hour >= hvacStartHour && hour <= hvacEndHour;
          }
          return false;
        });

        // Get class details for this hour if any
        const classDetails = schedule.filter(classItem => {
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

        return {
          time: timeStr,
          status: hasClasses ? 'on' : 'off',
          reason: reason
        };
      });

      return {
        day,
        schedule: daySchedule
      };
    });

    setHvacSchedule(hvacData);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>CSU Energy Management System</h1>
        <p>Optimize HVAC usage based on class schedules and reduce energy costs</p>
      </header>

      <main className="main-content">
        <div className="dashboard-grid">
          <section className="upload-section">
            <ScheduleUpload onScheduleUpload={handleScheduleUpload} />
          </section>

          <section className="chart-section">
            <EnergyChart data={energyData} />
          </section>

          <section className="schedule-section">
            <HVACSchedule schedule={hvacSchedule} />
          </section>

          <section className="cost-section">
            <CostAnalysis costData={costData} />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
