'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Zap, TrendingUp, Calendar, Clock, FileText, Database } from 'lucide-react';
import { EnergyUsage } from '@/types';
import { fetchEnergyUsage, fetchCSVInfo } from '@/services/api';

type TimeFrame = 'day' | 'week' | 'month';

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
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('day');
  const [csvInfo, setCsvInfo] = useState<any>(null);
  const [dataSource, setDataSource] = useState<'CSV' | 'Mock'>('Mock');
  const [displayDate, setDisplayDate] = useState<string>('');

  const buildings = ['14', '26', '52'];
  const timeFrameOptions: TimeFrameOption[] = [
    { value: 'day', label: 'Daily View', description: '15-min intervals' },
    { value: 'week', label: 'Weekly View', description: 'Daily averages' },
    { value: 'month', label: 'Monthly View', description: 'Weekly averages' }
  ];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load CSV info first
        try {
          const csvResponse = await fetchCSVInfo();
          if (csvResponse.success && csvResponse.data.totalRecords > 0) {
            setCsvInfo(csvResponse.data);
            setDataSource('CSV');
            
            // Set display date from CSV data
            if (csvResponse.data.dateRange.start) {
              const startDate = new Date(csvResponse.data.dateRange.start);
              setDisplayDate(startDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }));
            }
          } else {
            setDataSource('Mock');
            setDisplayDate('Demo Data (August 1, 2025)');
          }
        } catch (csvError) {
          console.log('CSV info not available, using mock data');
          setDataSource('Mock');
          setDisplayDate('Demo Data (August 1, 2025)');
        }
        
        // Load energy data
        const response = await fetchEnergyUsage();
        if (response.success) {
          setEnergyData(response.data);
          
          // If we have real data but no CSV info, extract date from first record
          if (response.data.length > 0 && !displayDate) {
            const firstRecord = response.data[0];
            const recordDate = new Date(firstRecord.dateTime);
            setDisplayDate(recordDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }));
          }
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
    
    if (baseData.length === 0) {
      return [];
    }
    
    // Get the actual date from the data
    const firstRecord = baseData[0];
    const dataDate = new Date(firstRecord.dateTime);
    
    switch (selectedTimeFrame) {
      case 'day':
        // Use all existing 15-minute interval data for the full 24-hour period
        // Sort by time to ensure proper chronological order
        const sortedData = baseData
          .filter(usage => {
            const usageDate = new Date(usage.dateTime);
            return usageDate.toDateString() === dataDate.toDateString();
          })
          .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
        
        return sortedData.map(usage => ({
          time: new Date(usage.dateTime).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          energy: usage.energyUsedKwh,
          timestamp: usage.dateTime
        }));
        
      case 'week':
        // Generate daily data for the week containing our data date
        const weekData = [];
        const startOfWeek = new Date(dataDate);
        startOfWeek.setDate(dataDate.getDate() - dataDate.getDay()); // Start of week (Sunday)
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const baseUsage = activeBuilding === '14' ? 35 : activeBuilding === '26' ? 28 : 42;
        
        days.forEach((day, index) => {
          const currentDay = new Date(startOfWeek);
          currentDay.setDate(startOfWeek.getDate() + index);
          
          // If this is the day we have data for, use higher usage
          const isDataDay = currentDay.toDateString() === dataDate.toDateString();
          const variation = (Math.random() - 0.5) * 10;
          const multiplier = isDataDay ? 1.2 : 1.0; // Higher usage on data day
          
          weekData.push({
            time: day,
            energy: Math.round((baseUsage + variation) * 24 * multiplier * 100) / 100, // Daily total
            timestamp: currentDay.toISOString()
          });
        });
        return weekData;
        
      case 'month':
        // Generate weekly data for the month containing our data date
        const monthData = [];
        const startOfMonth = new Date(dataDate.getFullYear(), dataDate.getMonth(), 1);
        const weeksInMonth = Math.ceil((new Date(dataDate.getFullYear(), dataDate.getMonth() + 1, 0).getDate() + startOfMonth.getDay()) / 7);
        
        const weeklyBase = activeBuilding === '14' ? 35 : activeBuilding === '26' ? 28 : 42;
        
        for (let week = 0; week < weeksInMonth; week++) {
          const weekStart = new Date(startOfMonth);
          weekStart.setDate(1 + (week * 7) - startOfMonth.getDay());
          
          const variation = (Math.random() - 0.5) * 20;
          monthData.push({
            time: `Week ${week + 1}`,
            energy: Math.round((weeklyBase + variation) * 24 * 7 * 100) / 100, // Weekly total
            timestamp: weekStart.toISOString()
          });
        }
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Energy Usage Analysis
        </h2>
        <div className="flex items-center gap-2 text-sm">
          {dataSource === 'CSV' ? (
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded">
              <FileText className="w-4 h-4" />
              <span>CSV Data</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded">
              <Database className="w-4 h-4" />
              <span>Mock Data</span>
            </div>
          )}
        </div>
      </div>
      
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
          {selectedTimeFrame === 'day' ? (
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
          Building {activeBuilding} - {timeFrameOptions.find(opt => opt.value === selectedTimeFrame)?.label}
        </h3>
        {displayDate && (
          <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Showing data for: {displayDate}</span>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Data Points:</span>
            <span className="font-medium ml-2">{chartData.length} readings</span>
          </div>
          <div>
            <span className="text-gray-600">Data Source:</span>
            <span className={`font-medium ml-2 ${dataSource === 'CSV' ? 'text-green-600' : 'text-blue-600'}`}>
              {dataSource === 'CSV' ? 'CSV File' : 'Mock Data'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Time Range:</span>
            <span className="font-medium ml-2">
              {selectedTimeFrame === 'day' ? '15-minute intervals' : 
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
          {csvInfo && (
            <>
              <div>
                <span className="text-gray-600">CSV Records:</span>
                <span className="font-medium ml-2">{csvInfo.totalRecords}</span>
              </div>
              <div>
                <span className="text-gray-600">CSV Date Range:</span>
                <span className="font-medium ml-2">
                  {new Date(csvInfo.dateRange.start).toLocaleDateString()} - {new Date(csvInfo.dateRange.end).toLocaleDateString()}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
