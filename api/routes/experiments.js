import express from 'express';
const router = express.Router();
import experimentsMockDatabase from '../data/experiments.js';

// GET /experiments - Fetch experiments by API key
router.get('/', (req, res) => {
  const apiKey = req.query.apiKey;
  
  if (!apiKey) {
    return res.status(400).json({
      error: 'API key is required',
      message: 'Please provide an apiKey query parameter'
    });
  }
  
  const experiments = experimentsMockDatabase[apiKey] || [];
  
  console.log(`[API] Fetching experiments for API key: ${apiKey}`);
  console.log(`[API] Found ${experiments.length} experiments`);
  
  res.json({
    apiKey,
    experiments,
    count: experiments.length
  });
});

// POST /experiments - Save a created experiment to the mock database
router.post('/', (req, res) => {
  const { apiKey, experiment } = req.body;
  
  if (!apiKey || !experiment) {
    return res.status(400).json({
      error: 'API key and experiment are required'
    });
  }
  
  // Initialize the API key's experiments array if it doesn't exist
  if (!experimentsMockDatabase[apiKey]) {
    experimentsMockDatabase[apiKey] = [];
  }
  
  // Check if experiment with this ID already exists
  const existingIndex = experimentsMockDatabase[apiKey].findIndex(exp => exp.id === experiment.id);
  
  if (existingIndex !== -1) {
    // Update existing experiment
    experimentsMockDatabase[apiKey][existingIndex] = experiment;
    console.log(`[API] Updated experiment ${experiment.id} for API key: ${apiKey}`);
  } else {
    // Add new experiment
    experimentsMockDatabase[apiKey].push(experiment);
    console.log(`[API] Added new experiment ${experiment.id} for API key: ${apiKey}`);
  }
  
  res.json({
    success: true,
    apiKey,
    experiment,
    message: existingIndex !== -1 ? 'Experiment updated successfully' : 'Experiment created successfully'
  });
});

export default router;
