from ..state import BleakState
from ..configuration import Configuration
from langgraph.types import interrupt
from ..utils.logger import (
    node_start, node_info, node_success, node_end, 
    user_choice_received, flow_interrupted, error_occurred
)

def choice_node(state: BleakState, config: Configuration) -> BleakState:
    """
    Node that asks the user whether they want more questions or the final answer.
    
    This node will interrupt the graph execution to allow the user to choose
    between getting additional clarifying questions or proceeding to generate
    the final answer.
    
    Args:
        state: Current graph state containing answered questions
        config: Configuration object
        
    Returns:
        Updated state with user choice (execution will be paused here)
    """
    
    try:
        node_start("choice_node", 3)
        
        # Log node execution
        node_info("Processing user choice", 
                 answered_questions_count=len(state.answered_questions),
                 has_existing_choice=bool(state.user_choice))
        
        # Check if we already have a user choice (from resume)
        if state.user_choice is not None:
            user_choice_received(state.user_choice)
            node_success("Resuming with existing user choice")
            node_end("choice_node", True)
            return state
        
        # Present the choice to the user and wait for input
        flow_interrupted("User choice required", {
            "choices": ["more_questions", "final_answer"],
            "answered_questions": f"{len(state.answered_questions)} questions"
        })
        
        user_input = interrupt({
            "answered_questions": state.answered_questions,
            "message": "Would you like me to ask more clarifying questions or generate the final answer?",
            "choices": ["more_questions", "final_answer"]
        })

        # This code will run when the graph is resumed
        if user_input and "choice" in user_input:
            user_choice_received(user_input["choice"])
            node_success("User choice received and processed")
        
        node_end("choice_node", True)
        return state
        
    except Exception as e:
        error_occurred(e,
                      node="choice_node",
                      answered_questions_count=len(state.answered_questions),
                      has_user_choice=bool(state.user_choice))
        node_end("choice_node", False)
        return state 