import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * Utility function to run Python script and return results
 * 
 * @param {string[]} args - Arguments to pass to the Python script
 * @returns {Promise<object>} - JSON result from Python script
 */
function runPythonScript(args = []) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../scripts/devpost_api_bridge.py');
    
    // Run Python script - use 'python3' on Linux/Mac, 'python' on Windows
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    const pythonProcess = spawn(pythonCommand, [scriptPath, ...args]);
    
    let dataString = '';
    let errorString = '';

    // Collect data from script
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    // Collect error messages
    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
      console.error(`Python stderr: ${data}`);
    });

    // Handle process exit
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        return reject(new Error(`Python script error: ${errorString || 'Unknown error'}`));
      }
      
      try {
        // Parse JSON output
        const result = JSON.parse(dataString);
        resolve(result);
      } catch (error) {
        console.error('Failed to parse Python script output:', error);
        reject(new Error('Invalid output from Python script'));
      }
    });
  });
}

/**
 * GET /api/devpost/hackathons
 * Get hackathon listings from Devpost
 */
router.get('/hackathons', async (req, res) => {
  try {
    // Parse query parameters
    const limit = parseInt(req.query.limit) || 20;
    const active = req.query.active === 'true';
    const upcoming = req.query.upcoming === 'true';
    
    // Build arguments list
    const args = [
      '--limit', limit.toString()
    ];
    
    if (active) {
      args.push('--active');
    } else if (upcoming) {
      args.push('--upcoming');
    }
    
    // Run Python scraper
    const result = await runPythonScript(args);
    
    // Return results
    res.json(result);
  } catch (error) {
    console.error('Error fetching hackathons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hackathon data',
      error: error.message
    });
  }
});

/**
 * GET /api/devpost/hackathons/active
 * Get active hackathon listings from Devpost
 */
router.get('/hackathons/active', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const result = await runPythonScript(['--limit', limit.toString(), '--active']);
    res.json(result);
  } catch (error) {
    console.error('Error fetching active hackathons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active hackathon data',
      error: error.message
    });
  }
});

/**
 * GET /api/devpost/hackathons/upcoming
 * Get upcoming hackathon listings from Devpost
 */
router.get('/hackathons/upcoming', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const result = await runPythonScript(['--limit', limit.toString(), '--upcoming']);
    res.json(result);
  } catch (error) {
    console.error('Error fetching upcoming hackathons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming hackathon data',
      error: error.message
    });
  }
});

export default router;
