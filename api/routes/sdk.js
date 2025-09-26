const express = require('express');
const path = require('path');
const router = express.Router();

// GET /sdk.js - Serve the SDK JavaScript file
router.get('/sdk.js', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'sdk', 'dist', 'simple-ab-testing.umd.js'));
});

module.exports = router;
