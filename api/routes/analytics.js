const express = require('express');
const router = express.Router();
const analyticsMockDatabase = require('../data/analytics');

// POST /analytics/track - Track an analytics event
router.post('/track', (req, res) => {
  console.log('-> analytics/track', req.body);
  const { apiKey, event } = req.body;
  
  if (!apiKey || !event) {
    return res.status(400).json({
      error: 'API key and event are required',
      message: 'Please provide both apiKey and event in the request body'
    });
  }
  
  // Validate event structure
  const requiredFields = ['experimentId', 'variationId', 'eventType', 'timestamp'];
  const missingFields = requiredFields.filter(field => !event[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Invalid event structure',
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }
  
  // Initialize the API key's analytics array if it doesn't exist
  if (!analyticsMockDatabase[apiKey]) {
    analyticsMockDatabase[apiKey] = [];
  }
  
  // Generate a unique ID for the event
  const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create the analytics event with additional metadata
  const analyticsEvent = {
    id: eventId,
    ...event,
    receivedAt: Date.now(),
    userAgent: req.get('User-Agent') || '',
    ip: req.ip || req.connection.remoteAddress || '',
    url: event.url || ''
  };
  
  // Store the event
  analyticsMockDatabase[apiKey].push(analyticsEvent);
  
  console.log(`[API] Tracked ${event.eventType} event for experiment ${event.experimentId} (API key: ${apiKey})`);
  
  res.json({
    success: true,
    eventId,
    message: 'Event tracked successfully'
  });
});

// GET /analytics - Get analytics events by API key
router.get('/', (req, res) => {
  const apiKey = req.query.apiKey;
  const experimentId = req.query.experimentId;
  const eventType = req.query.eventType;
  const limit = parseInt(req.query.limit) || 100;
  
  if (!apiKey) {
    return res.status(400).json({
      error: 'API key is required',
      message: 'Please provide an apiKey query parameter'
    });
  }
  
  let events = analyticsMockDatabase[apiKey] || [];
  
  // Filter by experiment ID if provided
  if (experimentId) {
    events = events.filter(event => event.experimentId === experimentId);
  }
  
  // Filter by event type if provided
  if (eventType) {
    events = events.filter(event => event.eventType === eventType);
  }
  
  // Sort by timestamp (newest first) and limit results
  events = events
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
  
  console.log(`[API] Fetching analytics for API key: ${apiKey} (${events.length} events)`);
  
  res.json({
    apiKey,
    events,
    count: events.length,
    filters: {
      experimentId: experimentId || null,
      eventType: eventType || null,
      limit
    }
  });
});

// GET /analytics/summary - Get analytics summary by API key
router.get('/summary', (req, res) => {
  const apiKey = req.query.apiKey;
  
  if (!apiKey) {
    return res.status(400).json({
      error: 'API key is required',
      message: 'Please provide an apiKey query parameter'
    });
  }
  
  const events = analyticsMockDatabase[apiKey] || [];
  
  // Calculate summary statistics
  const summary = {
    totalEvents: events.length,
    eventTypes: {},
    experiments: {},
    variations: {},
    timeRange: {
      earliest: null,
      latest: null
    }
  };
  
  events.forEach(event => {
    // Count event types
    summary.eventTypes[event.eventType] = (summary.eventTypes[event.eventType] || 0) + 1;
    
    // Count experiments
    if (!summary.experiments[event.experimentId]) {
      summary.experiments[event.experimentId] = {
        views: 0,
        conversions: 0,
        variations: {}
      };
    }
    summary.experiments[event.experimentId][event.eventType === 'view' ? 'views' : 'conversions']++;
    
    // Count variations per experiment
    if (!summary.experiments[event.experimentId].variations[event.variationId]) {
      summary.experiments[event.experimentId].variations[event.variationId] = {
        views: 0,
        conversions: 0
      };
    }
    summary.experiments[event.experimentId].variations[event.variationId][event.eventType === 'view' ? 'views' : 'conversions']++;
    
    // Track time range
    if (!summary.timeRange.earliest || event.timestamp < summary.timeRange.earliest) {
      summary.timeRange.earliest = event.timestamp;
    }
    if (!summary.timeRange.latest || event.timestamp > summary.timeRange.latest) {
      summary.timeRange.latest = event.timestamp;
    }
  });
  
  console.log(`[API] Analytics summary for API key: ${apiKey} (${events.length} total events)`);
  
  res.json({
    apiKey,
    summary
  });
});

module.exports = router;
