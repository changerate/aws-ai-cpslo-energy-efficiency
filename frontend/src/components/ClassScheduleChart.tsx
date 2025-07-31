'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { ClassSchedule } from '@/types';
import { fetchClassSchedules } from '@/services/api';

export default function ClassScheduleChart() {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetchClassSchedules();
        if (response.success) {
          setSchedules(response.data);
        } else {
          setError('Failed to load class schedules');
        }
      } catch (err) {
        setError('Error loading class schedules');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Transform data for chart - count classes per building
  const chartData = schedules.reduce((acc, schedule) => {
    const existing = acc.find(item => item.building === schedule.buildingNumber);
    if (existing) {
      existing.classes += 1;
    } else {
      acc.push({
        building: `Building ${schedule.buildingNumber}`,
        classes: 1
      });
    }
    return acc;
  }, [] as { building: string; classes: number }[]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Class Schedules
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
          <Calendar className="w-5 h-5" />
          Class Schedules
        </h2>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Class Schedules
      </h2>
      
      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="building" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="classes" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Schedule List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Today's Schedule</h3>
        {schedules.map((schedule) => (
          <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{schedule.time}</span>
              <span className="text-gray-600">{schedule.className}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>Building {schedule.buildingNumber}, Room {schedule.roomNumber}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
