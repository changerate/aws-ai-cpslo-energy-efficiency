'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, TrendingUp, Calendar, Clock, FileText, Database } from 'lucide-react';
import { EnergyUsage } from '@/types';
import { fetchEnergyUsage, fetchCSVInfo } from '@/services/api';

type TimeFrame = 'day' | 'week' | 'month';

interface TimeFrameOption {
  value: TimeFrame;
  label: string;
  description: string;
}

export default function EnergyCostChart() {
  const [energyData, setEnergyData] = useState<EnergyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBuilding, setActiveBuilding] = useState('14');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('day');
  const [csvInfo, setCsvInfo] = useState<{
    totalRecords: number;
    dateRange: { start: string; end: string };
  } | null>(null);
  const [dataSource, setDataSource] = useState<'CSV' | 'Mock'>('Mock');
  const [displayDate, setDisplayDate] = useState<string>('');

  const buildings = ['14', '26', '52'];
  const timeFrameOptions: TimeFrameOption[] = [
    { value: 'day', label: 'Daily View', description: '15-min intervals' },
    { value: 'week', label: 'Weekly View', description: 'Daily averages' },
    { value: 'month', label: 'Monthly View', description: 'Weekly averages' }
  ];

  // Energy cost rates ($/kWh) - different rates for different buildings/times
  const getCostRate = (buildingNumber: string, hour: number) => {
    const baseRates = {
      '14': 0.12, // $0.12/kWh
      '26': 0.11, // $0.11/kWh  
      '52': 0.13  // $0.13/kWh
    };
    
    // Peak hours (9 AM - 6 PM) have higher rates
    const isPeakHour = hour >= 9 && hour <= 18;
    const peakMultiplier = isPeakHour ? 1.4 : 1.0;
    
    return baseRates[buildingNumber as keyof typeof baseRates] * peakMultiplier;
  };

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
        } catch {
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
          setError('Failed to load energy cost data');
        }
      } catch (err) {
        setError('Error loading energy cost data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [displayDate]);

  // Filter data for the active building
  const buildingEnergyData = energyData.filter(
    usage => usage.buildingNumber === activeBuilding
  );

  // Generate cost data for different timeframes
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
        
        return sortedData.map(usage => {
          const date = new Date(usage.dateTime);
          const hour = date.getUTCHours();
          const costRate = getCostRate(activeBuilding, hour);
          const cost = usage.energyUsedKwh * costRate;
          
          return {
            time: `${hour.toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`,
            cost: Math.round(cost * 100) / 100, // Round to 2 decimal places
            energy: usage.energyUsedKwh,
            rate: costRate,
            timestamp: usage.dateTime
          };
        });
        
      case 'week':
        // Generate daily data for the week containing our data date
        const weekData: Array<{ time: string; cost: number; energy: number; rate: number; timestamp: string }> = [];
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
          const dailyEnergy = Math.round((baseUsage + variation) * 24 * multiplier * 100) / 100;
          
          // Calculate average cost rate for the day (mix of peak and off-peak)
          const avgRate = getCostRate(activeBuilding, 12); // Use noon rate as average
          const dailyCost = Math.round(dailyEnergy * avgRate * 100) / 100;
          
          weekData.push({
            time: day,
            cost: dailyCost,
            energy: dailyEnergy,
            rate: avgRate,
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
          const weeklyEnergy = Math.round((weeklyBase + variation) * 24 * 7 * 100) / 100;
          const avgRate = getCostRate(activeBuilding, 12);
          const weeklyCost = Math.round(weeklyEnergy * avgRate * 100) / 100;
          
          monthData.push({
            time: `Week ${week + 1}`,
            cost: weeklyCost,
            energy: weeklyEnergy,
            rate: avgRate,
            timestamp: weekStart.toISOString()
          });
        }
        return monthData;
        
      default:
        return baseData.map(usage => {
          const date = new Date(usage.dateTime);
          const hour = date.getUTCHours();
          const costRate = getCostRate(activeBuilding, hour);
          const cost = usage.energyUsedKwh * costRate;
          
          return {
            time: `${hour.toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`,
            cost: Math.round(cost * 100) / 100,
            energy: usage.energyUsedKwh,
            rate: costRate,
            timestamp: usage.dateTime
          };
        });
    }
  };

  const chartData = generateTimeFrameData();

  // Calculate statistics
  const totalCost = chartData.reduce((sum, item) => sum + item.cost, 0);
  const avgCost = chartData.length > 0 ? totalCost / chartData.length : 0;
  const maxCost = Math.max(...chartData.map(item => item.cost));
  const minCost = Math.min(...chartData.map(item => item.cost));

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-sm shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Energy Cost Analysis
        </h2>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-sm shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Energy Cost Analysis
        </h2>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-sm shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Energy Cost Analysis
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
                ? 'border-green-500 text-green-600'
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
            className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
              selectedTimeFrame === option.value
                ? 'bg-green-100 text-green-700 border border-green-300'
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
        <div className="bg-green-50 p-4 rounded-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">Total Cost</span>
          </div>
          <div className="text-2xl font-bold text-green-600">${totalCost.toFixed(2)}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">Average</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">${avgCost.toFixed(2)}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-600">Peak Cost</span>
          </div>
          <div className="text-2xl font-bold text-red-600">${maxCost.toFixed(2)}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600">Min Cost</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">${minCost.toFixed(2)}</div>
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
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
                tickFormatter={(value, index) => {
                  // Show every 4th tick (every hour) for better readability
                  if (index % 4 === 0) return value;
                  return '';
                }}
              />
              <YAxis 
                label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Energy Cost']}
                labelFormatter={(label) => `Time: ${label}`}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db' }}
              />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 2 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
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
                label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Energy Cost']}
                labelFormatter={(label) => `Period: ${label}`}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db' }}
              />
              <Bar 
                dataKey="cost" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Current Status */}
      <div className="bg-gray-50 p-4 rounded-sm">
        <h3 className="font-semibold text-gray-700 mb-2">
          Building {activeBuilding} - {timeFrameOptions.find(opt => opt.value === selectedTimeFrame)?.label}
        </h3>
        {displayDate && (
          <div className="mb-3 p-2 bg-green-50 rounded border-l-4 border-green-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Showing data for: {displayDate}</span>
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
            <span className="text-gray-600">Cost Efficiency:</span>
            <span className={`font-medium ml-2 ${
              avgCost < 4 ? 'text-green-600' : 
              avgCost < 6 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {avgCost < 4 ? 'Excellent' : 
               avgCost < 6 ? 'Good' : 'Needs Attention'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Current Rate:</span>
            <span className="font-medium ml-2 text-green-600">
              ${getCostRate(activeBuilding, new Date().getHours()).toFixed(3)}/kWh
            </span>
          </div>
          <div>
            <span className="text-gray-600">Peak Hours:</span>
            <span className="font-medium ml-2 text-orange-600">9 AM - 6 PM (+40%)</span>
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
