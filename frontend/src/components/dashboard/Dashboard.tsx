import React, { useState, useEffect } from 'react';
import { energyApi } from '@/utils/api';
import { DashboardSummary, EnergyUsageAggregated, EnergyEfficiencyMetrics } from '@/types/energy';
import EnergyUsageChart from '@/components/charts/EnergyUsageChart';
import ResourceBreakdownChart from '@/components/charts/ResourceBreakdownChart';
import { 
  Zap, 
  DollarSign, 
  Leaf, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [aggregatedData, setAggregatedData] = useState<EnergyUsageAggregated[]>([]);
  const [metrics, setMetrics] = useState<EnergyEfficiencyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'energy' | 'cost' | 'carbon'>('cost');
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryData, aggregatedData, metricsData] = await Promise.all([
          energyApi.getDashboard(),
          energyApi.getAggregated({ period: selectedPeriod }),
          energyApi.getMetrics(),
        ]);

        setSummary(summaryData);
        setAggregatedData(aggregatedData.aggregated);
        setMetrics(metricsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <Info className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Energy Efficiency Dashboard</h1>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Energy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalEnergyConsumed.toFixed(1)} kWh
                </p>
                <p className="text-sm text-gray-500">
                  Last 7 days: {summary.last7DaysEnergy.toFixed(1)} kWh
                </p>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summary.totalCost.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  Last 7 days: ${summary.last7DaysCost.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Carbon Emissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalCarbonEmissions.toFixed(1)} kg CO2
                </p>
                <p className="text-sm text-gray-500">
                  {metrics && getTrendIcon(metrics.trends.energyTrend)}
                </p>
              </div>
              <Leaf className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.efficiencyScore.toFixed(0) || 0}/100
                </p>
                <p className="text-sm text-gray-500">
                  Active Resources: {summary.activeResources}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                (metrics?.efficiencyScore || 0) >= 80 ? 'bg-green-100' :
                (metrics?.efficiencyScore || 0) >= 60 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <span className={`text-sm font-bold ${
                  (metrics?.efficiencyScore || 0) >= 80 ? 'text-green-600' :
                  (metrics?.efficiencyScore || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {metrics?.efficiencyScore.toFixed(0) || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Usage Trends</h2>
            <div className="flex space-x-2">
              {(['energy', 'cost', 'carbon'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    selectedMetric === metric
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <EnergyUsageChart
            data={aggregatedData}
            type="line"
            metric={selectedMetric}
            height={300}
          />
        </div>

        {/* Resource Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resource Breakdown</h2>
          {aggregatedData.length > 0 && (
            <ResourceBreakdownChart
              data={aggregatedData[0]?.resourceBreakdown || []}
              metric={selectedMetric}
              height={300}
            />
          )}
        </div>
      </div>

      {/* Recommendations */}
      {metrics && metrics.recommendations.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Optimization Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start space-x-3">
                  {getPriorityIcon(rec.priority)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <p className="font-medium text-green-600">
                          ${rec.potentialSavings.cost}
                        </p>
                        <p className="text-gray-500">Cost Savings</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-blue-600">
                          {rec.potentialSavings.energy} kWh
                        </p>
                        <p className="text-gray-500">Energy Savings</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-green-700">
                          {rec.potentialSavings.carbon} kg CO2
                        </p>
                        <p className="text-gray-500">Carbon Reduction</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
