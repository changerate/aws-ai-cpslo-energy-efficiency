'use client';

import { useEffect, useState } from 'react';
import { Settings, Power, PowerOff, Clock } from 'lucide-react';
import { HVACSchedule } from '@/types';
import { fetchHVACSchedule } from '@/services/api';

export default function HVACMaintenanceSchedule() {
  const [scheduleData, setScheduleData] = useState<HVACSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBuilding, setActiveBuilding] = useState('14');

  const buildings = ['14', '26', '52'];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await fetchHVACSchedule();
        if (response.success) {
          setScheduleData(response.data);
        } else {
          setError('Failed to load HVAC schedule');
        }
      } catch (err) {
        setError('Error loading HVAC schedule');
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

  // Group by HVAC system
  const systemGroups = buildingSchedule.reduce((acc, schedule) => {
    if (!acc[schedule.systemName]) {
      acc[schedule.systemName] = [];
    }
    acc[schedule.systemName].push(schedule);
    return acc;
  }, {} as Record<string, HVACSchedule[]>);

  // Get unique time slots and sort them
  const timeSlots = [...new Set(buildingSchedule.map(s => s.timeSlot))].sort();

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          HVAC Maintenance Schedule
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
          HVAC Maintenance Schedule
        </h2>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl border-2 border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Settings className="w-6 h-6 text-blue-600" />
          HVAC Maintenance Schedule
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

      {/* Schedule Grid - Enhanced */}
      <div className="overflow-x-auto bg-gray-50 p-4 rounded-lg">
        <div className="min-w-full">
          {/* Header */}
          <div className="grid grid-cols-[140px_repeat(auto-fit,minmax(70px,1fr))] gap-2 mb-3">
            <div className="font-bold text-gray-800 p-3 bg-white rounded shadow-sm">
              <Clock className="w-4 h-4 inline mr-2" />
              HVAC System
            </div>
            {timeSlots.slice(0, 12).map((timeSlot) => (
              <div key={timeSlot} className="text-sm font-semibold text-gray-700 p-2 text-center bg-white rounded shadow-sm">
                {timeSlot}
              </div>
            ))}
          </div>

          {/* HVAC Systems Rows */}
          {Object.entries(systemGroups).map(([systemName, schedules]) => (
            <div key={systemName} className="grid grid-cols-[140px_repeat(auto-fit,minmax(70px,1fr))] gap-2 mb-2">
              {/* System Name */}
              <div className="font-semibold text-gray-800 p-3 bg-white rounded shadow-sm flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                {systemName}
                <div className="text-xs text-gray-500 ml-2">
                  Zone {systemName.split('-')[1]}
                </div>
              </div>
              
              {/* Time Slot Status */}
              {timeSlots.slice(0, 12).map((timeSlot) => {
                const schedule = schedules.find(s => s.timeSlot === timeSlot);
                const shouldBeOn = schedule?.shouldBeOn || false;
                const hasClass = schedule?.hasActiveClass || false;
                
                return (
                  <div
                    key={`${systemName}-${timeSlot}`}
                    className={`p-3 rounded-lg text-center transition-all duration-200 shadow-sm ${
                      shouldBeOn
                        ? 'bg-green-100 border-2 border-green-400 text-green-800'
                        : 'bg-red-100 border-2 border-red-400 text-red-800'
                    }`}
                    title={`${timeSlot}: ${shouldBeOn ? 'ON' : 'OFF'}${hasClass ? ' (Class Active)' : ' (No Class)'}`}
                  >
                    {shouldBeOn ? (
                      <Power className="w-4 h-4 text-green-600 mx-auto" />
                    ) : (
                      <PowerOff className="w-4 h-4 text-red-600 mx-auto" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded flex items-center justify-center">
            <Power className="w-3 h-3 text-green-600" />
          </div>
          <span className="text-gray-600">HVAC ON (Class Active)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded flex items-center justify-center">
            <PowerOff className="w-3 h-3 text-red-600" />
          </div>
          <span className="text-gray-600">HVAC OFF (Safe to Maintain)</span>
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
          <div className="text-sm text-gray-600">Total HVAC Systems</div>
          <div className="text-2xl font-bold text-blue-600">
            {Object.keys(systemGroups).length}
          </div>
        </div>
      </div>
    </div>
  );
}
