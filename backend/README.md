# Bleak Backend

FastAPI backend with LangGraph integration for the Bleak application.

## Features

- FastAPI web framework
- LangGraph for conversation flow management
- CORS support for frontend integration
- Async support for better performance
- Modular graph-based conversation handling

## Installation

This project uses [uv](https://docs.astral.sh/uv/) for dependency management.

1. Install dependencies:

```bash
uv sync
```

## Running the Application

### Development Mode (with auto-reload)

```bash
uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Production Mode

```bash
uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, you can access:

- Interactive API docs: `http://localhost:8000/docs`
- Alternative API docs: `http://localhost:8000/redoc`

## API Endpoints

### Health Check

- `GET /health` - Returns server health status

### Chat

- `POST /chat` - Process chat messages through LangGraph
  - Request body: `{"message": "your message", "conversation_id": "optional"}`
  - Response: `{"response": "ai response", "conversation_id": "conversation_id"}`

## Project Structure

```
src/backend/
├── __init__.py
├── main.py          # FastAPI application and routes
└── graph.py         # LangGraph implementation
```

## Environment Variables

You may want to set these environment variables:

- `OPENAI_API_KEY` - If using OpenAI models
- `LANGCHAIN_API_KEY` - For LangSmith tracing (optional)

## Development

The LangGraph implementation in `graph.py` currently provides a simple echo response. You can extend this with:

- OpenAI integration
- Custom AI models
- Complex conversation flows
- Memory/persistence layers
- Tool calling capabilities

## Frontend Integration

The backend is configured to accept CORS requests from:

- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (React dev server)

Update the CORS origins in `main.py` if your frontend runs on different ports.
