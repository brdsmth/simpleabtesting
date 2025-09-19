const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.get('/sdk.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'sdk', 'dist', 'simple-ab-testing.umd.js'));
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
