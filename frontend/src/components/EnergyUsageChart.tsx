'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Zap, TrendingUp } from 'lucide-react';
import { EnergyUsage } from '@/types';
import { fetchEnergyUsage } from '@/services/api';

export default function EnergyUsageChart() {
  const [energyData, setEnergyData] = useState<EnergyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetchEnergyUsage();
        if (response.success) {
          setEnergyData(response.data);
        } else {
          setError('Failed to load energy usage data');
        }
      } catch (err) {
        setError('Error loading energy usage data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Transform data for chart - group by time and separate by building
  const chartData = energyData.reduce((acc, usage) => {
    const time = new Date(usage.dateTime).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const existing = acc.find(item => item.time === time);
    if (existing) {
      existing[`building${usage.buildingNumber}`] = usage.energyUsedKwh;
    } else {
      const newItem: any = { time };
      newItem[`building${usage.buildingNumber}`] = usage.energyUsedKwh;
      acc.push(newItem);
    }
    return acc;
  }, [] as any[]);

  // Calculate total energy usage
  const totalEnergy = energyData.reduce((sum, usage) => sum + usage.energyUsedKwh, 0);
  const avgEnergy = energyData.length > 0 ? totalEnergy / energyData.length : 0;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Energy Usage
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
          <Zap className="w-5 h-5" />
          Energy Usage
        </h2>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5" />
        Energy Usage (15-minute intervals)
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">Total Usage</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{totalEnergy.toFixed(1)} kWh</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">Average Usage</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{avgEnergy.toFixed(1)} kWh</div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="building14" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Building 14"
            />
            <Line 
              type="monotone" 
              dataKey="building26" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Building 26"
            />
            <Line 
              type="monotone" 
              dataKey="building52" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Building 52"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
