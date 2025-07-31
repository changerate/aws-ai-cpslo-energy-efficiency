import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const EnergyChart = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const current = payload.find(p => p.dataKey === 'current')?.value || 0;
      const optimized = payload.find(p => p.dataKey === 'optimized')?.value || 0;
      const savings = current - optimized;
      
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{`Time: ${label}`}</p>
          <p style={{ margin: '0 0 5px 0', color: '#e74c3c' }}>
            {`Current Usage: ${current} kWh`}
          </p>
          <p style={{ margin: '0 0 5px 0', color: '#27ae60' }}>
            {`Optimized Usage: ${optimized} kWh`}
          </p>
          <p style={{ margin: '0', color: '#3498db', fontWeight: 'bold' }}>
            {`Potential Savings: ${savings.toFixed(1)} kWh`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h2 className="component-title">⚡ Energy Usage Analysis</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: '#7f8c8d', fontSize: '0.9rem', textAlign: 'left' }}>
          Comparison of current energy usage vs. optimized usage based on class schedules
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#e74c3c" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="optimizedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#27ae60" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#27ae60" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time" 
            stroke="#7f8c8d"
            fontSize={12}
            interval={2}
          />
          <YAxis 
            stroke="#7f8c8d"
            fontSize={12}
            label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="current"
            stroke="#e74c3c"
            fillOpacity={1}
            fill="url(#currentGradient)"
            name="Current Usage"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="optimized"
            stroke="#27ae60"
            fillOpacity={1}
            fill="url(#optimizedGradient)"
            name="Optimized Usage"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '1rem', 
        marginTop: '1rem',
        textAlign: 'center'
      }}>
        <div style={{ 
          background: '#fee', 
          padding: '1rem', 
          borderRadius: '6px',
          border: '1px solid #e74c3c'
        }}>
          <div style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '1.2rem' }}>
            {data.reduce((sum, item) => sum + item.current, 0).toFixed(1)} kWh
          </div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Current Total</div>
        </div>
        
        <div style={{ 
          background: '#efe', 
          padding: '1rem', 
          borderRadius: '6px',
          border: '1px solid #27ae60'
        }}>
          <div style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '1.2rem' }}>
            {data.reduce((sum, item) => sum + item.optimized, 0).toFixed(1)} kWh
          </div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Optimized Total</div>
        </div>
        
        <div style={{ 
          background: '#eef', 
          padding: '1rem', 
          borderRadius: '6px',
          border: '1px solid #3498db'
        }}>
          <div style={{ color: '#3498db', fontWeight: 'bold', fontSize: '1.2rem' }}>
            {(data.reduce((sum, item) => sum + item.current, 0) - 
              data.reduce((sum, item) => sum + item.optimized, 0)).toFixed(1)} kWh
          </div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Daily Savings</div>
        </div>
      </div>
    </div>
  );
};

export default EnergyChart;
