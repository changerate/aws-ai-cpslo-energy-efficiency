import React from 'react';

const CostAnalysis = ({ costData }) => {
  const savingsPercentage = costData.currentCost > 0 
    ? ((costData.savings / costData.currentCost) * 100).toFixed(1)
    : 0;

  const annualSavings = (costData.savings * 365).toFixed(2);
  const monthlySavings = (costData.savings * 30).toFixed(2);

  return (
    <div>
      <h2 className="component-title">💰 Cost Analysis & Savings</h2>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: '#7f8c8d', fontSize: '0.9rem', textAlign: 'left' }}>
          Financial impact of optimized HVAC scheduling based on utility rates
        </p>
      </div>

      <div className="cost-grid">
        <div className="cost-card">
          <div className="cost-label">Current Daily Cost</div>
          <div className="cost-value current-cost">${costData.currentCost}</div>
          <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
            Based on current usage patterns
          </div>
        </div>
        
        <div className="cost-card">
          <div className="cost-label">Optimized Daily Cost</div>
          <div className="cost-value projected-cost">${costData.projectedCost}</div>
          <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
            With schedule-based HVAC control
          </div>
        </div>
      </div>

      <div className="savings-highlight">
        <h3>Daily Savings</h3>
        <div className="savings-amount">${costData.savings}</div>
        <div style={{ fontSize: '1rem', opacity: 0.9 }}>
          {savingsPercentage}% reduction in energy costs
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1rem', 
        marginTop: '1.5rem' 
      }}>
        <div style={{
          background: '#e8f5e8',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #27ae60'
        }}>
          <div style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '1.3rem' }}>
            ${monthlySavings}
          </div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Monthly Savings</div>
        </div>
        
        <div style={{
          background: '#e8f5e8',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #27ae60'
        }}>
          <div style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '1.3rem' }}>
            ${annualSavings}
          </div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Annual Savings</div>
        </div>
      </div>

      <div style={{
        marginTop: '1.5rem',
        background: '#f8f9fa',
        padding: '1rem',
        borderRadius: '6px',
        textAlign: 'left'
      }}>
        <h4 style={{ color: '#2c3e50', margin: '0 0 1rem 0' }}>💡 Cost Breakdown</h4>
        
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Utility Rate:</strong> $0.12 per kWh
        </div>
        
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Peak Hours:</strong> 8:00 AM - 6:00 PM (Higher rates may apply)
        </div>
        
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Off-Peak Savings:</strong> Maximum efficiency during unoccupied hours
        </div>
        
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          background: '#e3f2fd', 
          borderRadius: '4px',
          fontSize: '0.9rem'
        }}>
          <strong>💡 Tip:</strong> Additional savings possible with demand response programs 
          and time-of-use rates. Consider upgrading to smart thermostats for automated control.
        </div>
      </div>

      <div style={{
        marginTop: '1rem',
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>🎯 ROI Projection</h4>
        <div style={{ fontSize: '0.9rem' }}>
          With an estimated implementation cost of $5,000 for smart HVAC controls,
          <br />
          <strong>payback period: {(5000 / (costData.savings * 365)).toFixed(1)} years</strong>
        </div>
      </div>
    </div>
  );
};

export default CostAnalysis;
