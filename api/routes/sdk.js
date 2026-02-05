import express from 'express';
const router = express.Router();

// GET /sdk.js - Redirect to CDN (SDK is served from CloudFront in production)
router.get('/sdk.js', (req, res) => {
  // In Lambda, redirect to the CloudFront CDN
  // For local dev, this could serve from local filesystem
  const sdkUrl = process.env.SDK_CDN_URL || 'https://d58p1yx7p03gj.cloudfront.net/simple-ab-testing.umd.js';
  res.redirect(302, sdkUrl);
});

export default router;
