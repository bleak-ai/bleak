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

# Import chatbot graph
# from chatbot.graph import graph
from chatbot.graphs.time_travel import graph


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


from fastapi import APIRouter


chatbot_router = APIRouter(
    prefix="/chat",
    tags=["chatbot-development"],
    responses={404: {"description": "Not found"}},
)

# Pydantic models for request/response
class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

# Time travel models
class ConversationHistoryResponse(BaseModel):
    conversation_id: str
    checkpoints: List[Dict[str, Any]]

class ResumeFromCheckpointRequest(BaseModel):
    conversation_id: str
    checkpoint_id: str
    new_message: str | None = None

class EditMessageRequest(BaseModel):
    conversation_id: str
    checkpoint_id: str
    edited_message: str

@chatbot_router.post("")
async def chat_endpoint(payload: ChatRequest, request: Request):
    """
    Simple chat endpoint that uses the chatbot graph to process messages.
    """
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    try:
        logger.info(f"Received chat request: {payload.message}")
        
        # Use provided conversation_id or generate a new one
        conversation_id = payload.conversation_id or str(uuid.uuid4())
        config = {"thread_id": conversation_id}
        config = RunnableConfig(configurable=config)
        print("config", config)
        
        
        # Process the message using the chatbot graph
        loop = asyncio.get_event_loop()
        
        def run_graph():
            # Create the input in the format expected by the graph
            graph_input = {"messages": [{"role": "user", "content": payload.message}]}
            
            # Stream through the graph and get the final result
            result = None
            events = graph.stream(graph_input, config=config)
            for event in events:
                if "messages" in event:
                    print(event["messages"][-1].pretty_print())

            for event in graph.stream(graph_input, config=config):
                for value in event.values():
                    if "messages" in value and len(value["messages"]) > 0:
                        result = value["messages"][-1].content
            
            return result
        
        result = await loop.run_in_executor(None, run_graph)
        
        duration_ms = (time.time() - start_time) * 1000
        if result is None:
            logger.warning("Graph execution completed but no result was returned")
            raise HTTPException(status_code=500, detail="No response generated")
        
        logger.info(f"Successfully processed chat request in {duration_ms:.2f}ms")
        
        return ChatResponse(
            response=result,
            conversation_id=conversation_id
        )
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        error_details = str(e)
        logger.error(f"Error processing chat request: {error_details}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing request: {error_details}")
    
@chatbot_router.post("/human-assistance")
async def chat_human_assistance_endpoint(payload: ChatRequest, request: Request):
    """
    Simple chat endpoint that uses the chatbot graph to process messages.
    """
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    try:
        logger.info(f"Received chat request: {payload.message}")
        
        # Use provided conversation_id or generate a new one
        conversation_id = payload.conversation_id or str(uuid.uuid4())
        config = {"thread_id": conversation_id}
        config = RunnableConfig(configurable=config)
        print("config", config)
        
        
        # Process the message using the chatbot graph
        loop = asyncio.get_event_loop()
        
        def run_graph():
            # Create the input in the format expected by the graph
            human_response = (
                payload.message
            )

            human_command = Command(resume={"data": human_response})
            # graph_input = {"messages": [{"role": "user", "content": payload.message}]}
            
            # Stream through the graph and get the final result
            result = None
            for event in graph.stream(human_command, config=config):
                for value in event.values():
                    if "messages" in value and len(value["messages"]) > 0:
                        result = value["messages"][-1].content
            
            return result
        
        result = await loop.run_in_executor(None, run_graph)
        
        duration_ms = (time.time() - start_time) * 1000
        if result is None:
            logger.warning("Graph execution completed but no result was returned")
            raise HTTPException(status_code=500, detail="No response generated")
        
        logger.info(f"Successfully processed chat request in {duration_ms:.2f}ms")
        
        return ChatResponse(
            response=result,
            conversation_id=conversation_id
        )
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        error_details = str(e)
        logger.error(f"Error processing chat request: {error_details}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing request: {error_details}")

@chatbot_router.get("/{conversation_id}/history")
async def get_conversation_history(conversation_id: str):
    """
    Get the conversation history with all checkpoints for time travel functionality.
    """
    try:
        logger.info(f"Getting conversation history for: {conversation_id}")
        
        config = {"thread_id": conversation_id}
        config = RunnableConfig(configurable=config)
        
        # Get state history from the graph
        checkpoints = []
        for state in graph.get_state_history(config):
            # Safely access checkpoint_id
            checkpoint_id = state.config.get("configurable", {}).get("checkpoint_id", "")
            
            checkpoint_data = {
                "checkpoint_id": checkpoint_id,
                "messages": [
                    {
                        "role": msg.type if hasattr(msg, 'type') else "unknown",
                        "content": msg.content if hasattr(msg, 'content') else str(msg),
                        "timestamp": str(state.created_at) if state.created_at else None
                    }
                    for msg in state.values.get("messages", [])
                ],
                "next_nodes": list(state.next) if state.next else [],
                "created_at": str(state.created_at) if state.created_at else None
            }
            checkpoints.append(checkpoint_data)
        
        return ConversationHistoryResponse(
            conversation_id=conversation_id,
            checkpoints=checkpoints
        )
        
    except Exception as e:
        error_details = str(e)
        logger.error(f"Error getting conversation history: {error_details}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error getting conversation history: {error_details}")

@chatbot_router.post("/resume-from-checkpoint")
async def resume_from_checkpoint(payload: ResumeFromCheckpointRequest):
    """
    Resume conversation from a specific checkpoint (time travel).
    """
    try:
        logger.info(f"Resuming from checkpoint {payload.checkpoint_id} for conversation {payload.conversation_id}")
        
        # Create config with the specific checkpoint
        config = {
            "thread_id": payload.conversation_id,
            "checkpoint_id": payload.checkpoint_id
        }
        config = RunnableConfig(configurable=config)
        
        # If a new message is provided, process it from this checkpoint
        if payload.new_message:
            loop = asyncio.get_event_loop()
            
            def run_graph():
                graph_input = {"messages": [{"role": "user", "content": payload.new_message}]}
                
                result = None
                for event in graph.stream(graph_input, config=config):
                    for value in event.values():
                        if "messages" in value and len(value["messages"]) > 0:
                            result = value["messages"][-1].content
                
                return result
            
            result = await loop.run_in_executor(None, run_graph)
            
            if result is None:
                result = "No response generated"
            
            return ChatResponse(
                response=result,
                conversation_id=payload.conversation_id
            )
        else:
            # Just return the state at this checkpoint
            state = graph.get_state(config)
            last_message = ""
            if state.values.get("messages"):
                last_message = state.values["messages"][-1].content
            
            return ChatResponse(
                response=last_message,
                conversation_id=payload.conversation_id
            )
        
    except Exception as e:
        error_details = str(e)
        logger.error(f"Error resuming from checkpoint: {error_details}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error resuming from checkpoint: {error_details}")

@chatbot_router.post("/edit-message")
async def edit_message(payload: EditMessageRequest):
    """
    Edit a message at a specific checkpoint and continue the conversation.
    """
    try:
        logger.info(f"Editing message at checkpoint {payload.checkpoint_id} for conversation {payload.conversation_id}")
        
        # Create config with the specific checkpoint
        config = {
            "thread_id": payload.conversation_id,
            "checkpoint_id": payload.checkpoint_id
        }
        config = RunnableConfig(configurable=config)
        
        # Process the edited message from this checkpoint
        loop = asyncio.get_event_loop()
        
        def run_graph():
            graph_input = {"messages": [{"role": "user", "content": payload.edited_message}]}
            
            result = None
            for event in graph.stream(graph_input, config=config):
                for value in event.values():
                    if "messages" in value and len(value["messages"]) > 0:
                        result = value["messages"][-1].content
            
            return result
        
        result = await loop.run_in_executor(None, run_graph)
        
        if result is None:
            result = "No response generated"
        
        return ChatResponse(
            response=result,
            conversation_id=payload.conversation_id
        )
        
    except Exception as e:
        error_details = str(e)
        logger.error(f"Error editing message: {error_details}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error editing message: {error_details}")
