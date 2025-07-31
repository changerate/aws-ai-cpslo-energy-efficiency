import React from 'react';
import { BarChart3, Zap, Settings, Home } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-blue-500" />
              <h1 className="text-xl font-bold text-gray-900">
                AWS Energy Efficiency Platform
              </h1>
            </div>
            <nav className="flex space-x-6">
              <a
                href="/"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </a>
              <a
                href="/analytics"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </a>
              <a
                href="/settings"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            © 2024 AWS Energy Efficiency Platform. Built for sustainable cloud computing.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
