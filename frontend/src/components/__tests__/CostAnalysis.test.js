import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CostAnalysis from '../CostAnalysis';

describe('CostAnalysis Component', () => {
  const mockCostData = {
    currentCost: '100.00',
    projectedCost: '75.00',
    savings: '25.00'
  };

  test('renders cost analysis title', () => {
    render(<CostAnalysis costData={mockCostData} />);
    
    expect(screen.getByText('💰 Cost Analysis & Savings')).toBeInTheDocument();
  });

  test('displays current and projected costs', () => {
    render(<CostAnalysis costData={mockCostData} />);
    
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$75.00')).toBeInTheDocument();
  });

  test('shows daily savings prominently', () => {
    render(<CostAnalysis costData={mockCostData} />);
    
    expect(screen.getByText('Daily Savings')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
  });

  test('calculates and displays monthly savings', () => {
    render(<CostAnalysis costData={mockCostData} />);
    
    // Monthly savings: 25.00 * 30 = 750.00
    expect(screen.getByText('$750.00')).toBeInTheDocument();
    expect(screen.getByText('Monthly Savings')).toBeInTheDocument();
  });

  test('calculates and displays annual savings', () => {
    render(<CostAnalysis costData={mockCostData} />);
    
    // Annual savings: 25.00 * 365 = 9125.00
    expect(screen.getByText('$9125.00')).toBeInTheDocument();
    expect(screen.getByText('Annual Savings')).toBeInTheDocument();
  });

  test('displays utility rate information', () => {
    render(<CostAnalysis costData={mockCostData} />);
    
    expect(screen.getByText('Utility Rate:')).toBeInTheDocument();
    expect(screen.getByText('$0.12 per kWh')).toBeInTheDocument();
  });

  test('shows ROI projection', () => {
    render(<CostAnalysis costData={mockCostData} />);
    
    expect(screen.getByText('🎯 ROI Projection')).toBeInTheDocument();
    expect(screen.getByText(/payback period/)).toBeInTheDocument();
  });

  test('displays cost breakdown section', () => {
    render(<CostAnalysis costData={mockCostData} />);
    
    expect(screen.getByText('💡 Cost Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Peak Hours:')).toBeInTheDocument();
    expect(screen.getByText('8:00 AM - 6:00 PM (Higher rates may apply)')).toBeInTheDocument();
  });
});
