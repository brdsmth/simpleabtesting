import express from 'express';
import { pool } from '../config/database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all project routes
router.use(verifyToken);

// GET all projects for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const includeArchived = req.query.includeArchived === 'true';

    // Get user's API key for SDK usage
    const userResult = await pool.query('SELECT api_key FROM users WHERE id = $1', [userId]);
    const apiKey = userResult.rows[0].api_key;

    const archivedFilter = includeArchived ? 'archived = TRUE' : 'archived = FALSE';

    const result = await pool.query(
      `SELECT project_id, name, url, description, settings, archived, created_at, updated_at 
       FROM projects 
       WHERE api_key = $1 AND ${archivedFilter}
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
    const userId = req.user.userId;

    // Get user's API key
    const userResult = await pool.query('SELECT api_key FROM users WHERE id = $1', [userId]);
    const apiKey = userResult.rows[0].api_key;

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
    const { project } = req.body;
    const userId = req.user.userId;

    if (!project) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Project object is required'
      });
    }

    const { project_id, name, url, description, settings } = project;

    if (!project_id || !name) {
      return res.status(400).json({ 
        error: 'Invalid project data',
        message: 'project_id and name are required'
      });
    }

    // Get user's API key for SDK usage
    const userResult = await pool.query('SELECT api_key FROM users WHERE id = $1', [userId]);
    const apiKey = userResult.rows[0].api_key;

    // Upsert the project
    const result = await pool.query(
      `INSERT INTO projects (api_key, user_id, project_id, name, url, description, settings, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
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
        userId,
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

// POST - Unarchive a project
router.post('/:projectId/unarchive', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    // Get user's API key
    const userResult = await pool.query('SELECT api_key FROM users WHERE id = $1', [userId]);
    const apiKey = userResult.rows[0].api_key;

    // Check if project exists and is archived
    const checkResult = await pool.query(
      'SELECT * FROM projects WHERE api_key = $1 AND project_id = $2 AND archived = TRUE',
      [apiKey, projectId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: `No archived project found with ID: ${projectId}`
      });
    }

    // Unarchive the project
    await pool.query(
      'UPDATE projects SET archived = FALSE, updated_at = CURRENT_TIMESTAMP WHERE api_key = $1 AND project_id = $2',
      [apiKey, projectId]
    );

    res.json({
      success: true,
      message: 'Project restored successfully. Note: Experiments remain archived and must be restored individually.'
    });
  } catch (error) {
    console.error('Error restoring project:', error);
    res.status(500).json({ 
      error: 'Failed to restore project',
      message: error.message 
    });
  }
});

// DELETE a project (soft delete - archive)
router.delete('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    // Get user's API key
    const userResult = await pool.query('SELECT api_key FROM users WHERE id = $1', [userId]);
    const apiKey = userResult.rows[0].api_key;

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
