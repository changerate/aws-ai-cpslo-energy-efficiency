'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp } from 'lucide-react';
import { RateData } from '@/types';
import { fetchRateData } from '@/services/api';

export default function RateDataChart() {
  const [rateData, setRateData] = useState<RateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await fetchRateData();
        if (response.success) {
          setRateData(response.data);
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

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-sm shadow-lg">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Electricity Rates
        </h2>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-sm shadow-lg">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Electricity Rates
        </h2>
        <div className="text-red-500 text-sm">Error: {error}</div>
      </div>
    );
  }

  // Calculate statistics
  const avgRate = rateData.length > 0 ? rateData.reduce((sum, rate) => sum + rate.pricePerKwh, 0) / rateData.length : 0;
  const maxRate = Math.max(...rateData.map(rate => rate.pricePerKwh));
  const minRate = Math.min(...rateData.map(rate => rate.pricePerKwh));

  return (
    <div className="bg-white p-4 rounded-sm shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Electricity Rates
        </h2>
        <div className="text-sm text-gray-500">
          Current Pricing Tiers
        </div>
      </div>
      
      {/* Compact Statistics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">${minRate.toFixed(3)}</div>
          <div className="text-xs text-gray-500">Min Rate</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">${avgRate.toFixed(3)}</div>
          <div className="text-xs text-gray-500">Avg Rate</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">${maxRate.toFixed(3)}</div>
          <div className="text-xs text-gray-500">Peak Rate</div>
        </div>
      </div>
      
      {/* Compact Chart */}
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rateData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="rateTier" 
              tick={{ fontSize: 10 }}
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              label={{ value: '$/kWh', angle: -90, position: 'insideLeft', style: { fontSize: '10px' } }}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(3)}/kWh`, 'Rate']}
              labelFormatter={(label) => `Tier: ${label}`}
            />
            <Bar 
              dataKey="pricePerKwh" 
              fill="#8884d8"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Compact Rate List */}
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {rateData.map((rate, index) => (
          <div key={index} className="bg-gray-50 p-2 rounded text-center">
            <div className="font-medium">{rate.rateTier}</div>
            <div className="text-gray-600">${rate.pricePerKwh.toFixed(3)}/kWh</div>
          </div>
        ))}
      </div>
    </div>
  );
}
