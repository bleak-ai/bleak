from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging
import asyncio
import time
import uuid
import traceback

# Import your graph (we'll create this next)
from .graph import create_graph
# Import bleak interactive functions
from .bleak_interactive.graph.runner import run_interactive_graph, resume_interactive_graph

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
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8008, reload=True) 


class BleakInput(BaseModel):
    prompt: str

# Add new models for the enhanced bleak workflow
class BleakQuestionsInput(BaseModel):
    prompt: str

class AnsweredQuestion(BaseModel):
    question: str
    answer: str

class BleakAnswerInput(BaseModel):
    prompt: str  # Original prompt
    answered_questions: List[AnsweredQuestion]

# Add new models for the interactive workflow
class InteractiveInput(BaseModel):
    prompt: str
    thread_id: Optional[str] = None

class InteractiveResumeInput(BaseModel):
    thread_id: str
    answered_questions: List[AnsweredQuestion]


@app.post("/bleak/interactive")
async def bleak_interactive_endpoint(payload: InteractiveInput, request: Request):
    """
    Start an interactive bleak conversation with human-in-the-loop.
    This will return questions for the user to answer, along with a thread_id for resuming.
    """
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    try:
        logger.info(f"Received request to /bleak/interactive with prompt: {payload.prompt}")
        
        # Use provided thread_id or generate a new one
        thread_id = payload.thread_id or str(uuid.uuid4())
        
        # Process the request using the interactive graph
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, 
            run_interactive_graph, 
            {"prompt": payload.prompt}, 
            thread_id
        )
        
        duration_ms = (time.time() - start_time) * 1000
        
        if isinstance(result, dict) and "error" in result:
            error_msg = str(result.get("error", "Unknown error"))
            logger.warning(f"Interactive graph execution completed with error: {error_msg}")
            return {
                "result": result,
                "status": "error",
                "message": error_msg
            }
        
        logger.info(f"Successfully processed /bleak/interactive request in {duration_ms:.2f}ms")
        
        # Check if the graph was interrupted (waiting for human input)
        # In that case, we should return the questions and thread_id
        return {
            "thread_id": thread_id,
            "status": "interrupted",
            "questions": result.get("structured_questions", []),
            "message": "Please answer the questions and use the resume endpoint to continue."
        }
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        error_details = str(e)
        logger.error(f"Error processing /bleak/interactive request: {error_details}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing request: {error_details}")


@app.post("/bleak/interactive/resume")
async def bleak_interactive_resume_endpoint(payload: InteractiveResumeInput, request: Request):
    """
    Resume an interrupted interactive bleak conversation with user answers.
    This will complete the workflow and return the final answer with rating.
    """
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    try:
        logger.info(f"Received request to /bleak/interactive/resume for thread: {payload.thread_id}")
        
        # Resume the interactive graph with user answers
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            resume_interactive_graph,
            [q.dict() for q in payload.answered_questions],
            payload.thread_id
        )
        
        duration_ms = (time.time() - start_time) * 1000
        
        if isinstance(result, dict) and "error" in result:
            error_msg = str(result.get("error", "Unknown error"))
            logger.warning(f"Interactive graph resume completed with error: {error_msg}")
            return {
                "result": result,
                "status": "error",
                "message": error_msg
            }
        
        logger.info(f"Successfully processed /bleak/interactive/resume request in {duration_ms:.2f}ms")
        
        return {
            "thread_id": payload.thread_id,
            "status": "completed",
            "answer": result.get("answer"),
            "rating": result.get("rating"),
            "answered_questions": payload.answered_questions
        }
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        error_details = str(e)
        logger.error(f"Error processing /bleak/interactive/resume request: {error_details}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing request: {error_details}")

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
            "/bleak/interactive",
            "/bleak/interactive/resume",
            "/debug"
        ]
    } 