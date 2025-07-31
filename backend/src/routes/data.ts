import express, { Request, Response } from 'express';
import { mockClassSchedules, mockEnergyUsage, mockRateData, mockHVACSystems, mockHVACSchedules } from '../data/mockData';
import { ApiResponse, ClassSchedule, EnergyUsage, RateData, HVACSystem, HVACSchedule } from '../types';

const router = express.Router();

// GET /api/data/class-schedules - Get all class schedules
router.get('/class-schedules', (req: Request, res: Response) => {
  try {
    const response: ApiResponse<ClassSchedule[]> = {
      success: true,
      data: mockClassSchedules,
      message: 'Class schedules retrieved successfully',
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      data: [],
      message: `Error retrieving class schedules: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/data/hvac-systems - Get all HVAC systems
router.get('/hvac-systems', (req: Request, res: Response) => {
  try {
    const { building } = req.query;
    
    let filteredData = mockHVACSystems;
    
    // Filter by building if specified
    if (building && typeof building === 'string') {
      filteredData = mockHVACSystems.filter(hvac => hvac.buildingNumber === building);
    }
    
    const response: ApiResponse<HVACSystem[]> = {
      success: true,
      data: filteredData,
      message: `HVAC systems retrieved successfully${building ? ` for building ${building}` : ''}`,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      data: [],
      message: `Error retrieving HVAC systems: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/data/hvac-schedule - Get HVAC maintenance schedule
router.get('/hvac-schedule', (req: Request, res: Response) => {
  try {
    const { building, system } = req.query;
    
    let filteredData = mockHVACSchedules;
    
    // Filter by building if specified
    if (building && typeof building === 'string') {
      filteredData = filteredData.filter(schedule => schedule.buildingNumber === building);
    }
    
    // Filter by system if specified
    if (system && typeof system === 'string') {
      filteredData = filteredData.filter(schedule => schedule.systemName === system);
    }
    
    const response: ApiResponse<HVACSchedule[]> = {
      success: true,
      data: filteredData,
      message: `HVAC schedule retrieved successfully${building ? ` for building ${building}` : ''}${system ? ` system ${system}` : ''}`,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      data: [],
      message: `Error retrieving HVAC schedule: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/data/energy-usage - Get energy usage data
router.get('/energy-usage', (req: Request, res: Response) => {
  try {
    const { building, timeframe } = req.query;
    
    let filteredData = mockEnergyUsage;
    
    // Filter by building if specified
    if (building && typeof building === 'string') {
      filteredData = filteredData.filter(usage => usage.buildingNumber === building);
    }
    
    // Filter by timeframe if specified
    if (timeframe && typeof timeframe === 'string') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (timeframe) {
        case 'today':
          // Return data from today (already filtered by default mock data)
          break;
        case 'week':
          // For demo purposes, return the same data but we could filter for last 7 days
          break;
        case 'month':
          // For demo purposes, return the same data but we could filter for last 30 days
          break;
      }
    }
    
    const response: ApiResponse<EnergyUsage[]> = {
      success: true,
      data: filteredData,
      message: `Energy usage data retrieved successfully${building ? ` for building ${building}` : ''}${timeframe ? ` (${timeframe})` : ''}`,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      data: [],
      message: `Error retrieving energy usage data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/data/rates - Get rate data
router.get('/rates', (req: Request, res: Response) => {
  try {
    const response: ApiResponse<RateData[]> = {
      success: true,
      data: mockRateData,
      message: 'Rate data retrieved successfully',
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      data: [],
      message: `Error retrieving rate data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/data/summary - Get summary of all data
router.get('/summary', (req: Request, res: Response) => {
  try {
    const summary = {
      classSchedules: {
        count: mockClassSchedules.length,
        buildings: [...new Set(mockClassSchedules.map(cs => cs.buildingNumber))],
        dates: [...new Set(mockClassSchedules.map(cs => cs.date))]
      },
      hvacSystems: {
        count: mockHVACSystems.length,
        buildings: [...new Set(mockHVACSystems.map(hvac => hvac.buildingNumber))],
        systemsPerBuilding: mockHVACSystems.reduce((acc, hvac) => {
          acc[hvac.buildingNumber] = (acc[hvac.buildingNumber] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      energyUsage: {
        count: mockEnergyUsage.length,
        buildings: [...new Set(mockEnergyUsage.map(eu => eu.buildingNumber))],
        totalEnergyKwh: mockEnergyUsage.reduce((sum, usage) => sum + usage.energyUsedKwh, 0),
        averageEnergyKwh: mockEnergyUsage.reduce((sum, usage) => sum + usage.energyUsedKwh, 0) / mockEnergyUsage.length
      },
      rates: {
        count: mockRateData.length,
        tiers: mockRateData.map(rate => rate.rateTier),
        priceRange: {
          min: Math.min(...mockRateData.map(rate => rate.pricePerKwh)),
          max: Math.max(...mockRateData.map(rate => rate.pricePerKwh))
        }
      }
    };
    
    const response: ApiResponse<typeof summary> = {
      success: true,
      data: summary,
      message: 'Data summary retrieved successfully',
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: `Error retrieving data summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
