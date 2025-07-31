import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { EnergyUsageAggregated } from '@/types/energy';

interface EnergyUsageChartProps {
  data: EnergyUsageAggregated[];
  type?: 'line' | 'bar';
  metric?: 'energy' | 'cost' | 'carbon';
  height?: number;
}

const EnergyUsageChart: React.FC<EnergyUsageChartProps> = ({
  data,
  type = 'line',
  metric = 'energy',
  height = 400,
}) => {
  const getMetricValue = (item: EnergyUsageAggregated) => {
    switch (metric) {
      case 'energy':
        return item.totalEnergyConsumed;
      case 'cost':
        return item.totalCost;
      case 'carbon':
        return item.totalCarbonEmissions;
      default:
        return item.totalEnergyConsumed;
    }
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'energy':
        return 'Energy (kWh)';
      case 'cost':
        return 'Cost ($)';
      case 'carbon':
        return 'Carbon (kg CO2)';
      default:
        return 'Energy (kWh)';
    }
  };

  const getMetricColor = () => {
    switch (metric) {
      case 'energy':
        return '#3b82f6';
      case 'cost':
        return '#f59e0b';
      case 'carbon':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  };

  const chartData = data.map(item => ({
    period: new Date(item.period).toLocaleDateString(),
    value: getMetricValue(item),
    ...item,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-sm">
            <span className="font-medium">{getMetricLabel()}:</span>{' '}
            {payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        {type === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke={getMetricColor()}
              strokeWidth={2}
              dot={{ fill: getMetricColor(), strokeWidth: 2, r: 4 }}
              name={getMetricLabel()}
            />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="value"
              fill={getMetricColor()}
              name={getMetricLabel()}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default EnergyUsageChart;
