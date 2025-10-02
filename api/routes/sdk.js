import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const router = express.Router();

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /sdk.js - Serve the SDK JavaScript file
router.get('/sdk.js', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'sdk', 'dist', 'simple-ab-testing.umd.js'));
});

export default router;
