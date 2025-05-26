# Bleak Monorepo Setup Guide

## ✅ Completed Setup

Your project has been successfully restructured into a monorepo with both frontend and backend components.

## 🏗️ Current Structure

```
bleak/
├── package.json              # Root package.json with monorepo scripts
├── package-lock.json         # Root dependencies (concurrently)
├── node_modules/            # Root dependencies
├── .gitignore               # Updated for both frontend and backend
├── README.md                # Updated monorepo documentation
├── SETUP.md                 # This file
├── frontend/                # React + Vite frontend
│   ├── src/                # All your existing React code
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.ts      # Vite configuration
│   ├── node_modules/       # Frontend dependencies
│   └── ...                 # All other frontend files
└── backend/                 # Python FastAPI backend
    ├── src/backend/        # Backend source code
    │   ├── __init__.py
    │   ├── main.py         # FastAPI app with CORS
    │   └── graph.py        # LangGraph implementation
    ├── pyproject.toml      # Python dependencies
    ├── uv.lock            # Dependency lock file
    ├── .venv/             # Python virtual environment
    └── README.md          # Backend documentation
```

## 🚀 Quick Start Commands

### Install All Dependencies

```bash
npm run install:all
```

### Development Mode (Both services)

```bash
npm run dev
```

This starts both frontend (http://localhost:5173) and backend (http://localhost:8000)

### Individual Services

#### Frontend Only

```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

#### Backend Only

```bash
npm run dev:backend
# or
cd backend && uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

## 🔗 API Integration

The backend provides:

- **Health Check**: `GET http://localhost:8000/health`
- **Chat Endpoint**: `POST http://localhost:8000/chat`
  - Request: `{"message": "Hello", "conversation_id": "optional"}`
  - Response: `{"response": "AI response", "conversation_id": "id"}`
- **API Docs**: `http://localhost:8000/docs`

The frontend is configured to make requests to `http://localhost:8000`

## 🛠️ Backend Features

- ✅ FastAPI with async support
- ✅ CORS configured for frontend
- ✅ LangGraph integration for conversation flows
- ✅ Pydantic models for request/response validation
- ✅ Health check endpoint
- ✅ Comprehensive error handling
- ✅ Logging configuration

## 🔧 Next Steps

1. **Add your LangGraph logic** in `backend/src/backend/graph.py`
2. **Configure environment variables** (OPENAI_API_KEY, etc.)
3. **Update frontend API calls** to use the new backend
4. **Customize the conversation flow** in the graph
5. **Add authentication** if needed
6. **Deploy** using your preferred platform

## 📚 Available Scripts

From the root directory:

- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build both projects
- `npm run install:all` - Install all dependencies
- `npm run start` - Start both in production mode

## 🧪 Testing the Setup

1. Start both services: `npm run dev`
2. Check frontend: http://localhost:5173
3. Check backend health: http://localhost:8000/health
4. Check API docs: http://localhost:8000/docs
5. Test chat endpoint with curl:
   ```bash
   curl -X POST "http://localhost:8000/chat" \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello, world!"}'
   ```

## 🎯 Your Code Integration

To integrate your existing LangGraph code:

1. Replace the placeholder logic in `backend/src/backend/graph.py`
2. Update the `process_message` function with your AI logic
3. Add any additional dependencies to `backend/pyproject.toml`
4. Run `uv sync` to install new dependencies

The current setup provides a working foundation that you can build upon!
