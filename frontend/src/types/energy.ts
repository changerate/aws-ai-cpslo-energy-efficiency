export interface EnergyUsage {
  id: string;
  userId: string;
  timestamp: Date;
  resourceType: 'ec2' | 'rds' | 'lambda' | 's3' | 'cloudfront' | 'other';
  resourceId: string;
  resourceName?: string;
  region: string;
  
  // Energy metrics
  energyConsumed: number; // kWh
  carbonEmissions: number; // kg CO2
  
  // Cost metrics
  cost: number; // USD
  currency: string;
  
  // Performance metrics
  cpuUtilization?: number; // percentage
  memoryUtilization?: number; // percentage
  networkIn?: number; // bytes
  networkOut?: number; // bytes
  
  // Metadata
  tags?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnergyUsageAggregated {
  period: string;
  totalEnergyConsumed: number;
  totalCarbonEmissions: number;
  totalCost: number;
  resourceBreakdown: {
    resourceType: string;
    energyConsumed: number;
    cost: number;
    carbonEmissions: number;
  }[];
}

export interface DashboardSummary {
  totalEnergyConsumed: number;
  totalCost: number;
  totalCarbonEmissions: number;
  last7DaysEnergy: number;
  last7DaysCost: number;
  activeResources: number;
  topResourceTypes: [string, number][];
}

export interface EnergyEfficiencyMetrics {
  efficiencyScore: number;
  recommendations: {
    type: 'cost' | 'energy' | 'performance';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    potentialSavings: {
      cost: number;
      energy: number;
      carbon: number;
    };
  }[];
  trends: {
    period: string;
    energyTrend: 'increasing' | 'decreasing' | 'stable';
    costTrend: 'increasing' | 'decreasing' | 'stable';
    efficiencyTrend: 'improving' | 'declining' | 'stable';
  };
}
