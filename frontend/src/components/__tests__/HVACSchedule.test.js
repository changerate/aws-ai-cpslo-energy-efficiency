import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HVACSchedule from '../HVACSchedule';

describe('HVACSchedule Component', () => {
  const mockSchedule = [
    {
      day: 'Monday',
      schedule: [
        { time: '08:00', status: 'on', reason: 'Classes scheduled' },
        { time: '09:00', status: 'on', reason: 'Classes scheduled' },
        { time: '18:00', status: 'off', reason: 'No classes - energy saving mode' }
      ]
    },
    {
      day: 'Tuesday',
      schedule: [
        { time: '08:00', status: 'off', reason: 'No classes - energy saving mode' },
        { time: '09:00', status: 'on', reason: 'Classes scheduled' }
      ]
    }
  ];

  test('renders HVAC schedule title', () => {
    render(<HVACSchedule schedule={mockSchedule} />);
    
    expect(screen.getByText('🏢 HVAC Control Schedule')).toBeInTheDocument();
  });

  test('displays day selection buttons', () => {
    render(<HVACSchedule schedule={mockSchedule} />);
    
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  test('shows Monday schedule by default', () => {
    render(<HVACSchedule schedule={mockSchedule} />);
    
    expect(screen.getByText('Monday Schedule')).toBeInTheDocument();
  });

  test('switches to different day when button clicked', () => {
    render(<HVACSchedule schedule={mockSchedule} />);
    
    const tuesdayButton = screen.getByText('Tue');
    fireEvent.click(tuesdayButton);
    
    expect(screen.getByText('Tuesday Schedule')).toBeInTheDocument();
  });

  test('displays legend for HVAC status', () => {
    render(<HVACSchedule schedule={mockSchedule} />);
    
    expect(screen.getByText('HVAC ON (Classes scheduled or pre-cooling)')).toBeInTheDocument();
    expect(screen.getByText('HVAC OFF (Energy saving mode)')).toBeInTheDocument();
  });

  test('shows message when no schedule is provided', () => {
    render(<HVACSchedule schedule={[]} />);
    
    expect(screen.getByText(/Upload a class schedule to generate HVAC control recommendations/)).toBeInTheDocument();
  });
});
