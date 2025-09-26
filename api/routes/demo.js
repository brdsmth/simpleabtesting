const express = require('express');
const router = express.Router();
const experimentsMockDatabase = require('../data/experiments');

// POST /demo/store-experiment - Store temporary experiment for demo purposes
router.post('/store-experiment', (req, res) => {
  const { apiKey, experiment } = req.body;
  
  if (!apiKey || !experiment) {
    return res.status(400).json({
      error: 'API key and experiment are required'
    });
  }
  
  // Store the experiment with the temporary API key
  experimentsMockDatabase[apiKey] = [experiment];
  
  console.log(`[API] Stored demo experiment for API key: ${apiKey}`);
  console.log(`[API] Experiment: ${experiment.name}`);
  
  res.json({
    success: true,
    apiKey,
    message: 'Experiment stored successfully'
  });
});

module.exports = router;
