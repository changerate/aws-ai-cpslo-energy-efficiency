import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScheduleUpload from '../ScheduleUpload';

describe('ScheduleUpload Component', () => {
  const mockOnScheduleUpload = jest.fn();

  beforeEach(() => {
    mockOnScheduleUpload.mockClear();
  });

  test('renders upload area with correct text', () => {
    render(<ScheduleUpload onScheduleUpload={mockOnScheduleUpload} />);
    
    expect(screen.getByText('📅 Class Schedule Upload')).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop your CSV file here/)).toBeInTheDocument();
    expect(screen.getByText('Choose File')).toBeInTheDocument();
  });

  test('displays expected CSV format information', () => {
    render(<ScheduleUpload onScheduleUpload={mockOnScheduleUpload} />);
    
    expect(screen.getByText(/Expected format: Course Name, Instructor, Days, Start Time, End Time, Room, Building/)).toBeInTheDocument();
  });

  test('upload button is clickable', () => {
    render(<ScheduleUpload onScheduleUpload={mockOnScheduleUpload} />);
    
    const uploadButton = screen.getByText('Choose File');
    expect(uploadButton).toBeInTheDocument();
    
    fireEvent.click(uploadButton);
    // File input should be triggered (though we can't easily test file selection in jsdom)
  });

  test('drag and drop area responds to drag events', () => {
    render(<ScheduleUpload onScheduleUpload={mockOnScheduleUpload} />);
    
    const uploadArea = screen.getByText(/Drag and drop your CSV file here/).closest('.upload-area');
    
    // Test drag over
    fireEvent.dragOver(uploadArea);
    expect(uploadArea).toHaveClass('dragover');
    
    // Test drag leave
    fireEvent.dragLeave(uploadArea);
    expect(uploadArea).not.toHaveClass('dragover');
  });
});
