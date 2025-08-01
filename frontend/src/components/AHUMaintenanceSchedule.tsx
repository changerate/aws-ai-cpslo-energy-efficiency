'use client';

import { useEffect, useState } from 'react';
import { Settings, Power, PowerOff, Clock } from 'lucide-react';
import { AHUSchedule } from '@/types';
import { fetchAHUSchedule } from '@/services/api';

export default function AHUMaintenanceSchedule() {
  const [scheduleData, setScheduleData] = useState<AHUSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBuilding, setActiveBuilding] = useState('14');

  const buildings = ['14', '26', '52'];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await fetchAHUSchedule();
        if (response.success) {
          setScheduleData(response.data);
        } else {
          setError('Failed to load AHU schedule');
        }
      } catch (err) {
        setError('Error loading AHU schedule');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter data for the active building
  const buildingSchedule = scheduleData.filter(
    schedule => schedule.buildingNumber === activeBuilding
  );

  // Group by AHU system
  const systemGroups = buildingSchedule.reduce((acc, schedule) => {
    if (!acc[schedule.systemName]) {
      acc[schedule.systemName] = [];
    }
    acc[schedule.systemName].push(schedule);
    return acc;
  }, {} as Record<string, AHUSchedule[]>);

  // Get unique time slots and sort them
  const timeSlots = [...new Set(buildingSchedule.map(s => s.timeSlot))].sort();

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Air-Handler Unit Uptime
        </h2>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Air-Handler Unit Uptime
        </h2>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  // Group consecutive periods for each system
  const groupConsecutivePeriods = (schedules: AHUSchedule[]) => {
    const timeSlotSubset = timeSlots.slice(0, 12);
    
    type GroupType = {
      startIndex: number;
      endIndex: number;
      span: number;
      shouldBeOn: boolean;
      hasClass: boolean;
      timeRange: string;
    };
    
    const groups: GroupType[] = [];
    
    type CurrentGroupType = {
      startIndex: number;
      shouldBeOn: boolean;
      hasClass: boolean;
    };
    
    let currentGroup: CurrentGroupType | null = null;
    
    timeSlotSubset.forEach((timeSlot, index) => {
      const schedule = schedules.find(s => s.timeSlot === timeSlot);
      const shouldBeOn = schedule?.shouldBeOn || false;
      const hasClass = schedule?.hasActiveClass || false;
      
      if (!currentGroup || currentGroup.shouldBeOn !== shouldBeOn) {
        // Start a new group
        if (currentGroup) {
          // Close the previous group
          groups.push({
            startIndex: currentGroup.startIndex,
            endIndex: index - 1,
            span: index - currentGroup.startIndex,
            shouldBeOn: currentGroup.shouldBeOn,
            hasClass: currentGroup.hasClass,
            timeRange: `${timeSlotSubset[currentGroup.startIndex]} - ${timeSlotSubset[index - 1]}`
          });
        }
        
        currentGroup = {
          startIndex: index,
          shouldBeOn,
          hasClass
        } as CurrentGroupType;
      }
    });
    
    // Close the final group
    if (currentGroup) {
      const finalGroup = currentGroup as CurrentGroupType;
      groups.push({
        startIndex: finalGroup.startIndex,
        endIndex: timeSlotSubset.length - 1,
        span: timeSlotSubset.length - finalGroup.startIndex,
        shouldBeOn: finalGroup.shouldBeOn,
        hasClass: finalGroup.hasClass,
        timeRange: `${timeSlotSubset[finalGroup.startIndex]} - ${timeSlotSubset[timeSlotSubset.length - 1]}`
      });
    }
    
    return groups;
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl border-2 border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Settings className="w-6 h-6 text-blue-600" />
          Air-Handler Unit Uptime
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
          <Clock className="w-4 h-4" />
          <span>Real-time Status</span>
        </div>
      </div>
      
      {/* Building Tabs - Enhanced */}
      <div className="flex border-b-2 border-gray-200 mb-6">
        {buildings.map((building) => {
          const systemCount = [...new Set(scheduleData
            .filter(s => s.buildingNumber === building)
            .map(s => s.systemName)
          )].length;
          
          return (
            <button
              key={building}
              onClick={() => setActiveBuilding(building)}
              className={`px-6 py-3 font-semibold text-base border-b-4 transition-all duration-200 ${
                activeBuilding === building
                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              Building {building}
              <div className="text-xs mt-1 opacity-75">
                {systemCount} Systems
              </div>
            </button>
          );
        })}
      </div>

      {/* Schedule Grid - Enhanced with Collapsed Periods */}
      <div className="overflow-x-auto bg-gray-50 p-4 rounded-lg">
        <div className="min-w-full">
          {/* Header */}
          <div className="grid grid-cols-[200px_1fr] gap-4 mb-4">
            {/* System Label Header */}
            <div className="font-bold text-gray-800 p-3 bg-white rounded shadow-sm">
              <Clock className="w-4 h-4 inline mr-2" />
              AHU System
            </div>
            
            {/* Time Slots Header */}
            <div>
              <div className="font-semibold text-gray-700 p-2 bg-white rounded shadow-sm mb-2 text-center">
                Schedule Timeline - Consecutive Periods Grouped
              </div>
              <div className="grid grid-cols-12 gap-1 text-xs text-gray-600">
                {timeSlots.slice(0, 12).map((timeSlot, index) => (
                  <div key={timeSlot} className="text-center p-1">
                    {timeSlot}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AHU Systems Rows with Collapsed Periods */}
          {Object.entries(systemGroups).map(([systemName, schedules]) => {
            const groups = groupConsecutivePeriods(schedules);
            
            return (
              <div key={systemName} className="grid grid-cols-[200px_1fr] gap-4 mb-3">
                {/* System Name - Left Column */}
                <div className="font-semibold text-gray-800 p-3 bg-white rounded shadow-sm flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  {systemName}
                </div>
                
                {/* Collapsed Period Blocks - Right Column */}
                <div className="relative">
                  <div className="grid grid-cols-12 gap-1 h-16">
                    {groups.map((group, groupIndex) => (
                      <div
                        key={`${systemName}-group-${groupIndex}`}
                        className={`p-2 rounded-lg text-center transition-all duration-200 shadow-sm flex flex-col items-center justify-center ${
                          group.shouldBeOn
                            ? 'bg-green-100 border-2 border-green-400 text-green-800'
                            : 'bg-red-100 border-2 border-red-400 text-red-800'
                        }`}
                        style={{
                          gridColumnStart: group.startIndex + 1,
                          gridColumnEnd: group.endIndex + 2
                        }}
                        title={`${group.timeRange}: ${group.shouldBeOn ? 'ON' : 'OFF'}${group.hasClass ? ' (Class Active)' : ' (No Class)'}`}
                      >
                        {group.shouldBeOn ? (
                          <Power className="w-4 h-4 text-green-600 mb-1" />
                        ) : (
                          <PowerOff className="w-4 h-4 text-red-600 mb-1" />
                        )}
                        <div className="text-xs font-semibold">
                          {group.shouldBeOn ? 'ON' : 'OFF'}
                        </div>
                        <div className="text-xs opacity-75">
                          {group.span}p
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Legend */}
      <div className="mt-6 flex items-center justify-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 border-2 border-green-400 rounded flex items-center justify-center">
            <Power className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-gray-600">AHU ON (Class Active)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-100 border-2 border-red-400 rounded flex items-center justify-center">
            <PowerOff className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-gray-600">AHU OFF (Energy Saving)</span>
        </div>
        <div className="text-gray-500 text-xs">
          * Consecutive periods are grouped into single blocks for better cost impact visualization
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Systems Currently ON</div>
          <div className="text-2xl font-bold text-green-600">
            {Object.values(systemGroups).reduce((count, schedules) => {
              const currentHour = new Date().getHours();
              const currentMinute = new Date().getMinutes();
              const currentTime = `${currentHour.toString().padStart(2, '0')}:${Math.floor(currentMinute / 30) * 30 === 0 ? '00' : '30'}`;
              const currentSchedule = schedules.find(s => s.timeSlot === currentTime);
              return count + (currentSchedule?.shouldBeOn ? 1 : 0);
            }, 0)}
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Systems Available for Maintenance</div>
          <div className="text-2xl font-bold text-red-600">
            {Object.values(systemGroups).reduce((count, schedules) => {
              const currentHour = new Date().getHours();
              const currentMinute = new Date().getMinutes();
              const currentTime = `${currentHour.toString().padStart(2, '0')}:${Math.floor(currentMinute / 30) * 30 === 0 ? '00' : '30'}`;
              const currentSchedule = schedules.find(s => s.timeSlot === currentTime);
              return count + (!currentSchedule?.shouldBeOn ? 1 : 0);
            }, 0)}
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total AHU Systems</div>
          <div className="text-2xl font-bold text-blue-600">
            {Object.keys(systemGroups).length}
          </div>
        </div>
      </div>
    </div>
  );
}
