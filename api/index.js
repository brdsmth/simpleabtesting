const express = require('express');
const cors = require('cors');

// Import routers
const experimentsRouter = require('./routes/experiments');
const demoRouter = require('./routes/demo');
const sdkRouter = require('./routes/sdk');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/experiments', experimentsRouter);
app.use('/demo', demoRouter);
app.use('/', sdkRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to the Simple A/B Testing API",
    version: "1.0.0",
    endpoints: {
      experiments: {
        "GET /experiments?apiKey={key}": "Fetch experiments by API key",
        "POST /experiments": "Save/update an experiment"
      },
      demo: {
        "POST /demo/store-experiment": "Store temporary experiment for demo"
      },
      sdk: {
        "GET /sdk.js": "Download the SDK JavaScript file"
      }
    }
  });
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
  console.log(`Available endpoints:`);
  console.log(`  - GET  /experiments?apiKey={key}`);
  console.log(`  - POST /experiments`);
  console.log(`  - POST /demo/store-experiment`);
  console.log(`  - GET  /sdk.js`);
});
