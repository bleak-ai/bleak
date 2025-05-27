from bleak_interactive.graph.runner import resume_interactive_graph, run_interactive_graph, check_if_more_questions_needed, generate_structured_questions_from_text
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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


from fastapi import APIRouter


bleak_router = APIRouter(
    prefix="/bleak",
    tags=["bleak-development"],
    responses={404: {"description": "Not found"}},
)


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

@bleak_router.post("/interactive")
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


@bleak_router.post("/interactive/resume")
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
            [q.model_dump() for q in payload.answered_questions],
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


@bleak_router.post("/interactive/choice")
async def bleak_interactive_choice_endpoint(payload: InteractiveChoiceInput, request: Request):
    """
    Handle user choice to either get more questions or proceed to final answer.
    """
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    try:
        logger.info(f"Received choice request for thread: {payload.thread_id}, choice: {payload.choice}")
        
        if payload.choice == "final_answer":
            # User wants the final answer, proceed with resume
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                resume_interactive_graph,
                [q.model_dump() for q in payload.answered_questions],
                payload.thread_id
            )
            
            duration_ms = (time.time() - start_time) * 1000
            
            if isinstance(result, dict) and "error" in result:
                error_msg = str(result.get("error", "Unknown error"))
                logger.warning(f"Interactive graph choice completed with error: {error_msg}")
                return {
                    "result": result,
                    "status": "error",
                    "message": error_msg
                }
            
            logger.info(f"Successfully processed final answer choice in {duration_ms:.2f}ms")
            
            return {
                "thread_id": payload.thread_id,
                "status": "completed",
                "answer": result.get("answer"),
                "rating": result.get("rating"),
                "answered_questions": payload.answered_questions
            }
            
        elif payload.choice == "more_questions":
            # Check if more questions are actually needed
            # First, we need to get the original prompt from the thread state
            from bleak_interactive.graph.build_graph import create_interactive_graph
            
            graph = create_interactive_graph()
            config = {"configurable": {"thread_id": payload.thread_id}}
            
            # Get the current state to extract the original prompt
            try:
                state_snapshot = graph.get_state(RunnableConfig(configurable={"thread_id": payload.thread_id}))
                original_prompt = state_snapshot.values.get("prompt", "")
                
                # Extract just the original prompt (before any context was added)
                if "\n\nUser's answers to clarifying questions:" in original_prompt:
                    original_prompt = original_prompt.split("\n\nUser's answers to clarifying questions:")[0]
                
            except Exception as e:
                logger.warning(f"Could not retrieve original prompt from state: {e}")
                original_prompt = "User's question"  # Fallback
            
            # Check if more questions are needed
            loop = asyncio.get_event_loop()
            assessment = await loop.run_in_executor(
                None,
                check_if_more_questions_needed,
                original_prompt,
                [q.model_dump() for q in payload.answered_questions],
                payload.thread_id
            )
            
            duration_ms = (time.time() - start_time) * 1000
            
            if not assessment.get("needs_more_questions", False):
                # No more questions needed, suggest final answer
                logger.info(f"No more questions needed for thread {payload.thread_id}")
                return {
                    "thread_id": payload.thread_id,
                    "status": "no_more_questions",
                    "message": assessment.get("message", "I have enough information to provide a comprehensive answer."),
                    "suggestion": "final_answer"
                }
            else:
                # Generate structured questions from the text questions
                text_questions = assessment.get("questions", [])
                structured_result = await loop.run_in_executor(
                    None,
                    generate_structured_questions_from_text,
                    text_questions,
                    original_prompt
                )
                
                logger.info(f"Generated {len(text_questions)} additional questions for thread {payload.thread_id}")
                
                return {
                    "thread_id": payload.thread_id,
                    "status": "interrupted",
                    "questions": structured_result.get("structured_questions", []),
                    "message": assessment.get("message", "Here are additional questions to help provide a better answer."),
                    "previous_answers": payload.answered_questions
                }
        else:
            raise HTTPException(status_code=400, detail="Invalid choice. Must be 'more_questions' or 'final_answer'")
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        error_details = str(e)
        logger.error(f"Error processing /bleak/interactive/choice request: {error_details}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing request: {error_details}")
