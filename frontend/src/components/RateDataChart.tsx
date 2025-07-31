'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Info } from 'lucide-react';
import { RateData } from '@/types';
import { fetchRateData } from '@/services/api';

export default function RateDataChart() {
  const [rates, setRates] = useState<RateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetchRateData();
        if (response.success) {
          setRates(response.data);
        } else {
          setError('Failed to load rate data');
        }
      } catch (err) {
        setError('Error loading rate data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Transform data for chart
  const chartData = rates.map(rate => ({
    tier: rate.rateTier,
    price: rate.pricePerKwh,
    description: rate.description
  }));

  // Get color based on price level
  const getBarColor = (price: number) => {
    if (price >= 0.3) return '#ef4444'; // Red for high prices
    if (price >= 0.2) return '#f59e0b'; // Orange for medium prices
    return '#10b981'; // Green for low prices
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Electricity Rates
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
          <DollarSign className="w-5 h-5" />
          Electricity Rates
        </h2>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5" />
        Electricity Rates
      </h2>
      
      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="tier" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis label={{ value: '$/kWh', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(3)}/kWh`, 'Price']}
              labelFormatter={(label) => `Rate Tier: ${label}`}
            />
            <Bar 
              dataKey="price" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Rate Details */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Rate Details</h3>
        {rates.map((rate) => (
          <div key={rate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getBarColor(rate.pricePerKwh) }}
              ></div>
              <span className="font-medium">{rate.rateTier}</span>
              <span className="text-2xl font-bold text-green-600">${rate.pricePerKwh.toFixed(3)}/kWh</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Info className="w-4 h-4" />
              <span>{rate.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
