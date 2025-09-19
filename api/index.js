const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.get('/sdk.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'sdk', 'dist', 'simple-ab-testing.umd.js'));
});

app.get('/', (req, res) => {
  res.send("Welcome to the Simple A/B Testing API");
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
