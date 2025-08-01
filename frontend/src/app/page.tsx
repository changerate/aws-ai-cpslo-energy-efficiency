import AHUMaintenanceSchedule from '@/components/AHUMaintenanceSchedule';
import EnergyUsageChart from '@/components/EnergyUsageChart';
import EnergySavingsChart from '@/components/EnergySavingsChart';
import RateDataChart from '@/components/RateDataChart';
import { Activity, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Wattson CSUSD Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <BarChart3 className="w-4 h-4" />
              <span>Real-time Campus Data</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-sm shadow-sm">
            <h2 className="text-3xl font-bold mb-2">Welcome to the Energy Dashboard</h2>
            <p className="text-blue-100">
              Monitor Air-Handler Unit Optimizations, track energy usage and savings, with real-time data from your CSV files.
            </p>
          </div>

          {/* Air-Handler Unit Optimization - Full Width at Top */}
          <div className="w-full">
            <AHUMaintenanceSchedule />
          </div>

          {/* Energy Analysis Grid - Two Main Modules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Energy Usage Chart */}
            <div className="lg:col-span-1">
              <EnergyUsageChart />
            </div>

            {/* Energy Savings Chart */}
            <div className="lg:col-span-1">
              <EnergySavingsChart />
            </div>
          </div>

          {/* Electricity Rates - Minimized at Bottom */}
          <div className="w-full">
            <RateDataChart />
          </div>

          {/* Footer Info */}
          <div className="bg-white p-6 rounded-sm shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Air-Handler Unit</h3>
                <p className="text-sm text-gray-500">
                  Primary focus: Track AHU system schedules across campus buildings to optimize maintenance timing and prevent downtime.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Energy Usage</h3>
                <p className="text-sm text-gray-500">
                  Monitor real-time energy consumption with historical data from your CSV files for comprehensive analysis.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Savings Analysis</h3>
                <p className="text-sm text-gray-500">
                  Compare current energy usage with the same period last year to track efficiency improvements and cost savings.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Electricity Rates</h3>
                <p className="text-sm text-gray-500">
                  Reference current electricity rates by tier for cost calculations and budget planning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
