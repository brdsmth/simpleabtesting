import express from 'express';
const router = express.Router();

// GET /sdk.js - Redirect to CDN (SDK is served from CloudFront in production)
router.get('/sdk.js', (req, res) => {
  // In production, redirect to the CloudFront CDN (custom domain or default)
  // SDK_CDN_URL can be set to override (e.g., https://sdk.simpleabtesting.com/simple-ab-testing.umd.js)
  const sdkUrl = process.env.SDK_CDN_URL || 'https://sdk.simpleabtesting.com/simple-ab-testing.umd.js';
  res.redirect(302, sdkUrl);
});

export default router;
