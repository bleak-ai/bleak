from ..state import BleakState
from ..configuration import Configuration
from langgraph.types import interrupt
from ..utils.logger import (
    node_start, node_info, node_success, node_end,
    user_answers_received, flow_interrupted, error_occurred
)

def wait_for_human_node(state: BleakState, config: Configuration) -> BleakState:
    """
    Node that pauses execution and waits for human input (answered questions).
    
    This node will interrupt the graph execution to allow the user to provide
    answers to the structured questions.
    
    Args:
        state: Current graph state containing structured questions
        config: Configuration object
        
    Returns:
        Updated state (execution will be paused here)
    """
    
    try:
        node_start("wait_for_human")
        
        # Check if we have structured questions to present to the user
        if not state.structured_questions:
            node_info("No structured questions to present, skipping wait")
            node_end("wait_for_human", True)
            return state
        
        node_info("Preparing to wait for user answers", 
                 questions_count=len(state.structured_questions))
        
        # Present the questions to the user and wait for input
        flow_interrupted("User answers required", {
            "questions": f"{len(state.structured_questions)} structured questions"
        })
        
        # The interrupt will pause execution here until resumed with user answers
        user_answers = interrupt({
            "questions": [q.model_dump() for q in state.structured_questions],
            "message": "Please answer the structured questions to continue."
        })
        
        # This code will run when the graph is resumed with answers
        if user_answers and isinstance(user_answers, list):
            state.answered_questions = user_answers
            user_answers_received(user_answers)
            node_success("User answers received and processed")
        
        node_end("wait_for_human", True)
        return state
        
    except Exception as e:
        error_occurred(e,
                      node="wait_for_human",
                      structured_questions_count=len(state.structured_questions) if state.structured_questions else 0)
        node_end("wait_for_human", False)
        return state 