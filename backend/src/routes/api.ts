import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// GET /api/time - Returns current time
router.get('/time', (req: Request, res: Response) => {
  const currentTime = new Date();
  
  res.json({
    success: true,
    data: {
      timestamp: currentTime.toISOString(),
      formatted: currentTime.toLocaleString(),
      unix: currentTime.getTime(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  });
});

// GET /api/hello - Simple hello world endpoint
router.get('/hello', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Hello from the backend!',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/files - List files in a directory
router.get('/files', (req: Request, res: Response) => {
  try {
    const dirPath = req.query.path as string || process.cwd();
    
    // Security check - only allow relative paths within project
    const safePath = path.resolve(process.cwd(), dirPath);
    if (!safePath.startsWith(process.cwd())) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Path outside project directory'
      });
    }

    const files = fs.readdirSync(safePath);
    const fileList = files.map(file => {
      const filePath = path.join(safePath, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: path.relative(process.cwd(), filePath),
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modified: stats.mtime.toISOString(),
      };
    });

    return res.json({
      success: true,
      data: {
        currentPath: path.relative(process.cwd(), safePath),
        files: fileList
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Error reading directory: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

// GET /api/file-content - Read content of a specific file
router.get('/file-content', (req: Request, res: Response) => {
  try {
    const filePath = req.query.path as string;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }

    // Security check - only allow relative paths within project
    const safePath = path.resolve(process.cwd(), filePath);
    if (!safePath.startsWith(process.cwd())) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Path outside project directory'
      });
    }

    if (!fs.existsSync(safePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    const stats = fs.statSync(safePath);
    if (stats.isDirectory()) {
      return res.status(400).json({
        success: false,
        error: 'Path is a directory, not a file'
      });
    }

    const content = fs.readFileSync(safePath, 'utf-8');
    
    return res.json({
      success: true,
      data: {
        path: path.relative(process.cwd(), safePath),
        content: content,
        size: stats.size,
        modified: stats.mtime.toISOString(),
        lines: content.split('\n').length
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

export default router;
