'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, DollarSign, Calendar, Zap, Award, AlertTriangle } from 'lucide-react';
import { fetchSavingsComparison, fetchEnergyUsage } from '@/services/api';

type TimeFrame = 'day' | 'week' | 'month';

interface TimeFrameOption {
  value: TimeFrame;
  label: string;
  description: string;
}

interface SavingsData {
  currentPeriod: {
    usage: number;
    period: string;
    dataPoints: number;
  };
  previousYear: {
    usage: number;
    period: string;
    dataPoints: number;
  };
  savings: {
    absolute: number;
    percentage: number;
    cost: number;
  };
  comparison: 'better' | 'worse' | 'same';
}

interface ChartDataPoint {
  time: string;
  currentUsage: number;
  previousYearUsage: number;
  timestamp: string;
}

export default function EnergySavingsChart() {
  const [savingsData, setSavingsData] = useState<SavingsData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBuilding, setActiveBuilding] = useState('14');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('day');

  const buildings = ['14', '26', '52'];
  const timeFrameOptions: TimeFrameOption[] = [
    { value: 'day', label: 'Daily Savings', description: 'vs same day last year' },
    { value: 'week', label: 'Weekly Savings', description: 'vs same week last year' },
    { value: 'month', label: 'Monthly Savings', description: 'vs same month last year' }
  ];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load savings summary
        const savingsResponse = await fetchSavingsComparison(activeBuilding, selectedTimeFrame);
        if (savingsResponse.success) {
          setSavingsData(savingsResponse.data);
        }

        // Load detailed energy usage data for chart
        const energyResponse = await fetchEnergyUsage(activeBuilding, selectedTimeFrame);
        if (energyResponse.success) {
          const processedChartData = processEnergyDataForChart(energyResponse.data, selectedTimeFrame);
          setChartData(processedChartData);
        }

        if (!savingsResponse.success && !energyResponse.success) {
          setError('Failed to load savings data');
        }
      } catch (err) {
        setError('Error loading savings data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [activeBuilding, selectedTimeFrame]);

  const processEnergyDataForChart = (data: any[], timeframe: TimeFrame): ChartDataPoint[] => {
    if (!data || data.length === 0) return [];

    // Filter data for current year and previous year
    const currentYearData = data.filter(d => new Date(d.dateTime).getFullYear() === 2025);
    const previousYearData = data.filter(d => new Date(d.dateTime).getFullYear() === 2024);

    // Create time-based groupings based on timeframe
    const chartPoints: ChartDataPoint[] = [];

    if (timeframe === 'day') {
      // For daily view, show all 15-minute intervals throughout the full 24-hour period
      // Create a complete 24-hour timeline
      const fullDayTimeline: { [timeKey: string]: { current: number[], previous: number[] } } = {};
      
      // Initialize all 15-minute intervals for 24 hours
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const timeKey = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          fullDayTimeline[timeKey] = { current: [], previous: [] };
        }
      }

      // Populate with actual data
      currentYearData.forEach(d => {
        const date = new Date(d.dateTime);
        const timeKey = `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
        if (fullDayTimeline[timeKey]) {
          fullDayTimeline[timeKey].current.push(d.energyUsedKwh);
        }
      });

      previousYearData.forEach(d => {
        const date = new Date(d.dateTime);
        const timeKey = `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
        if (fullDayTimeline[timeKey]) {
          fullDayTimeline[timeKey].previous.push(d.energyUsedKwh);
        }
      });

      // Create chart data points for all time slots
      Object.keys(fullDayTimeline).sort().forEach(timeKey => {
        const currentAvg = fullDayTimeline[timeKey].current.length > 0 
          ? fullDayTimeline[timeKey].current.reduce((sum, val) => sum + val, 0) / fullDayTimeline[timeKey].current.length 
          : 0;
        const previousAvg = fullDayTimeline[timeKey].previous.length > 0 
          ? fullDayTimeline[timeKey].previous.reduce((sum, val) => sum + val, 0) / fullDayTimeline[timeKey].previous.length 
          : 0;

        // Include all time slots, even if no data (will show as 0)
        chartPoints.push({
          time: timeKey,
          currentUsage: Math.round(currentAvg * 100) / 100,
          previousYearUsage: Math.round(previousAvg * 100) / 100,
          timestamp: `2025-06-15T${timeKey}:00.000Z`
        });
      });
    } else if (timeframe === 'week') {
      // Generate daily data for week view using real CSV data
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Get the reference date from the data
      const referenceDate = currentYearData.length > 0 ? new Date(currentYearData[0].dateTime) : new Date('2025-06-15');
      const startOfWeek = new Date(referenceDate);
      startOfWeek.setUTCDate(referenceDate.getUTCDate() - referenceDate.getUTCDay()); // Start of week (Sunday)
      
      days.forEach((day, index) => {
        const currentDay = new Date(startOfWeek);
        currentDay.setUTCDate(startOfWeek.getUTCDate() + index);
        
        const previousYearDay = new Date(currentDay);
        previousYearDay.setUTCFullYear(currentDay.getUTCFullYear() - 1);
        
        // Filter data for this specific day
        const currentDayData = currentYearData.filter(d => {
          const dataDate = new Date(d.dateTime);
          return dataDate.toDateString() === currentDay.toDateString();
        });
        
        const previousDayData = previousYearData.filter(d => {
          const dataDate = new Date(d.dateTime);
          return dataDate.toDateString() === previousYearDay.toDateString();
        });
        
        // Calculate daily totals
        const currentDayTotal = currentDayData.reduce((sum, d) => sum + d.energyUsedKwh, 0);
        const previousDayTotal = previousDayData.reduce((sum, d) => sum + d.energyUsedKwh, 0);
        
        chartPoints.push({
          time: day,
          currentUsage: Math.round(currentDayTotal * 100) / 100,
          previousYearUsage: Math.round(previousDayTotal * 100) / 100,
          timestamp: currentDay.toISOString()
        });
      });
    } else {
      // Generate weekly data for month view using real CSV data
      const referenceDate = currentYearData.length > 0 ? new Date(currentYearData[0].dateTime) : new Date('2025-06-15');
      const startOfMonth = new Date(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1);
      const weeksInMonth = Math.ceil((new Date(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() + 1, 0).getUTCDate() + startOfMonth.getUTCDay()) / 7);
      
      for (let week = 0; week < weeksInMonth; week++) {
        const weekStart = new Date(startOfMonth);
        weekStart.setUTCDate(1 + (week * 7) - startOfMonth.getUTCDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
        
        const previousYearWeekStart = new Date(weekStart);
        previousYearWeekStart.setUTCFullYear(weekStart.getUTCFullYear() - 1);
        const previousYearWeekEnd = new Date(weekEnd);
        previousYearWeekEnd.setUTCFullYear(weekEnd.getUTCFullYear() - 1);
        
        // Filter data for this week
        const currentWeekData = currentYearData.filter(d => {
          const dataDate = new Date(d.dateTime);
          return dataDate >= weekStart && dataDate <= weekEnd;
        });
        
        const previousWeekData = previousYearData.filter(d => {
          const dataDate = new Date(d.dateTime);
          return dataDate >= previousYearWeekStart && dataDate <= previousYearWeekEnd;
        });
        
        // Calculate weekly totals
        const currentWeekTotal = currentWeekData.reduce((sum, d) => sum + d.energyUsedKwh, 0);
        const previousWeekTotal = previousWeekData.reduce((sum, d) => sum + d.energyUsedKwh, 0);
        
        chartPoints.push({
          time: `Week ${week + 1}`,
          currentUsage: Math.round(currentWeekTotal * 100) / 100,
          previousYearUsage: Math.round(previousWeekTotal * 100) / 100,
          timestamp: weekStart.toISOString()
        });
      }
    }

    return chartPoints;
  };

  const getComparisonColor = (comparison: string) => {
    switch (comparison) {
      case 'better': return '#10b981'; // Green
      case 'worse': return '#ef4444';  // Red
      default: return '#6b7280';       // Gray
    }
  };

  const getComparisonIcon = (comparison: string) => {
    switch (comparison) {
      case 'better': return <TrendingDown className="w-5 h-5 text-green-600" />;
      case 'worse': return <TrendingUp className="w-5 h-5 text-red-600" />;
      default: return <Zap className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          Energy Savings Analysis
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
          <TrendingDown className="w-5 h-5" />
          Energy Savings Analysis
        </h2>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!savingsData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          Energy Savings Analysis
        </h2>
        <div className="text-gray-500">No savings data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          Energy Savings Analysis
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Real CSV Data</span>
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

      {/* Savings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${
          savingsData.comparison === 'better' ? 'bg-green-50' : 
          savingsData.comparison === 'worse' ? 'bg-red-50' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {getComparisonIcon(savingsData.comparison)}
            <span className="text-sm text-gray-600">Energy Savings</span>
          </div>
          <div className={`text-2xl font-bold ${
            savingsData.comparison === 'better' ? 'text-green-600' : 
            savingsData.comparison === 'worse' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {savingsData.savings.absolute > 0 ? '+' : ''}{savingsData.savings.absolute} kWh
          </div>
          <div className="text-sm text-gray-500">
            {savingsData.savings.percentage > 0 ? '+' : ''}{savingsData.savings.percentage}% vs last year
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          savingsData.savings.cost > 0 ? 'bg-green-50' : 
          savingsData.savings.cost < 0 ? 'bg-red-50' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className={`w-4 h-4 ${
              savingsData.savings.cost > 0 ? 'text-green-500' : 
              savingsData.savings.cost < 0 ? 'text-red-500' : 'text-gray-500'
            }`} />
            <span className="text-sm text-gray-600">Cost Impact</span>
          </div>
          <div className={`text-2xl font-bold ${
            savingsData.savings.cost > 0 ? 'text-green-600' : 
            savingsData.savings.cost < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            ${Math.abs(savingsData.savings.cost).toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            {savingsData.savings.cost > 0 ? 'Saved' : savingsData.savings.cost < 0 ? 'Additional cost' : 'No change'}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">Performance</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {savingsData.comparison === 'better' ? 'Excellent' : 
             savingsData.comparison === 'worse' ? 'Needs Attention' : 'Stable'}
          </div>
          <div className="text-sm text-gray-500">
            vs same period last year
          </div>
        </div>
      </div>

      {/* Line + Area Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }}
              angle={selectedTimeFrame === 'day' ? -45 : 0}
              textAnchor={selectedTimeFrame === 'day' ? 'end' : 'middle'}
              height={selectedTimeFrame === 'day' ? 60 : 30}
              interval={selectedTimeFrame === 'day' ? 'preserveStartEnd' : 0}
              tickFormatter={(value, index) => {
                // For daily view, show every 4th tick (every hour) for better readability
                if (selectedTimeFrame === 'day' && index % 4 !== 0) return '';
                return value;
              }}
            />
            <YAxis 
              label={{ value: 'kWh', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value.toFixed(2)} kWh`, 
                name === 'previousYearUsage' ? 'Previous Year (without system)' : 'Current Usage (with system)'
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            
            {/* Shaded area for previous year usage */}
            <Area
              type="monotone"
              dataKey="previousYearUsage"
              fill="#fca5a5"
              fillOpacity={0.3}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5,5"
              name="Previous Year Usage"
            />
            
            {/* Solid line for current usage */}
            <Line 
              type="monotone" 
              dataKey="currentUsage" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 2 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              name="Current Usage"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className="flex justify-center gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 border-2 border-red-400 border-dashed rounded"></div>
          <span className="text-gray-600">Previous Year Usage (without system)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600">Current Usage (with system)</span>
        </div>
      </div>

      {/* Detailed Comparison */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-3">Period Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded bg-red-400 border border-red-500 border-dashed"></div>
              <span className="font-medium text-gray-700">Previous Year (without system)</span>
            </div>
            <div className="text-sm text-gray-600 mb-1">{savingsData.previousYear.period}</div>
            <div className="text-lg font-bold text-gray-800">{savingsData.previousYear.usage} kWh</div>
            <div className="text-xs text-gray-500">{savingsData.previousYear.dataPoints} data points</div>
          </div>
          
          <div className="bg-white p-3 rounded border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="font-medium text-gray-700">Current Period (with system)</span>
            </div>
            <div className="text-sm text-gray-600 mb-1">{savingsData.currentPeriod.period}</div>
            <div className="text-lg font-bold text-gray-800">{savingsData.currentPeriod.usage} kWh</div>
            <div className="text-xs text-gray-500">{savingsData.currentPeriod.dataPoints} data points</div>
          </div>
        </div>

        {savingsData.comparison !== 'same' && (
          <div className={`mt-4 p-3 rounded border-l-4 ${
            savingsData.comparison === 'better' 
              ? 'bg-green-50 border-green-400' 
              : 'bg-red-50 border-red-400'
          }`}>
            <div className="flex items-center gap-2">
              {savingsData.comparison === 'better' ? (
                <Award className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span className={`font-medium ${
                savingsData.comparison === 'better' ? 'text-green-800' : 'text-red-800'
              }`}>
                {savingsData.comparison === 'better' 
                  ? `Excellent! The energy efficiency system has reduced usage by ${Math.abs(savingsData.savings.absolute)} kWh compared to last year.`
                  : `Energy usage has increased by ${Math.abs(savingsData.savings.absolute)} kWh compared to last year. Consider system optimization.`
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
