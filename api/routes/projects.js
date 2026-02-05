import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

// GET all projects for an API key
router.get('/', async (req, res) => {
  try {
    const { apiKey } = req.query;

    if (!apiKey) {
      return res.status(400).json({ 
        error: 'API key is required',
        message: 'Please provide an apiKey query parameter'
      });
    }

    const result = await pool.query(
      `SELECT project_id, name, url, description, settings, created_at, updated_at 
       FROM projects 
       WHERE api_key = $1 AND archived = FALSE
       ORDER BY created_at DESC`,
      [apiKey]
    );

    res.json({
      success: true,
      projects: result.rows
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      error: 'Failed to fetch projects',
      message: error.message 
    });
  }
});

// GET single project by ID
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { apiKey } = req.query;

    if (!apiKey) {
      return res.status(400).json({ 
        error: 'API key is required',
        message: 'Please provide an apiKey query parameter'
      });
    }

    const result = await pool.query(
      `SELECT project_id, name, url, description, settings, created_at, updated_at 
       FROM projects 
       WHERE api_key = $1 AND project_id = $2 AND archived = FALSE`,
      [apiKey, projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: `No project found with ID: ${projectId}`
      });
    }

    res.json({
      success: true,
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      error: 'Failed to fetch project',
      message: error.message 
    });
  }
});

// POST - Create or update a project
router.post('/', async (req, res) => {
  try {
    const { apiKey, project } = req.body;

    if (!apiKey || !project) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Both apiKey and project object are required'
      });
    }

    const { project_id, name, url, description, settings } = project;

    if (!project_id || !name) {
      return res.status(400).json({ 
        error: 'Invalid project data',
        message: 'project_id and name are required'
      });
    }

    // Upsert the project
    const result = await pool.query(
      `INSERT INTO projects (api_key, project_id, name, url, description, settings, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       ON CONFLICT (api_key, project_id) 
       DO UPDATE SET 
         name = EXCLUDED.name,
         url = EXCLUDED.url,
         description = EXCLUDED.description,
         settings = EXCLUDED.settings,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        apiKey,
        project_id,
        name,
        url || null,
        description || null,
        settings ? JSON.stringify(settings) : '{}'
      ]
    );

    res.json({
      success: true,
      message: 'Project saved successfully',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Error saving project:', error);
    res.status(500).json({ 
      error: 'Failed to save project',
      message: error.message 
    });
  }
});

// DELETE a project (soft delete - archive)
router.delete('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { apiKey } = req.query;

    if (!apiKey) {
      return res.status(400).json({ 
        error: 'API key is required',
        message: 'Please provide an apiKey query parameter'
      });
    }

    // Check if project exists and is not already archived
    const checkResult = await pool.query(
      'SELECT * FROM projects WHERE api_key = $1 AND project_id = $2 AND archived = FALSE',
      [apiKey, projectId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: `No project found with ID: ${projectId}`
      });
    }

    // Get count of experiments that will be archived
    const experimentsResult = await pool.query(
      'SELECT COUNT(*) as count FROM experiments WHERE api_key = $1 AND project_id = $2 AND archived = FALSE',
      [apiKey, projectId]
    );

    const experimentCount = parseInt(experimentsResult.rows[0].count);

    // Archive the project
    await pool.query(
      'UPDATE projects SET archived = TRUE, updated_at = CURRENT_TIMESTAMP WHERE api_key = $1 AND project_id = $2',
      [apiKey, projectId]
    );

    // Archive all experiments in this project
    await pool.query(
      'UPDATE experiments SET archived = TRUE, updated_at = CURRENT_TIMESTAMP WHERE api_key = $1 AND project_id = $2',
      [apiKey, projectId]
    );

    res.json({
      success: true,
      message: experimentCount > 0 
        ? `Project archived successfully along with ${experimentCount} experiment(s)`
        : 'Project archived successfully',
      archivedExperimentCount: experimentCount
    });
  } catch (error) {
    console.error('Error archiving project:', error);
    res.status(500).json({ 
      error: 'Failed to archive project',
      message: error.message 
    });
  }
});

export default router;

