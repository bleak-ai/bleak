// Example Node.js/Express proxy server
// This runs on your backend and keeps the API key secure
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Enable CORS for your frontend domain
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}));

app.use(express.json());

// Store API key securely on server
const BLEAK_API_KEY = process.env.BLEAK_API_KEY; // From environment variable
const BLEAK_BASE_URL = process.env.BLEAK_BASE_URL || 'https://api.bleak.ai';

// Create axios client for Bleak API
const bleakClient = axios.create({
  baseURL: BLEAK_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Proxy endpoint for Bleak chat requests
app.post('/api/bleak/chat', async (req, res) => {
  try {
    // Add authentication/authorization here if needed
    // e.g., verify user session, check permissions, etc.

    const response = await bleakClient.post('/chat', req.body, {
      headers: {
        'Authorization': `Bearer ${BLEAK_API_KEY}` // API key added server-side
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);

    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data?.detail || 'API request failed'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
});

// Add rate limiting per user/IP
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/bleak', limiter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Bleak proxy server running on port ${PORT}`);
}); 