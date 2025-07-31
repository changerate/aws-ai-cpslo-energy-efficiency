import React, { useState, useRef } from 'react';
import Papa from 'papaparse';

const ScheduleUpload = ({ onScheduleUpload }) => {
  const [schedule, setSchedule] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (file) => {
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      Papa.parse(file, {
        complete: (results) => {
          console.log('Raw CSV data:', results.data); // Debug log
          
          const parsedData = results.data
            .filter(row => row.length > 1 && row[0] && row[0].trim() !== '' && !row[0].toLowerCase().includes('course'))
            .map((row, index) => {
              const classData = {
                id: index,
                courseName: row[0]?.trim() || '',
                instructor: row[1]?.trim() || '',
                days: row[2]?.trim() || '',
                startTime: row[3]?.trim() || '',
                endTime: row[4]?.trim() || '',
                room: row[5]?.trim() || '',
                building: row[6]?.trim() || ''
              };
              
              console.log('Parsed class:', classData); // Debug log
              return classData;
            });
          
          console.log('Final parsed schedule:', parsedData); // Debug log
          setSchedule(parsedData);
          onScheduleUpload(parsedData);
        },
        header: false,
        skipEmptyLines: true,
        transformHeader: header => header.trim()
      });
    } else {
      alert('Please upload a valid CSV file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <h2 className="component-title">📅 Class Schedule Upload</h2>
      
      <div 
        className={`upload-area ${isDragOver ? 'dragover' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleUploadClick}
      >
        <div>
          <p>📁 Drag and drop your CSV file here or click to browse</p>
          <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.5rem' }}>
            Expected format: Course Name, Instructor, Days, Start Time, End Time, Room, Building
          </p>
          <button className="upload-button" type="button">
            Choose File
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInputChange}
          className="file-input"
        />
      </div>

      {schedule.length > 0 && (
        <div className="schedule-preview">
          <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
            📋 Uploaded Schedule ({schedule.length} classes)
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {schedule.slice(0, 5).map((item, index) => (
              <div key={index} className="schedule-item">
                <strong>{item.courseName}</strong>
                <br />
                <span style={{ color: '#7f8c8d' }}>
                  {item.days} | {item.startTime} - {item.endTime} | {item.room} ({item.building})
                </span>
              </div>
            ))}
            {schedule.length > 5 && (
              <p style={{ color: '#7f8c8d', fontStyle: 'italic', marginTop: '1rem' }}>
                ... and {schedule.length - 5} more classes
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleUpload;
