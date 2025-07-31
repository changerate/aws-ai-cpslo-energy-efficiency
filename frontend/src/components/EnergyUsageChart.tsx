'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Zap, TrendingUp, Calendar, Clock } from 'lucide-react';
import { EnergyUsage } from '@/types';
import { fetchEnergyUsage } from '@/services/api';

type TimeFrame = 'today' | 'week' | 'month';

interface TimeFrameOption {
  value: TimeFrame;
  label: string;
  description: string;
}

export default function EnergyUsageChart() {
  const [energyData, setEnergyData] = useState<EnergyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBuilding, setActiveBuilding] = useState('14');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('today');

  const buildings = ['14', '26', '52'];
  const timeFrameOptions: TimeFrameOption[] = [
    { value: 'today', label: 'Today', description: '15-min intervals' },
    { value: 'week', label: 'This Week', description: 'Daily averages' },
    { value: 'month', label: 'This Month', description: 'Weekly averages' }
  ];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
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

  // Filter data for the active building
  const buildingEnergyData = energyData.filter(
    usage => usage.buildingNumber === activeBuilding
  );

  // Generate mock data for different timeframes
  const generateTimeFrameData = () => {
    const baseData = buildingEnergyData;
    
    switch (selectedTimeFrame) {
      case 'today':
        // Use existing 15-minute interval data
        return baseData.map(usage => ({
          time: new Date(usage.dateTime).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          energy: usage.energyUsedKwh,
          timestamp: usage.dateTime
        }));
        
      case 'week':
        // Generate daily data for the week
        const weekData = [];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const baseUsage = activeBuilding === '14' ? 35 : activeBuilding === '26' ? 28 : 42;
        
        days.forEach((day, index) => {
          const variation = (Math.random() - 0.5) * 10;
          weekData.push({
            time: day,
            energy: Math.round((baseUsage + variation) * 24 * 100) / 100, // Daily total
            timestamp: new Date(2025, 7, index + 1).toISOString()
          });
        });
        return weekData;
        
      case 'month':
        // Generate weekly data for the month
        const monthData = [];
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const weeklyBase = activeBuilding === '14' ? 35 : activeBuilding === '26' ? 28 : 42;
        
        weeks.forEach((week, index) => {
          const variation = (Math.random() - 0.5) * 20;
          monthData.push({
            time: week,
            energy: Math.round((weeklyBase + variation) * 24 * 7 * 100) / 100, // Weekly total
            timestamp: new Date(2025, 7, index * 7 + 1).toISOString()
          });
        });
        return monthData;
        
      default:
        return baseData.map(usage => ({
          time: new Date(usage.dateTime).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          energy: usage.energyUsedKwh,
          timestamp: usage.dateTime
        }));
    }
  };

  const chartData = generateTimeFrameData();

  // Calculate statistics
  const totalEnergy = chartData.reduce((sum, item) => sum + item.energy, 0);
  const avgEnergy = chartData.length > 0 ? totalEnergy / chartData.length : 0;
  const maxEnergy = Math.max(...chartData.map(item => item.energy));
  const minEnergy = Math.min(...chartData.map(item => item.energy));

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Energy Usage Analysis
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
          Energy Usage Analysis
        </h2>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5" />
        Energy Usage Analysis
      </h2>
      
      {/* Building Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
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

      {/* Timeframe Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        {timeFrameOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedTimeFrame(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTimeFrame === option.value
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{option.label}</span>
            </div>
            <div className="text-xs opacity-75">{option.description}</div>
          </button>
        ))}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
            <span className="text-sm text-gray-600">Average</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{avgEnergy.toFixed(1)} kWh</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-600">Peak Usage</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{maxEnergy.toFixed(1)} kWh</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600">Min Usage</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{minEnergy.toFixed(1)} kWh</div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          {selectedTimeFrame === 'today' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                label={{ value: 'kWh', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)} kWh`, 'Energy Usage']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="energy" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: 'kWh', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)} kWh`, 'Energy Usage']}
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Bar 
                dataKey="energy" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Current Status */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">
          Building {activeBuilding} - {timeFrameOptions.find(opt => opt.value === selectedTimeFrame)?.label} Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Data Points:</span>
            <span className="font-medium ml-2">{chartData.length} readings</span>
          </div>
          <div>
            <span className="text-gray-600">Time Range:</span>
            <span className="font-medium ml-2">
              {selectedTimeFrame === 'today' ? '15-minute intervals' : 
               selectedTimeFrame === 'week' ? 'Daily totals' : 'Weekly totals'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Efficiency Status:</span>
            <span className={`font-medium ml-2 ${
              avgEnergy < 30 ? 'text-green-600' : 
              avgEnergy < 40 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {avgEnergy < 30 ? 'Excellent' : 
               avgEnergy < 40 ? 'Good' : 'Needs Attention'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="font-medium ml-2">
              {new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
