import express from 'express';
import { pool } from '../config/database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all experiment routes
router.use(verifyToken);

// GET /experiments - Fetch experiments for authenticated user (and optionally by project_id)
router.get('/', async (req, res) => {
  const projectId = req.query.projectId;
  const userId = req.user.userId;
  
  try {
    // Get user's API key
    const userResult = await pool.query('SELECT api_key FROM users WHERE id = $1', [userId]);
    const apiKey = userResult.rows[0].api_key;

    let query = 'SELECT * FROM experiments WHERE api_key = $1 AND archived = FALSE';
    const params = [apiKey];
    
    if (projectId) {
      query += ' AND project_id = $2';
      params.push(projectId);
      console.log(`[API] Fetching experiments for Project ID: ${projectId}`);
    } else {
      console.log(`[API] Fetching all experiments for user ${userId}`);
    }
    
    const result = await pool.query(query, params);
    const experiments = result.rows.map(row => ({
      id: row.experiment_id,
      name: row.name,
      description: row.description,
      status: row.status,
      trafficAllocation: row.traffic_allocation?.allocation || 100,
      variations: row.variants || [],
      project_id: row.project_id
    }));
    
    console.log(`[API] Found ${experiments.length} experiments`);
    
    res.json({
      projectId: projectId || null,
      experiments,
      count: experiments.length
    });
  } catch (error) {
    console.error('[API] Error fetching experiments:', error);
    res.status(500).json({
      error: 'Failed to fetch experiments',
      message: error.message
    });
  }
});

// POST /experiments - Save a created experiment to the database
router.post('/', async (req, res) => {
  const { experiment } = req.body;
  const userId = req.user.userId;
  
  if (!experiment) {
    return res.status(400).json({
      error: 'Experiment is required'
    });
  }
  
  try {
    // Get user's API key
    const userResult = await pool.query('SELECT api_key FROM users WHERE id = $1', [userId]);
    const apiKey = userResult.rows[0].api_key;

    // Check if experiment exists
    const checkQuery = 'SELECT id FROM experiments WHERE api_key = $1 AND experiment_id = $2';
    const checkResult = await pool.query(checkQuery, [apiKey, experiment.id]);
    
    if (checkResult.rows.length > 0) {
      // Update existing experiment
      const updateQuery = `
        UPDATE experiments 
        SET name = $1, description = $2, variants = $3, traffic_allocation = $4, status = $5, project_id = $6, updated_at = CURRENT_TIMESTAMP
        WHERE api_key = $7 AND experiment_id = $8
        RETURNING *
      `;
      await pool.query(updateQuery, [
        experiment.name,
        experiment.description || null,
        JSON.stringify(experiment.variations),
        JSON.stringify({ allocation: experiment.trafficAllocation || 100 }),
        experiment.status || 'paused',
        experiment.project_id || null,
        apiKey,
        experiment.id
      ]);
      console.log(`[API] Updated experiment ${experiment.id}`);
    } else {
      // Insert new experiment
      const insertQuery = `
        INSERT INTO experiments (api_key, user_id, experiment_id, name, description, variants, traffic_allocation, status, project_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      await pool.query(insertQuery, [
        apiKey,
        userId,
        experiment.id,
        experiment.name,
        experiment.description || null,
        JSON.stringify(experiment.variations),
        JSON.stringify({ allocation: experiment.trafficAllocation || 100 }),
        experiment.status || 'paused',
        experiment.project_id || null
      ]);
      console.log(`[API] Added new experiment ${experiment.id}`);
    }
    
    res.json({
      success: true,
      experiment,
      message: checkResult.rows.length > 0 ? 'Experiment updated successfully' : 'Experiment created successfully'
    });
  } catch (error) {
    console.error('[API] Error saving experiment:', error);
    res.status(500).json({
      error: 'Failed to save experiment',
      message: error.message
    });
  }
});

export default router;
