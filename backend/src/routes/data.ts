import express, { Request, Response } from 'express';
import { mockClassSchedules, mockRateData, mockAHUSystems, mockAHUSchedules } from '../data/mockData';
import { ApiResponse, ClassSchedule, EnergyUsage, RateData, AHUSystem, AHUSchedule } from '../types';
import { CSVService } from '../services/csvService';

const router = express.Router();
const csvService = CSVService.getInstance();

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

// GET /api/data/ahu-systems - Get all AHU systems
router.get('/ahu-systems', (req: Request, res: Response) => {
  try {
    const { building } = req.query;
    
    let filteredData = mockAHUSystems;
    
    // Filter by building if specified
    if (building && typeof building === 'string') {
      filteredData = mockAHUSystems.filter(ahu => ahu.buildingNumber === building);
    }
    
    const response: ApiResponse<AHUSystem[]> = {
      success: true,
      data: filteredData,
      message: `AHU systems retrieved successfully${building ? ` for building ${building}` : ''}`,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      data: [],
      message: `Error retrieving AHU systems: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/data/ahu-schedule - Get Air-Handler Unit Optimization
router.get('/ahu-schedule', (req: Request, res: Response) => {
  try {
    const { building, system } = req.query;
    
    let filteredData = mockAHUSchedules;
    
    // Filter by building if specified
    if (building && typeof building === 'string') {
      filteredData = filteredData.filter(schedule => schedule.buildingNumber === building);
    }
    
    // Filter by system if specified
    if (system && typeof system === 'string') {
      filteredData = filteredData.filter(schedule => schedule.systemName === system);
    }
    
    const response: ApiResponse<AHUSchedule[]> = {
      success: true,
      data: filteredData,
      message: `AHU schedule retrieved successfully${building ? ` for building ${building}` : ''}${system ? ` system ${system}` : ''}`,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      data: [],
      message: `Error retrieving AHU schedule: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/data/energy-usage - Get energy usage data
router.get('/energy-usage', async (req: Request, res: Response) => {
  try {
    const { building, timeframe, reload } = req.query;
    
    // Get data from CSV service
    const allEnergyData = await csvService.getEnergyData(reload === 'true');
    let filteredData = allEnergyData;
    
    // Filter by building if specified
    if (building && typeof building === 'string') {
      filteredData = allEnergyData.filter(usage => usage.buildingNumber === building);
    }
    
    // Filter by timeframe if specified
    if (timeframe && typeof timeframe === 'string') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (timeframe) {
        case 'today':
          // Filter for today's data
          filteredData = filteredData.filter(usage => {
            const usageDate = new Date(usage.dateTime);
            return usageDate >= today && usageDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          });
          break;
        case 'week':
          // Filter for last 7 days
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filteredData = filteredData.filter(usage => {
            const usageDate = new Date(usage.dateTime);
            return usageDate >= weekAgo;
          });
          break;
        case 'month':
          // Filter for last 30 days
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filteredData = filteredData.filter(usage => {
            const usageDate = new Date(usage.dateTime);
            return usageDate >= monthAgo;
          });
          break;
      }
    }
    
    const response: ApiResponse<EnergyUsage[]> = {
      success: true,
      data: filteredData,
      message: `Energy usage data retrieved successfully${building ? ` for building ${building}` : ''}${timeframe ? ` (${timeframe})` : ''} - ${filteredData.length} records`,
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

// GET /api/data/savings - Get energy savings comparison with previous year
router.get('/savings', async (req: Request, res: Response) => {
  try {
    const { building, timeframe } = req.query;
    
    const validTimeframes = ['day', 'week', 'month'];
    const selectedTimeframe = (typeof timeframe === 'string' && validTimeframes.includes(timeframe)) 
      ? timeframe as 'day' | 'week' | 'month' 
      : 'day';
    
    const savingsData = await csvService.getSavingsComparison(
      building as string | undefined, 
      selectedTimeframe
    );
    
    const response: ApiResponse<typeof savingsData> = {
      success: true,
      data: savingsData,
      message: `Savings comparison retrieved successfully${building ? ` for building ${building}` : ''} (${selectedTimeframe})`,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: `Error retrieving savings data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/data/csv-info - Get CSV file information
router.get('/csv-info', async (req: Request, res: Response) => {
  try {
    const summary = await csvService.getDataSummary();
    
    const response: ApiResponse<typeof summary> = {
      success: true,
      data: summary,
      message: 'CSV file information retrieved successfully',
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: `Error retrieving CSV info: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/data/csv-path - Set custom CSV file path
router.post('/csv-path', (req: Request, res: Response) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'File path is required and must be a string',
        timestamp: new Date().toISOString()
      });
    }
    
    csvService.setCsvFilePath(filePath);
    
    return res.json({
      success: true,
      message: `CSV file path updated to: ${filePath}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error setting CSV path: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/data/summary - Get summary of all data
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const energyData = await csvService.getEnergyData();
    const csvSummary = await csvService.getDataSummary();
    
    const summary = {
      classSchedules: {
        count: mockClassSchedules.length,
        buildings: [...new Set(mockClassSchedules.map(cs => cs.buildingNumber))],
        dates: [...new Set(mockClassSchedules.map(cs => cs.date))]
      },
      ahuSystems: {
        count: mockAHUSystems.length,
        buildings: [...new Set(mockAHUSystems.map(ahu => ahu.buildingNumber))],
        systemsPerBuilding: mockAHUSystems.reduce((acc, ahu) => {
          acc[ahu.buildingNumber] = (acc[ahu.buildingNumber] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      energyUsage: {
        count: energyData.length,
        buildings: csvSummary.buildings,
        totalEnergyKwh: energyData.reduce((sum, usage) => sum + usage.energyUsedKwh, 0),
        averageEnergyKwh: csvSummary.avgUsage,
        dateRange: csvSummary.dateRange,
        dataSource: energyData.length > 0 ? 'CSV File' : 'Mock Data'
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
