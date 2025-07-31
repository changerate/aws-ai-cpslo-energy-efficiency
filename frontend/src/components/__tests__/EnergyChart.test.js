import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnergyChart from '../EnergyChart';

describe('EnergyChart Component', () => {
  const mockData = [
    { time: '08:00', current: 100, optimized: 80, day: 'Monday' },
    { time: '09:00', current: 120, optimized: 100, day: 'Monday' },
    { time: '10:00', current: 110, optimized: 90, day: 'Monday' }
  ];

  test('renders energy chart title', () => {
    render(<EnergyChart data={mockData} />);
    
    expect(screen.getByText('⚡ Energy Usage Analysis')).toBeInTheDocument();
  });

  test('displays energy usage description', () => {
    render(<EnergyChart data={mockData} />);
    
    expect(screen.getByText(/Comparison of current energy usage vs. optimized usage/)).toBeInTheDocument();
  });

  test('calculates and displays totals correctly', () => {
    render(<EnergyChart data={mockData} />);
    
    // Current total: 100 + 120 + 110 = 330
    expect(screen.getByText('330.0 kWh')).toBeInTheDocument();
    
    // Optimized total: 80 + 100 + 90 = 270
    expect(screen.getByText('270.0 kWh')).toBeInTheDocument();
    
    // Savings: 330 - 270 = 60
    expect(screen.getByText('60.0 kWh')).toBeInTheDocument();
  });

  test('displays correct labels for energy metrics', () => {
    render(<EnergyChart data={mockData} />);
    
    expect(screen.getByText('Current Total')).toBeInTheDocument();
    expect(screen.getByText('Optimized Total')).toBeInTheDocument();
    expect(screen.getByText('Daily Savings')).toBeInTheDocument();
  });
});
