import { Router, Request, Response } from 'express';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';

const router = Router();

// Interface for AHU optimization request
interface AHUOptimizationRequest {
  csvPath?: string;
  date?: string;
}

// Interface for AHU optimization response
interface AHUOptimizationResponse {
  success: boolean;
  date?: string;
  ahu_optimization_data?: Array<{
    ahu_unit: string;
    on_hours: number;
    off_hours: number;
    energy_consumed_kwh: number;
    energy_saved_kwh: number;
    cost_saved_usd: number;
    efficiency_percentage: number;
    classes_served: number;
    hourly_schedule: Array<{
      hour: string;
      active: boolean;
      reason: string;
    }>;
  }>;
  summary?: {
    total_ahu_units: number;
    total_energy_saved_kwh: number;
    total_cost_saved_usd: number;
    average_efficiency_percentage: number;
    total_classes_processed: number;
  };
  csv_file?: string;
  error?: string;
}

// GET /api/ahu-optimization/:date - Get AHU optimization data for bar graphs
router.get('/:date', async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params;
    const csvPath = req.query.csvPath as string;

    // Validate date parameter exists
    if (!date) {
      res.status(400).json({
        success: false,
        error: 'Date parameter is required'
      });
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
      return;
    }

    // Default to local schedule_augmented.csv file
    const defaultCsvPath = '/Users/carlos_1/Documents/schedule_augmented.csv';
    const finalCsvPath: string = csvPath || defaultCsvPath;

    // Validate CSV file exists
    if (!fs.existsSync(finalCsvPath)) {
      res.status(400).json({
        success: false,
        error: `CSV file not found: ${finalCsvPath}`
      });
      return;
    }

    console.log(`Generating AHU optimization data for date: ${date} from CSV: ${finalCsvPath}`);

    // Call Python algorithm
    const optimizationResult = await callPythonAHUOptimizer({
      csvPath: finalCsvPath,
      date: date
    });

    res.json(optimizationResult);

  } catch (error) {
    console.error('Error generating AHU optimization data:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while generating AHU optimization data'
    });
  }
});

// POST /api/ahu-optimization/generate - Generate AHU optimization data with custom parameters
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      csvPath,
      date = new Date().toISOString().split('T')[0]
    }: AHUOptimizationRequest = req.body;

    // Default to local schedule_augmented.csv file
    const defaultCsvPath = '/Users/carlos_1/Documents/schedule_augmented.csv';
    const finalCsvPath: string = csvPath || defaultCsvPath;

    // Validate CSV file exists
    if (!fs.existsSync(finalCsvPath)) {
      res.status(400).json({
        success: false,
        error: `CSV file not found: ${finalCsvPath}`
      });
      return;
    }

    console.log(`Generating AHU optimization data from CSV: ${finalCsvPath} for date: ${date}`);

    // Call Python algorithm
    const optimizationResult = await callPythonAHUOptimizer({
      csvPath: finalCsvPath,
      date: date as string
    });

    if (!optimizationResult.success) {
      res.status(500).json({
        success: false,
        error: optimizationResult.error || 'Failed to generate AHU optimization data'
      });
      return;
    }

    res.json(optimizationResult);

  } catch (error) {
    console.error('Error generating AHU optimization data:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while generating AHU optimization data'
    });
  }
});

// GET /api/ahu-optimization/summary/:date - Get summary data for dashboard
router.get('/summary/:date', async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params;

    // Validate date parameter
    if (!date) {
      res.status(400).json({
        success: false,
        error: 'Date parameter is required'
      });
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
      return;
    }

    // Get full optimization data
    const defaultCsvPath = '/Users/carlos_1/Documents/schedule_augmented.csv';
    const optimizationResult = await callPythonAHUOptimizer({
      csvPath: defaultCsvPath,
      date: date
    });

    if (!optimizationResult.success) {
      res.status(500).json({
        success: false,
        error: optimizationResult.error || 'Failed to generate summary data'
      });
      return;
    }

    // Return only summary data
    res.json({
      success: true,
      date: date,
      summary: optimizationResult.summary
    });

  } catch (error) {
    console.error('Error generating AHU optimization summary:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while generating summary data'
    });
  }
});

// Function to call Python AHU optimization algorithm
async function callPythonAHUOptimizer(params: { csvPath: string; date: string }): Promise<AHUOptimizationResponse> {
  return new Promise((resolve) => {
    // Path to Python script
    const pythonScriptPath = path.join(__dirname, '../../python/ahu_optimization_generator.py');
    
    // Prepare arguments for Python script
    const args = [
      pythonScriptPath,
      '--csv-path', params.csvPath,
      '--date', params.date,
      '--output-format', 'json'
    ];

    console.log('Calling Python AHU optimization algorithm with args:', args);

    // Spawn Python process
    const pythonProcess: ChildProcess = spawn('python3', args);
    
    let outputData = '';
    let errorData = '';

    // Collect stdout data
    pythonProcess.stdout?.on('data', (data: Buffer) => {
      outputData += data.toString();
    });

    // Collect stderr data
    pythonProcess.stderr?.on('data', (data: Buffer) => {
      errorData += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code: number | null) => {
      if (code === 0) {
        try {
          // Parse JSON response from Python script
          const result = JSON.parse(outputData);
          resolve(result);
        } catch (parseError) {
          console.error('Error parsing Python output:', parseError);
          console.error('Raw output:', outputData);
          resolve({
            success: false,
            error: 'Failed to parse optimization algorithm response'
          });
        }
      } else {
        console.error('Python script error:', errorData);
        resolve({
          success: false,
          error: `Optimization algorithm failed with code ${code}: ${errorData}`
        });
      }
    });

    // Handle process errors
    pythonProcess.on('error', (error: Error) => {
      console.error('Failed to start Python process:', error);
      resolve({
        success: false,
        error: 'Failed to start AHU optimization algorithm'
      });
    });

    // Set timeout for long-running processes
    setTimeout(() => {
      pythonProcess.kill();
      resolve({
        success: false,
        error: 'Algorithm timeout - process took too long'
      });
    }, 30000); // 30 second timeout
  });
}

export default router;
