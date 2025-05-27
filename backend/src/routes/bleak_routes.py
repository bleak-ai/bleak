from bleak_interactive.graph.runner import (
    resume_interactive_graph, 
    run_interactive_graph, 
    resume_with_choice,
    generate_structured_questions_from_text
)
from fastapi import FastAPI, HTTPException, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging
import asyncio
import time
import uuid
import traceback
from langchain_core.runnables.config import RunnableConfig

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Router configuration
bleak_router = APIRouter(
    prefix="/bleak",
    tags=["bleak-development"],
    responses={404: {"description": "Not found"}},
)


# Request/Response Models
class BleakInput(BaseModel):
    prompt: str


class AnsweredQuestion(BaseModel):
    question: str
    answer: str


class InteractiveInput(BaseModel):
    prompt: str
    thread_id: Optional[str] = None


class InteractiveResumeInput(BaseModel):
    thread_id: str
    answered_questions: List[AnsweredQuestion]


class InteractiveChoiceInput(BaseModel):
    thread_id: str
    answered_questions: List[AnsweredQuestion]
    choice: str  # "more_questions" or "final_answer"


# API Endpoints

@bleak_router.post("/interactive")
async def bleak_interactive_endpoint(payload: InteractiveInput, request: Request):
    """
    Start an interactive bleak conversation with human-in-the-loop.
    
    This endpoint initiates a new conversation or continues an existing one.
    It processes the user's prompt and returns clarifying questions along with
    a thread_id for maintaining conversation state.
    
    Returns:
        - thread_id: Unique identifier for the conversation
        - status: "interrupted" (waiting for user input)
        - questions: List of structured clarifying questions
        - message: Instructions for the user
    """
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    try:
        logger.info(f"[{request_id}] Starting interactive session with prompt: {payload.prompt}")
        
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
        
        # Handle errors from graph execution
        if isinstance(result, dict) and "error" in result:
            error_msg = str(result.get("error", "Unknown error"))
            logger.warning(f"[{request_id}] Interactive graph execution failed: {error_msg}")
            return {
                "result": result,
                "status": "error",
                "message": error_msg
            }
        
        logger.info(f"[{request_id}] Successfully processed interactive request in {duration_ms:.2f}ms")
        
        # Return questions and thread_id for user to answer
        return {
            "thread_id": thread_id,
            "status": "interrupted",
            "questions": result.get("structured_questions", []),
            "message": "Please answer the questions and use the resume endpoint to continue."
        }
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        error_details = str(e)
        logger.error(f"[{request_id}] Error processing interactive request: {error_details}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing request: {error_details}")


@bleak_router.post("/interactive/resume")
async def bleak_interactive_resume_endpoint(payload: InteractiveResumeInput, request: Request):
    """
    Resume an interrupted interactive bleak conversation with user answers.
    
    This endpoint continues the workflow after the user has provided answers
    to clarifying questions. Now leads to a choice between more questions or final answer.
    
    Returns:
        - thread_id: The conversation identifier
        - status: "interrupted" (waiting for choice) or "completed" (if final answer)
        - choice_options: Available choices for the user
        - answered_questions: All questions that were answered
        - message: Instructions for the user
    """
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    try:
        logger.info(f"[{request_id}] Resuming interactive session for thread: {payload.thread_id}")
        
        # Resume the interactive graph with user answers
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            resume_interactive_graph,
            [q.model_dump() for q in payload.answered_questions],
            payload.thread_id
        )
        
        duration_ms = (time.time() - start_time) * 1000
        
        # Handle errors from graph execution
        if isinstance(result, dict) and "error" in result:
            error_msg = str(result.get("error", "Unknown error"))
            logger.warning(f"[{request_id}] Interactive graph resume failed: {error_msg}")
            return {
                "result": result,
                "status": "error",
                "message": error_msg
            }
        
        logger.info(f"[{request_id}] Successfully processed resume request in {duration_ms:.2f}ms")
        
        # Check if we got a final answer (old flow) or need to present choice (new flow)
        if result.get("answer"):
            # Old flow - direct to answer
            return {
                "thread_id": payload.thread_id,
                "status": "completed",
                "answer": result.get("answer"),
                "answered_questions": payload.answered_questions
            }
        else:
            # New flow - present choice to user
            return {
                "thread_id": payload.thread_id,
                "status": "interrupted",
                "choice_options": ["more_questions", "final_answer"],
                "answered_questions": payload.answered_questions,
                "message": "Would you like me to ask more clarifying questions or generate the final answer?"
            }
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        error_details = str(e)
        logger.error(f"[{request_id}] Error processing resume request: {error_details}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing request: {error_details}")


@bleak_router.post("/interactive/choice")
async def bleak_interactive_choice_endpoint(payload: InteractiveChoiceInput, request: Request):
    """
    Handle user choice to either get more questions or proceed to final answer.
    
    This endpoint processes the user's choice after they've answered initial questions:
    - "final_answer": Proceed to generate the final answer
    - "more_questions": Generate additional questions if needed
    
    Returns:
        For "final_answer" choice:
        - thread_id, status: "completed", answer, answered_questions
        
        For "more_questions" choice:
        - If more questions generated: thread_id, status: "interrupted", questions, message
        - If no more questions needed: thread_id, status: "completed", answer, answered_questions
    """
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    try:
        logger.info(f"[{request_id}] Processing choice '{payload.choice}' for thread: {payload.thread_id}")
        
        # Validate choice parameter
        if payload.choice not in ["more_questions", "final_answer"]:
            raise HTTPException(
                status_code=400, 
                detail="Invalid choice. Must be 'more_questions' or 'final_answer'"
            )
        
        # Convert answered questions to dict format for processing
        all_answered_questions = [q.model_dump() for q in payload.answered_questions]
        
        # Use the new resume_with_choice function to handle the choice in the graph
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            resume_with_choice,
            payload.choice,
            all_answered_questions,
            payload.thread_id
        )

        duration_ms = (time.time() - start_time) * 1000
        
        # Handle errors from graph execution
        if isinstance(result, dict) and "error" in result:
            error_msg = str(result.get("error", "Unknown error"))
            logger.warning(f"[{request_id}] Choice processing failed: {error_msg}")
            return {
                "result": result,
                "status": "error",
                "message": error_msg
            }
        
        logger.info(f"[{request_id}] Successfully processed choice in {duration_ms:.2f}ms")
        print("result", result)

        # Check if we got new questions or a final answer
        if result.get("answer"):
            # More questions were generated
            return {
                "thread_id": payload.thread_id,
                "status": "completed",
                "answer": result.get("answer"),
                "answered_questions": all_answered_questions
            }
        elif result.get("structured_questions"):
            # Final answer was generated
            return {
                "thread_id": payload.thread_id,
                "status": "interrupted",
                "questions": result.get("structured_questions", []),
                "message": "Here are additional questions to help provide a better answer.",
                "answered_questions": all_answered_questions
            }
        else:
            # Fallback case
            return {
                "thread_id": payload.thread_id,
                "status": "completed",
                "message": "Processing completed",
                "answered_questions": all_answered_questions
            }
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        error_details = str(e)
        logger.error(f"[{request_id}] Error processing choice request: {error_details}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing request: {error_details}")

