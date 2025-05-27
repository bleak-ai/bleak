from bleak_interactive.graph.runner import (
    resume_interactive_graph, 
    run_interactive_graph, 
    assess_question_sufficiency,
    generate_additional_questions,
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
    to clarifying questions and generates the final answer.
    
    Returns:
        - thread_id: The conversation identifier
        - status: "completed"
        - answer: The final generated answer
        - answered_questions: All questions that were answered
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
        
        return {
            "thread_id": payload.thread_id,
            "status": "completed",
            "answer": result.get("answer"),
            "answered_questions": payload.answered_questions
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
    - "more_questions": Assess if more questions are needed and generate them
    
    The assessment considers ALL previously answered questions and enforces
    a maximum of 5 questions before automatically proceeding to final answer.
    
    Returns:
        For "final_answer" choice:
        - thread_id, status: "completed", answer, answered_questions
        
        For "more_questions" choice:
        - If more questions needed: thread_id, status: "interrupted", questions, message
        - If sufficient info: thread_id, status: "no_more_questions", suggestion: "final_answer"
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
        
        if payload.choice == "final_answer":
            # User wants the final answer - proceed with resume
            return await _handle_final_answer_choice(
                payload.thread_id, 
                all_answered_questions, 
                request_id
            )
        
        elif payload.choice == "more_questions":
            # User wants more questions - assess if they're needed
            return await _handle_more_questions_choice(
                payload.thread_id,
                all_answered_questions,
                request_id
            )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        error_details = str(e)
        logger.error(f"[{request_id}] Error processing choice request: {error_details}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing request: {error_details}")


# Helper functions for better code organization

async def _handle_final_answer_choice(
    thread_id: str, 
    answered_questions: List[Dict[str, str]], 
    request_id: str
) -> Dict[str, Any]:
    """
    Handle the user's choice to proceed to final answer generation.
    
    Args:
        thread_id: The conversation thread identifier
        answered_questions: All previously answered questions
        request_id: Request ID for logging
        
    Returns:
        Dictionary containing the final answer and completion status
    """
    logger.info(f"[{request_id}] Generating final answer for thread: {thread_id}")
    
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        resume_interactive_graph,
        answered_questions,
        thread_id
    )
    
    # Handle errors from graph execution
    if isinstance(result, dict) and "error" in result:
        error_msg = str(result.get("error", "Unknown error"))
        logger.warning(f"[{request_id}] Final answer generation failed: {error_msg}")
        return {
            "result": result,
            "status": "error",
            "message": error_msg
        }
    
    logger.info(f"[{request_id}] Successfully generated final answer")
    
    return {
        "thread_id": thread_id,
        "status": "completed",
        "answer": result.get("answer"),
        "answered_questions": answered_questions
    }


async def _handle_more_questions_choice(
    thread_id: str,
    answered_questions: List[Dict[str, str]],
    request_id: str
) -> Dict[str, Any]:
    """
    Handle the user's choice to get more clarifying questions.
    
    This function:
    1. Retrieves the original prompt from the thread state
    2. Assesses if more questions are actually needed (considering ALL previous answers)
    3. Generates additional questions if needed
    4. Structures the questions for UI display
    
    Args:
        thread_id: The conversation thread identifier
        answered_questions: All previously answered questions
        request_id: Request ID for logging
        
    Returns:
        Dictionary containing either new questions or suggestion to proceed to final answer
    """
    logger.info(f"[{request_id}] Assessing need for more questions (current count: {len(answered_questions)})")
    
    try:
        # Retrieve the original prompt from thread state
        original_prompt = await _get_original_prompt_from_thread(thread_id)
        
        # Assess if more questions are needed using ALL answered questions
        loop = asyncio.get_event_loop()
        assessment = await loop.run_in_executor(
            None,
            assess_question_sufficiency,
            original_prompt,
            answered_questions
        )
        
        logger.info(f"[{request_id}] Question assessment result: {assessment.get('reason', 'unknown')}")
        
        if not assessment.get("needs_more_questions", False):
            # No more questions needed - suggest final answer
            logger.info(f"[{request_id}] Sufficient information available, suggesting final answer")
            return {
                "thread_id": thread_id,
                "status": "no_more_questions",
                "message": assessment.get("message", "I have enough information to provide a comprehensive answer."),
                "suggestion": "final_answer",
                "total_questions_answered": assessment.get("total_questions_answered", len(answered_questions))
            }
        
        # Generate additional questions
        new_questions = await loop.run_in_executor(
            None,
            generate_additional_questions,
            original_prompt,
            answered_questions
        )
        
        if not new_questions:
            # No questions generated - fallback to final answer
            logger.warning(f"[{request_id}] No additional questions generated, suggesting final answer")
            return {
                "thread_id": thread_id,
                "status": "no_more_questions",
                "message": "I have enough information to provide a comprehensive answer.",
                "suggestion": "final_answer"
            }
        
        # Structure the questions for UI display
        structured_result = await loop.run_in_executor(
            None,
            generate_structured_questions_from_text,
            new_questions,
            original_prompt
        )
        
        logger.info(f"[{request_id}] Generated {len(new_questions)} additional questions")
        
        return {
            "thread_id": thread_id,
            "status": "interrupted",
            "questions": structured_result.get("structured_questions", []),
            "message": assessment.get("message", "Here are additional questions to help provide a better answer."),
            "previous_answers": answered_questions
        }
        
    except Exception as e:
        logger.error(f"[{request_id}] Error in more questions assessment: {str(e)}")
        # Fallback to suggesting final answer on error
        return {
            "thread_id": thread_id,
            "status": "no_more_questions",
            "message": "I have enough information to provide an answer.",
            "suggestion": "final_answer",
            "error": str(e)
        }


async def _get_original_prompt_from_thread(thread_id: str) -> str:
    """
    Retrieve the original user prompt from the thread state.
    
    Args:
        thread_id: The conversation thread identifier
        
    Returns:
        The original user prompt, cleaned of any added context
        
    Raises:
        Exception: If unable to retrieve the prompt from thread state
    """
    try:
        from bleak_interactive.graph.build_graph import create_interactive_graph
        
        graph = create_interactive_graph()
        config = RunnableConfig(configurable={"thread_id": thread_id})
        
        # Get the current state to extract the original prompt
        state_snapshot = graph.get_state(config)
        original_prompt = state_snapshot.values.get("prompt", "")
        
        # Clean the prompt by removing any added context from previous interactions
        if "\n\nUser's answers to clarifying questions:" in original_prompt:
            original_prompt = original_prompt.split("\n\nUser's answers to clarifying questions:")[0]
        
        if not original_prompt:
            raise ValueError("No prompt found in thread state")
            
        return original_prompt.strip()
        
    except Exception as e:
        logger.warning(f"Could not retrieve original prompt from thread {thread_id}: {e}")
        # Return a fallback prompt
        return "User's question"
