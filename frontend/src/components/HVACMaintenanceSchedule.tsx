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
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        HVAC Maintenance Schedule
      </h2>
      
      {/* Building Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {buildings.map((building) => (
          <button
            key={building}
            onClick={() => setActiveBuilding(building)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeBuilding === building
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Building {building}
          </button>
        ))}
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header */}
          <div className="grid grid-cols-[120px_repeat(auto-fit,minmax(60px,1fr))] gap-1 mb-2">
            <div className="font-semibold text-gray-700 p-2">
              <Clock className="w-4 h-4 inline mr-1" />
              System
            </div>
            {timeSlots.slice(0, 12).map((timeSlot) => (
              <div key={timeSlot} className="text-xs font-medium text-gray-600 p-1 text-center">
                {timeSlot}
              </div>
            ))}
          </div>

          {/* HVAC Systems Rows */}
          {Object.entries(systemGroups).map(([systemName, schedules]) => (
            <div key={systemName} className="grid grid-cols-[120px_repeat(auto-fit,minmax(60px,1fr))] gap-1 mb-1">
              {/* System Name */}
              <div className="font-medium text-gray-800 p-2 bg-gray-50 rounded flex items-center">
                <Settings className="w-3 h-3 mr-1" />
                {systemName}
              </div>
              
              {/* Time Slot Status */}
              {timeSlots.slice(0, 12).map((timeSlot) => {
                const schedule = schedules.find(s => s.timeSlot === timeSlot);
                const shouldBeOn = schedule?.shouldBeOn || false;
                const hasClass = schedule?.hasActiveClass || false;
                
                return (
                  <div
                    key={`${systemName}-${timeSlot}`}
                    className={`p-2 rounded text-center transition-colors ${
                      shouldBeOn
                        ? 'bg-green-100 border border-green-300'
                        : 'bg-red-100 border border-red-300'
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
