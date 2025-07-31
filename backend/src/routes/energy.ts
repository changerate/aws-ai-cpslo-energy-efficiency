import express, { Request, Response } from 'express';
import { EnergyUsage, EnergyUsageAggregated, EnergyEfficiencyMetrics } from '../models/EnergyUsage';

const router = express.Router();

// Mock data for demonstration - replace with actual database queries
const generateMockEnergyData = (days: number = 30): EnergyUsage[] => {
  const data: EnergyUsage[] = [];
  const resourceTypes: ('ec2' | 'rds' | 'lambda' | 's3' | 'cloudfront' | 'other')[] = ['ec2', 'rds', 'lambda', 's3', 'cloudfront', 'other'];
  const regions: string[] = ['us-east-1', 'us-west-2', 'eu-west-1'];
  
  for (let i = 0; i < days * 24; i++) {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - i);
    
    const randomResourceIndex = Math.floor(Math.random() * resourceTypes.length);
    const randomRegionIndex = Math.floor(Math.random() * regions.length);
    
    // Ensure we have valid indices and fallback values
    const resourceType = resourceTypes[randomResourceIndex] || 'other';
    const region = regions[randomRegionIndex] || 'us-east-1';
    
    data.push({
      id: `energy-${i}`,
      userId: 'user-123',
      timestamp,
      resourceType,
      resourceId: `resource-${i}`,
      resourceName: `Resource ${i}`,
      region,
      energyConsumed: Math.random() * 10 + 1, // 1-11 kWh
      carbonEmissions: Math.random() * 5 + 0.5, // 0.5-5.5 kg CO2
      cost: Math.random() * 50 + 5, // $5-55
      currency: 'USD',
      cpuUtilization: Math.random() * 100,
      memoryUtilization: Math.random() * 100,
      networkIn: Math.random() * 1000000,
      networkOut: Math.random() * 1000000,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }
  
  return data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// GET /api/energy/usage - Get energy usage data with optional filtering
router.get('/usage', (req: Request, res: Response) => {
  try {
    const {
      startDate,
      endDate,
      resourceType,
      region,
      limit = '100'
    } = req.query;

    let data = generateMockEnergyData();

    // Apply filters
    if (startDate) {
      const start = new Date(startDate as string);
      data = data.filter(item => item.timestamp >= start);
    }

    if (endDate) {
      const end = new Date(endDate as string);
      data = data.filter(item => item.timestamp <= end);
    }

    if (resourceType) {
      data = data.filter(item => item.resourceType === resourceType);
    }

    if (region) {
      data = data.filter(item => item.region === region);
    }

    // Apply limit
    data = data.slice(0, parseInt(limit as string));

    return res.json({
      success: true,
      data: {
        usage: data,
        total: data.length,
        summary: {
          totalEnergyConsumed: data.reduce((sum, item) => sum + item.energyConsumed, 0),
          totalCost: data.reduce((sum, item) => sum + item.cost, 0),
          totalCarbonEmissions: data.reduce((sum, item) => sum + item.carbonEmissions, 0),
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Error fetching energy usage: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

// GET /api/energy/aggregated - Get aggregated energy data for charts
router.get('/aggregated', (req: Request, res: Response) => {
  try {
    const {
      period = 'day',
      startDate,
      endDate,
      groupBy = 'resourceType'
    } = req.query;

    const data = generateMockEnergyData();
    
    // Group data by period and resource type
    const aggregated: Record<string, any> = {};
    
    data.forEach(item => {
      const date = new Date(item.timestamp);
      let key: string;
      
      switch (period) {
        case 'hour':
          key = date.toISOString().slice(0, 13) + ':00:00.000Z';
          break;
        case 'day':
          key = date.toISOString().slice(0, 10);
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10);
          break;
        case 'month':
          key = date.toISOString().slice(0, 7);
          break;
        default:
          key = date.toISOString().slice(0, 10);
      }

      if (!aggregated[key]) {
        aggregated[key] = {
          period: key,
          totalEnergyConsumed: 0,
          totalCost: 0,
          totalCarbonEmissions: 0,
          resourceBreakdown: {} as Record<string, any>
        };
      }

      aggregated[key].totalEnergyConsumed += item.energyConsumed;
      aggregated[key].totalCost += item.cost;
      aggregated[key].totalCarbonEmissions += item.carbonEmissions;

      if (!aggregated[key].resourceBreakdown[item.resourceType]) {
        aggregated[key].resourceBreakdown[item.resourceType] = {
          resourceType: item.resourceType,
          energyConsumed: 0,
          cost: 0,
          carbonEmissions: 0
        };
      }

      aggregated[key].resourceBreakdown[item.resourceType].energyConsumed += item.energyConsumed;
      aggregated[key].resourceBreakdown[item.resourceType].cost += item.cost;
      aggregated[key].resourceBreakdown[item.resourceType].carbonEmissions += item.carbonEmissions;
    });

    // Convert to array and sort by period
    const result = Object.values(aggregated).map((item: any) => ({
      ...item,
      resourceBreakdown: Object.values(item.resourceBreakdown)
    })).sort((a: any, b: any) => a.period.localeCompare(b.period));

    return res.json({
      success: true,
      data: {
        aggregated: result,
        period: period as string,
        total: result.length
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Error fetching aggregated data: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

// GET /api/energy/metrics - Get efficiency metrics and recommendations
router.get('/metrics', (req: Request, res: Response) => {
  try {
    const data = generateMockEnergyData(7); // Last 7 days
    
    const totalEnergy = data.reduce((sum, item) => sum + item.energyConsumed, 0);
    const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
    const avgCpuUtilization = data.reduce((sum, item) => sum + (item.cpuUtilization || 0), 0) / data.length;
    
    // Calculate efficiency score (simplified)
    const efficiencyScore = Math.max(0, Math.min(100, 100 - (avgCpuUtilization > 80 ? 20 : 0) - (totalCost > 1000 ? 15 : 0)));

    const metrics: EnergyEfficiencyMetrics = {
      efficiencyScore,
      recommendations: [
        {
          type: 'cost',
          priority: 'high',
          title: 'Right-size EC2 instances',
          description: 'Several EC2 instances are running with low CPU utilization. Consider downsizing to save costs.',
          potentialSavings: {
            cost: 150,
            energy: 25,
            carbon: 12
          }
        },
        {
          type: 'energy',
          priority: 'medium',
          title: 'Enable auto-scaling',
          description: 'Implement auto-scaling to automatically adjust resources based on demand.',
          potentialSavings: {
            cost: 80,
            energy: 15,
            carbon: 8
          }
        }
      ],
      trends: {
        period: 'last_7_days',
        energyTrend: totalEnergy > 500 ? 'increasing' : 'stable',
        costTrend: totalCost > 2000 ? 'increasing' : 'decreasing',
        efficiencyTrend: efficiencyScore > 70 ? 'improving' : 'stable'
      }
    };

    return res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Error fetching metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

// GET /api/energy/dashboard - Get dashboard summary data
router.get('/dashboard', (req: Request, res: Response) => {
  try {
    const data = generateMockEnergyData(30);
    const last7Days = data.filter(item => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return item.timestamp >= weekAgo;
    });

    const summary = {
      totalEnergyConsumed: data.reduce((sum, item) => sum + item.energyConsumed, 0),
      totalCost: data.reduce((sum, item) => sum + item.cost, 0),
      totalCarbonEmissions: data.reduce((sum, item) => sum + item.carbonEmissions, 0),
      last7DaysEnergy: last7Days.reduce((sum, item) => sum + item.energyConsumed, 0),
      last7DaysCost: last7Days.reduce((sum, item) => sum + item.cost, 0),
      activeResources: new Set(data.map(item => item.resourceId)).size,
      topResourceTypes: Object.entries(
        data.reduce((acc, item) => {
          acc[item.resourceType] = (acc[item.resourceType] || 0) + item.cost;
          return acc;
        }, {} as Record<string, number>)
      ).sort(([,a], [,b]) => b - a).slice(0, 5)
    };

    return res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Error fetching dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

export default router;
