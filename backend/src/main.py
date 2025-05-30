from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging
import asyncio
import time
import uuid
import traceback
from langchain_core.runnables.config import RunnableConfig
from langgraph.types import Command

# Import bleak interactive functions
from routes.bleak_routes import bleak_router

# Import chatbot graph


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Bleak Backend API",
    description="FastAPI backend with LangGraph integration",
    version="1.0.0"
)

app.include_router(bleak_router)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
async def root():
    return {"message": "Bleak Backend API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/debug")
async def debug_info():
    """
    Development endpoint for debugging information.
    """
    return {
        "status": "ok",
        "message": "Bleak Backend API is running",
        "available_endpoints": [
            "/",
            "/health",
            "/chat",
            "/chat/{conversation_id}/history",
            "/chat/resume-from-checkpoint",
            "/chat/edit-message",
            "/bleak/interactive",
            "/bleak/interactive/resume",
            "/debug"
        ]
    }

