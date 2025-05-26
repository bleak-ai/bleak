from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import logging

# Import your graph (we'll create this next)
from .graph import create_graph

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Bleak Backend API",
    description="FastAPI backend with LangGraph integration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

# Initialize the graph
graph = create_graph()

@app.get("/")
async def root():
    return {"message": "Bleak Backend API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint that processes messages through the LangGraph
    """
    try:
        logger.info(f"Processing chat request: {request.message}")
        
        # Prepare input for the graph
        graph_input = {
            "message": request.message,
            "conversation_id": request.conversation_id or "default"
        }
        
        # Execute the graph
        result = await graph.ainvoke(graph_input)
        
        # Extract response from graph result
        response_text = result.get("response", "I'm sorry, I couldn't process your request.")
        conversation_id = result.get("conversation_id", request.conversation_id or "default")
        
        return ChatResponse(
            response=response_text,
            conversation_id=conversation_id
        )
        
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True) 