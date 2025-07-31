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
    // Default to user's Documents folder
    this.csvFilePath = path.join(os.homedir(), 'Documents', 'energy_data.csv');
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
}
