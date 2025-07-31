import fs from 'fs';
import path from 'path';
import os from 'os';
import csv from 'csv-parser';
import { EnergyUsage } from '../types';

interface CSVEnergyRow {
  'Timestamp': string;
  ' Total Electric Usage (C)': string;
  [key: string]: string; // Allow for other columns
}

export class CSVService {
  private static instance: CSVService;
  private energyData: EnergyUsage[] = [];
  private lastModified: Date | null = null;
  private csvFilePath: string;

  private constructor() {
    // Updated to use the new historical data file
    this.csvFilePath = path.join(os.homedir(), 'Documents', 'cl-combinedHistoricalData.csv');
  }

  public static getInstance(): CSVService {
    if (!CSVService.instance) {
      CSVService.instance = new CSVService();
    }
    return CSVService.instance;
  }

  public setCsvFilePath(filePath: string): void {
    this.csvFilePath = filePath;
    this.lastModified = null; // Force reload on next access
  }

  public async getEnergyData(forceReload: boolean = false): Promise<EnergyUsage[]> {
    try {
      // Check if file exists
      if (!fs.existsSync(this.csvFilePath)) {
        console.log(`CSV file not found at: ${this.csvFilePath}`);
        console.log('Falling back to mock data');
        return this.getFallbackData();
      }

      // Check if we need to reload the data
      const stats = fs.statSync(this.csvFilePath);
      const fileModified = stats.mtime;

      if (!forceReload && this.lastModified && fileModified <= this.lastModified && this.energyData.length > 0) {
        console.log('Using cached CSV data');
        return this.energyData;
      }

      console.log(`Loading energy data from: ${this.csvFilePath}`);
      this.energyData = await this.loadCSVData();
      this.lastModified = fileModified;

      return this.energyData;
    } catch (error) {
      console.error('Error loading CSV data:', error);
      console.log('Falling back to mock data');
      return this.getFallbackData();
    }
  }

  private async loadCSVData(): Promise<EnergyUsage[]> {
    return new Promise((resolve, reject) => {
      const results: EnergyUsage[] = [];
      let id = 1;

      fs.createReadStream(this.csvFilePath)
        .pipe(csv())
        .on('data', (row: CSVEnergyRow) => {
          try {
            const timestamp = row['Timestamp']?.trim();
            const energyUsageStr = row[' Total Electric Usage (C)']?.trim();

            if (!timestamp || !energyUsageStr) {
              console.warn('Skipping row with missing data:', row);
              return;
            }

            // Parse the timestamp
            const dateTime = new Date(timestamp);
            if (isNaN(dateTime.getTime())) {
              console.warn('Invalid timestamp:', timestamp);
              return;
            }

            // Parse the energy usage
            const energyUsage = parseFloat(energyUsageStr);
            if (isNaN(energyUsage)) {
              console.warn('Invalid energy usage value:', energyUsageStr);
              return;
            }

            // For now, we'll assign all data to building '14' since we don't have building info in CSV
            // You can modify this logic based on your CSV structure
            results.push({
              id: id++,
              dateTime: dateTime.toISOString(),
              buildingNumber: '14', // Default building
              energyUsedKwh: Math.round(energyUsage * 100) / 100 // Round to 2 decimal places
            });
          } catch (error) {
            console.warn('Error parsing CSV row:', error, row);
          }
        })
        .on('end', () => {
          console.log(`Loaded ${results.length} energy records from CSV`);
          
          // Sort by timestamp
          results.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
          
          resolve(results);
        })
        .on('error', (error) => {
          console.error('CSV parsing error:', error);
          reject(error);
        });
    });
  }

  private getFallbackData(): EnergyUsage[] {
    // Return mock data as fallback
    console.log('Using fallback mock data');
    return this.generateMockEnergyUsage();
  }

  private generateMockEnergyUsage(): EnergyUsage[] {
    const data: EnergyUsage[] = [];
    const baseDate = new Date('2025-08-01T00:00:00');
    const buildings = ['14', '26', '52'];
    
    let id = 1;
    
    // Generate data for each building for a full day (96 intervals of 15 minutes)
    buildings.forEach(building => {
      const baseUsage = building === '14' ? 35 : building === '26' ? 28 : 42;
      
      for (let i = 0; i < 96; i++) { // 24 hours * 4 (15-minute intervals per hour)
        const dateTime = new Date(baseDate.getTime() + (i * 15 * 60 * 1000)); // 15-minute intervals
        const hour = dateTime.getHours();
        
        // Create realistic usage patterns based on time of day
        let timeMultiplier = 1;
        if (hour >= 6 && hour <= 8) timeMultiplier = 1.3; // Morning peak
        else if (hour >= 9 && hour <= 17) timeMultiplier = 1.5; // Business hours
        else if (hour >= 18 && hour <= 20) timeMultiplier = 1.2; // Evening
        else if (hour >= 21 || hour <= 5) timeMultiplier = 0.6; // Night/early morning
        
        const variation = (Math.random() - 0.5) * 8; // ±4 kWh variation
        const usage = baseUsage * timeMultiplier + variation;
        
        data.push({
          id: id++,
          dateTime: dateTime.toISOString(),
          buildingNumber: building,
          energyUsedKwh: Math.round(Math.max(usage, 5) * 100) / 100 // Minimum 5 kWh, round to 2 decimal places
        });
      }
    });
    
    return data.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }

  public async getAvailableBuildings(): Promise<string[]> {
    const data = await this.getEnergyData();
    return [...new Set(data.map(record => record.buildingNumber))];
  }

  public async getDataSummary(): Promise<{
    totalRecords: number;
    dateRange: { start: string; end: string };
    buildings: string[];
    avgUsage: number;
  }> {
    const data = await this.getEnergyData();
    
    if (data.length === 0) {
      return {
        totalRecords: 0,
        dateRange: { start: '', end: '' },
        buildings: [],
        avgUsage: 0
      };
    }

    const sortedData = data.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    const totalUsage = data.reduce((sum, record) => sum + record.energyUsedKwh, 0);

    return {
      totalRecords: data.length,
      dateRange: {
        start: sortedData[0]?.dateTime || '',
        end: sortedData[sortedData.length - 1]?.dateTime || ''
      },
      buildings: [...new Set(data.map(record => record.buildingNumber))],
      avgUsage: totalUsage / data.length
    };
  }

  public async getSavingsComparison(
    building?: string, 
    timeframe: 'day' | 'week' | 'month' = 'day'
  ): Promise<{
    currentPeriod: {
      usage: number;
      period: string;
      dataPoints: number;
    };
    previousYear: {
      usage: number;
      period: string;
      dataPoints: number;
    };
    savings: {
      absolute: number; // kWh saved
      percentage: number; // % saved
      cost: number; // $ saved (assuming $0.12/kWh)
    };
    comparison: 'better' | 'worse' | 'same';
  }> {
    const allData = await this.getEnergyData();
    let filteredData = building ? allData.filter(d => d.buildingNumber === building) : allData;
    
    if (filteredData.length === 0) {
      return this.getEmptySavingsComparison();
    }

    // Find the most recent date in the data
    const sortedData = filteredData.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    
    if (sortedData.length === 0 || !sortedData[0]) {
      return this.getEmptySavingsComparison();
    }
    
    const mostRecentDate = new Date(sortedData[0].dateTime);
    
    // Calculate current period and previous year period
    const { currentPeriodData, previousYearData } = this.getPeriodData(filteredData, mostRecentDate, timeframe);
    
    const currentUsage = currentPeriodData.reduce((sum, d) => sum + d.energyUsedKwh, 0);
    const previousUsage = previousYearData.reduce((sum, d) => sum + d.energyUsedKwh, 0);
    
    const absoluteSavings = previousUsage - currentUsage;
    const percentageSavings = previousUsage > 0 ? (absoluteSavings / previousUsage) * 100 : 0;
    const costSavings = absoluteSavings * 0.12; // Assuming $0.12/kWh
    
    let comparison: 'better' | 'worse' | 'same' = 'same';
    if (absoluteSavings > 0) comparison = 'better';
    else if (absoluteSavings < 0) comparison = 'worse';

    return {
      currentPeriod: {
        usage: Math.round(currentUsage * 100) / 100,
        period: this.formatPeriodLabel(mostRecentDate, timeframe),
        dataPoints: currentPeriodData.length
      },
      previousYear: {
        usage: Math.round(previousUsage * 100) / 100,
        period: this.formatPeriodLabel(new Date(mostRecentDate.getFullYear() - 1, mostRecentDate.getMonth(), mostRecentDate.getDate()), timeframe),
        dataPoints: previousYearData.length
      },
      savings: {
        absolute: Math.round(absoluteSavings * 100) / 100,
        percentage: Math.round(percentageSavings * 100) / 100,
        cost: Math.round(costSavings * 100) / 100
      },
      comparison
    };
  }

  private getPeriodData(data: EnergyUsage[], referenceDate: Date, timeframe: 'day' | 'week' | 'month') {
    const currentYear = referenceDate.getFullYear();
    const previousYear = currentYear - 1;
    
    let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;
    
    switch (timeframe) {
      case 'day':
        currentStart = new Date(currentYear, referenceDate.getMonth(), referenceDate.getDate());
        currentEnd = new Date(currentStart.getTime() + 24 * 60 * 60 * 1000);
        previousStart = new Date(previousYear, referenceDate.getMonth(), referenceDate.getDate());
        previousEnd = new Date(previousStart.getTime() + 24 * 60 * 60 * 1000);
        break;
        
      case 'week':
        // Get the start of the week (Sunday)
        const dayOfWeek = referenceDate.getDay();
        currentStart = new Date(currentYear, referenceDate.getMonth(), referenceDate.getDate() - dayOfWeek);
        currentEnd = new Date(currentStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        previousStart = new Date(previousYear, referenceDate.getMonth(), referenceDate.getDate() - dayOfWeek);
        previousEnd = new Date(previousStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
        
      case 'month':
        currentStart = new Date(currentYear, referenceDate.getMonth(), 1);
        currentEnd = new Date(currentYear, referenceDate.getMonth() + 1, 1);
        previousStart = new Date(previousYear, referenceDate.getMonth(), 1);
        previousEnd = new Date(previousYear, referenceDate.getMonth() + 1, 1);
        break;
    }
    
    const currentPeriodData = data.filter(d => {
      const date = new Date(d.dateTime);
      return date >= currentStart && date < currentEnd;
    });
    
    const previousYearData = data.filter(d => {
      const date = new Date(d.dateTime);
      return date >= previousStart && date < previousEnd;
    });
    
    return { currentPeriodData, previousYearData };
  }

  private formatPeriodLabel(date: Date, timeframe: 'day' | 'week' | 'month'): string {
    switch (timeframe) {
      case 'day':
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'month':
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
      default:
        return date.toLocaleDateString();
    }
  }

  private getEmptySavingsComparison() {
    return {
      currentPeriod: { usage: 0, period: '', dataPoints: 0 },
      previousYear: { usage: 0, period: '', dataPoints: 0 },
      savings: { absolute: 0, percentage: 0, cost: 0 },
      comparison: 'same' as const
    };
  }
}
