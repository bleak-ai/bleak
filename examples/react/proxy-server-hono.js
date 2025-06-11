import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { HTTPException } from 'hono/http-exception';
import { serve } from '@hono/node-server';

const app = new Hono();

// Environment variables
const BLEAK_API_KEY = process.env.BLEAK_API_KEY || 'aa';
const BLEAK_BACKEND_URL = process.env.BLEAK_BACKEND_URL || 'http://localhost:8008';
const PORT = process.env.PORT || 8009;

// Middleware
app.use('*', logger());

// CORS configuration
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://yourdomain.com'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-OpenAI-API-Key'],
}));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    message: 'BleakAI Proxy Server is running',
    backend: BLEAK_BACKEND_URL
  });
});

// Proxy all /bleak/* requests to the backend
app.all('/bleak/*', async (c) => {
  try {
    // Extract the path after /bleak
    const path = c.req.path.replace('/bleak', '/bleak');
    const url = `${BLEAK_BACKEND_URL}${path}`;

    console.log('url', url);

    // Get request body if it exists
    let body = null;
    if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
      try {
        body = await c.req.json();
      } catch (e) {
        // Not JSON, try text
        try {
          body = await c.req.text();
        } catch (e) {
          // No body or invalid body
          body = null;
        }
      }
    }

    // Prepare headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    // Add API key if available
    if (BLEAK_API_KEY) {
      // headers.set('X-OpenAI-API-Key', BLEAK_API_KEY);
    }

    // Copy relevant headers from the original request
    const authHeader = c.req.header('Authorization');
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }

    // Forward the request to the backend
    const response = await fetch(url, {
      method: c.req.method,
      headers: headers,
      body: body ? JSON.stringify(body) : null,
    });

    // Handle error responses
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;

      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Backend request failed' };
      }

      console.error(`Proxy error: ${response.status} - ${errorText}`);

      return c.json(errorData, response.status);
    }

    // Forward successful response
    const responseData = await response.json();
    return c.json(responseData);

  } catch (error) {
    console.error('Proxy error:', error.message);

    // Handle network errors, timeouts, etc.
    return c.json(
      {
        error: 'Internal proxy error',
        message: error.message
      },
      500
    );
  }
});

// Catch-all for other routes
app.all('*', (c) => {
  return c.json({
    error: 'Not found',
    message: 'This proxy only handles /bleak/* routes'
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Hono error:', err);

  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  return c.json(
    {
      error: 'Internal server error',
      message: err.message
    },
    500
  );
});

// Start the server
console.log(`🚀 BleakAI Proxy Server starting on port ${PORT}`);
console.log(`📡 Proxying requests to: ${BLEAK_BACKEND_URL}`);
console.log(`🔑 API Key configured: ${BLEAK_API_KEY ? 'Yes' : 'No'}`);

serve({
  fetch: app.fetch,
  port: PORT,
}, (info) => {
  console.log(`✅ Server is running on http://localhost:${info.port}`);
}); 