from typing import Dict, Any, TypedDict
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
import logging

logger = logging.getLogger(__name__)

# Define the state schema
class GraphState(TypedDict):
    message: str
    conversation_id: str
    response: str
    messages: list

def process_message(state: GraphState) -> GraphState:
    """
    Process the incoming message and generate a response.
    This is where you would integrate your AI logic.
    """
    try:
        user_message = state["message"]
        conversation_id = state.get("conversation_id", "default")
        
        # For now, we'll create a simple echo response
        # Replace this with your actual AI processing logic
        response = f"I received your message: '{user_message}'. This is a placeholder response from the LangGraph."
        
        # Update the state
        updated_state = state.copy()
        updated_state["response"] = response
        updated_state["conversation_id"] = conversation_id
        
        # Add messages to conversation history
        if "messages" not in updated_state:
            updated_state["messages"] = []
        
        updated_state["messages"].extend([
            HumanMessage(content=user_message),
            AIMessage(content=response)
        ])
        
        logger.info(f"Processed message for conversation {conversation_id}")
        return updated_state
        
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        # Return error response
        error_state = state.copy()
        error_state["response"] = "Sorry, I encountered an error processing your message."
        return error_state

def create_graph():
    """
    Create and configure the LangGraph
    """
    # Create a new graph
    workflow = StateGraph(GraphState)
    
    # Add nodes
    workflow.add_node("process_message", process_message)
    
    # Set entry point
    workflow.set_entry_point("process_message")
    
    # Add edges
    workflow.add_edge("process_message", END)
    
    # Compile the graph
    graph = workflow.compile()
    
    logger.info("LangGraph compiled successfully")
    return graph 