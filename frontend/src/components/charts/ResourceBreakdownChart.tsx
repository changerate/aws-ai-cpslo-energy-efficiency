import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface ResourceBreakdownChartProps {
  data: {
    resourceType: string;
    energyConsumed: number;
    cost: number;
    carbonEmissions: number;
  }[];
  metric?: 'energy' | 'cost' | 'carbon';
  height?: number;
}

const COLORS = {
  ec2: '#3b82f6',
  rds: '#10b981',
  lambda: '#f59e0b',
  s3: '#ef4444',
  cloudfront: '#8b5cf6',
  other: '#6b7280',
};

const ResourceBreakdownChart: React.FC<ResourceBreakdownChartProps> = ({
  data,
  metric = 'cost',
  height = 400,
}) => {
  const getMetricValue = (item: any) => {
    switch (metric) {
      case 'energy':
        return item.energyConsumed;
      case 'cost':
        return item.cost;
      case 'carbon':
        return item.carbonEmissions;
      default:
        return item.cost;
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
        return 'Cost ($)';
    }
  };

  const chartData = data.map(item => ({
    name: item.resourceType.toUpperCase(),
    value: getMetricValue(item),
    percentage: 0, // Will be calculated
  }));

  // Calculate percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  chartData.forEach(item => {
    item.percentage = total > 0 ? (item.value / total) * 100 : 0;
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">
            <span className="font-medium">{getMetricLabel()}:</span>{' '}
            {data.value.toFixed(2)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Percentage:</span>{' '}
            {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || COLORS.other}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>
                {value} ({entry.payload?.percentage?.toFixed(1)}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResourceBreakdownChart;
