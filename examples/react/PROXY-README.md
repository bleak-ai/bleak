# BleakAI Hono Proxy Server

A lightweight Hono-based proxy server that securely handles BleakAI API requests by adding the OpenAI API key server-side.

## Why Use a Proxy?

- **Security**: Keeps your OpenAI API key secure on the backend
- **CORS**: Handles CORS issues between frontend and backend
- **Rate Limiting**: Can add rate limiting and authentication
- **Error Handling**: Provides consistent error responses

## Architecture

```
Frontend (React) → Hono Proxy (Port 8009) → BleakAI Backend (Port 8008) → OpenAI API
```

## Setup

### 1. Install Dependencies

In the `bleak/examples/react` directory:

```bash
# Install Hono and Node.js server adapter
npm install hono @hono/node-server
```

### 2. Environment Configuration

Create a `.env` file in the `bleak/examples/react` directory:

```bash
cp proxy.env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
BLEAK_API_KEY=sk-your-openai-api-key-here
BLEAK_BACKEND_URL=http://localhost:8008
PORT=8009
```

### 3. Start the Services

#### Option A: Start Everything Together

```bash
# Terminal 1: Start the BleakAI backend
cd bleak-backend
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8008

# Terminal 2: Start the Hono proxy
cd bleak/examples/react
node proxy-server-hono.js

# Terminal 3: Start the React frontend
cd bleak/examples/react
npm run dev
```

#### Option B: Use Package Scripts

You can also add scripts to your main `package.json`:

```json
{
  "scripts": {
    "proxy": "node proxy-server-hono.js",
    "proxy:dev": "node --watch proxy-server-hono.js"
  }
}
```

Then run:

```bash
npm run proxy:dev
```

## Usage

Once all services are running:

- **Frontend**: http://localhost:5173 (or 3000)
- **Proxy**: http://localhost:8009
- **Backend**: http://localhost:8008

The React app will automatically send requests to the proxy, which forwards them to the backend with proper authentication.

## API Endpoints

The proxy forwards all `/bleak/*` requests to the backend:

- `POST /bleak/chat` - Main chat endpoint
- `GET /health` - Proxy health check

## Environment Variables

| Variable            | Default                 | Description               |
| ------------------- | ----------------------- | ------------------------- |
| `BLEAK_API_KEY`     | -                       | OpenAI API key (required) |
| `BLEAK_BACKEND_URL` | `http://localhost:8008` | BleakAI backend URL       |
| `PORT`              | `8009`                  | Proxy server port         |

## Error Handling

The proxy handles various error conditions:

- **Network errors**: Returns 500 with error message
- **Backend errors**: Forwards the exact error from backend
- **Missing API key**: Logs warning but continues (backend will handle)
- **Invalid JSON**: Gracefully handles malformed requests

## Security Features

- **API Key Protection**: OpenAI API key never exposed to frontend
- **CORS Configuration**: Allows requests from approved domains
- **Error Sanitization**: Prevents sensitive information leakage
- **Request Logging**: Logs requests for debugging

## Development

For development with auto-reload:

```bash
node --watch proxy-server-hono.js
```

## Production Deployment

For production, consider:

1. **Environment Variables**: Use secure environment variable management
2. **HTTPS**: Run behind a reverse proxy with SSL
3. **Rate Limiting**: Add rate limiting middleware
4. **Authentication**: Add user authentication if needed
5. **Monitoring**: Add request monitoring and logging

Example with additional security:

```bash
# Production environment
BLEAK_API_KEY=your-production-key
BLEAK_BACKEND_URL=https://your-backend.com
PORT=8009
NODE_ENV=production
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check that your frontend URL is in the CORS origins list
2. **Connection Refused**: Ensure the backend is running on port 8008
3. **API Key Errors**: Verify your OpenAI API key is correctly set
4. **Port Conflicts**: Change the PORT environment variable if 8009 is in use

### Debug Mode

Enable debug logging:

```bash
DEBUG=* node proxy-server-hono.js
```

### Health Checks

Check if services are running:

```bash
# Check proxy
curl http://localhost:8009/health

# Check backend
curl http://localhost:8008/health
```
