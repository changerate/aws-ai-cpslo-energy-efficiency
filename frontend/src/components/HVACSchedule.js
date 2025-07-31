import React, { useState } from 'react';

const HVACSchedule = ({ schedule }) => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [hoveredSlot, setHoveredSlot] = useState(null);

  const getTimeLabel = (hour) => {
    if (hour === 0) return '12AM';
    if (hour < 12) return `${hour}AM`;
    if (hour === 12) return '12PM';
    return `${hour - 12}PM`;
  };

  const selectedDayData = schedule.find(day => day.day === selectedDay);

  // Debug logging
  React.useEffect(() => {
    console.log('HVAC Schedule data:', schedule);
    console.log('Selected day data:', selectedDayData);
  }, [schedule, selectedDayData]);

  return (
    <div>
      <h2 className="component-title">🏢 HVAC Control Schedule</h2>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: '#7f8c8d', fontSize: '0.9rem', textAlign: 'left', marginBottom: '1rem' }}>
          Optimized HVAC schedule based on class occupancy patterns
        </p>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: '0.5rem 1rem',
                border: selectedDay === day ? '2px solid #3498db' : '1px solid #ddd',
                borderRadius: '6px',
                background: selectedDay === day ? '#3498db' : 'white',
                color: selectedDay === day ? 'white' : '#2c3e50',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: selectedDay === day ? 'bold' : 'normal',
                transition: 'all 0.2s ease'
              }}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {selectedDayData && (
        <div>
          <h3 style={{ color: '#2c3e50', marginBottom: '1rem', textAlign: 'left' }}>
            {selectedDay} Schedule
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(24, 1fr)', 
              gap: '2px',
              marginBottom: '0.5rem'
            }}>
              {selectedDayData.schedule.map((slot, index) => (
                <div
                  key={index}
                  className={`time-slot ${slot.status}`}
                  onMouseEnter={() => setHoveredSlot(index)}
                  onMouseLeave={() => setHoveredSlot(null)}
                  style={{
                    position: 'relative',
                    height: '30px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: hoveredSlot === index ? 'scale(1.1)' : 'scale(1)',
                    zIndex: hoveredSlot === index ? 10 : 1,
                    boxShadow: hoveredSlot === index ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                  }}
                  title={`${slot.time}: ${slot.status.toUpperCase()} - ${slot.reason}`}
                />
              ))}
            </div>
            
            {/* Hour labels */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(24, 1fr)', 
              gap: '2px',
              fontSize: '0.7rem',
              color: '#7f8c8d',
              textAlign: 'center'
            }}>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i}>
                  {i % 4 === 0 ? getTimeLabel(i) : ''}
                </div>
              ))}
            </div>
          </div>

          {hoveredSlot !== null && (
            <div style={{
              background: '#f8f9fa',
              padding: '1rem',
              borderRadius: '6px',
              border: '1px solid #e9ecef',
              marginBottom: '1rem'
            }}>
              <strong>Time: {selectedDayData.schedule[hoveredSlot].time}</strong>
              <br />
              <span style={{ 
                color: selectedDayData.schedule[hoveredSlot].status === 'on' ? '#e74c3c' : '#27ae60',
                fontWeight: 'bold'
              }}>
                Status: {selectedDayData.schedule[hoveredSlot].status.toUpperCase()}
              </span>
              <br />
              <span style={{ color: '#7f8c8d' }}>
                {selectedDayData.schedule[hoveredSlot].reason}
              </span>
            </div>
          )}

          <div className="legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#e74c3c' }}></div>
              <span>HVAC ON (Classes scheduled or pre-cooling)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#27ae60' }}></div>
              <span>HVAC OFF (Energy saving mode)</span>
            </div>
          </div>

          <div style={{ 
            marginTop: '1.5rem',
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '6px',
            textAlign: 'left'
          }}>
            <h4 style={{ color: '#2c3e50', margin: '0 0 0.5rem 0' }}>Daily Summary for {selectedDay}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#e74c3c' }}>
                  HVAC ON: {selectedDayData.schedule.filter(s => s.status === 'on').length} hours
                </strong>
              </div>
              <div>
                <strong style={{ color: '#27ae60' }}>
                  HVAC OFF: {selectedDayData.schedule.filter(s => s.status === 'off').length} hours
                </strong>
              </div>
            </div>
            <div style={{ marginTop: '0.5rem', color: '#7f8c8d', fontSize: '0.9rem' }}>
              Energy savings: {((selectedDayData.schedule.filter(s => s.status === 'off').length / 24) * 100).toFixed(1)}% of the day
            </div>
            
            {/* Debug information */}
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#95a5a6' }}>
              <strong>Debug Info:</strong>
              <br />
              Total schedule entries: {selectedDayData.schedule.length}
              <br />
              ON periods: {selectedDayData.schedule.filter(s => s.status === 'on').map((s, i) => `${s.time}`).join(', ') || 'None'}
            </div>
          </div>
        </div>
      )}

      {schedule.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          color: '#7f8c8d', 
          padding: '2rem',
          background: '#f8f9fa',
          borderRadius: '6px'
        }}>
          <p>📋 Upload a class schedule to generate HVAC control recommendations</p>
        </div>
      )}
    </div>
  );
};

export default HVACSchedule;
