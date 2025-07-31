import HVACMaintenanceSchedule from '@/components/HVACMaintenanceSchedule';
import EnergyUsageChart from '@/components/EnergyUsageChart';
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
                Energy Efficiency Dashboard
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-2">Welcome to the Energy Dashboard</h2>
            <p className="text-blue-100">
              Monitor HVAC maintenance schedules, energy usage, and electricity rates across campus buildings in real-time.
            </p>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rate Data Chart */}
            <div className="lg:col-span-1">
              <RateDataChart />
            </div>

            {/* Energy Usage Chart - Takes 2 columns */}
            <div className="lg:col-span-2">
              <EnergyUsageChart />
            </div>

            {/* HVAC Maintenance Schedule - Full Width */}
            <div className="lg:col-span-3">
              <HVACMaintenanceSchedule />
            </div>
          </div>

          {/* Footer Info */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">HVAC Maintenance</h3>
                <p className="text-sm text-gray-500">
                  Track HVAC system schedules across campus buildings to optimize maintenance timing and energy consumption.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Energy Usage</h3>
                <p className="text-sm text-gray-500">
                  Monitor real-time energy consumption in 15-minute intervals to identify usage patterns and savings opportunities.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Electricity Rates</h3>
                <p className="text-sm text-gray-500">
                  View current electricity rates by tier to understand cost implications and optimize usage timing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
