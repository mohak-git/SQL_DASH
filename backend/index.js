const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Load configuration
let config;
try {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'backend-config.json'), 'utf8'));
} catch (error) {
  console.warn('Could not load backend config, using defaults.');
  config = { port: 3001, host: '0.0.0.0' }; // Default host to 0.0.0.0
}

const app = express();
const port = config.port || 3001;
const host = config.host || '0.0.0.0'; // Use configured host or default

app.use(cors());
app.use(express.json());

app.get('/api/status', (req, res) => {
  // Disable caching for this route
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  // Send the current status
  res.json({ status: `Backend server is running on port ${port}` });
});

app.listen(port, host, () => {
  console.log(`Backend server running at http://${host}:${port}`);
}); 