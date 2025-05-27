from ..state import BleakState
from ..configuration import Configuration
from langgraph.types import interrupt

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
    
    # Check if we already have a user choice (from resume)
    if state.user_choice:
        return state
    
    print("Interrupt choice node")
    # Present the choice to the user and wait for input
    user_input = interrupt({
        "answered_questions": state.answered_questions,
        "message": "Would you like me to ask more clarifying questions or generate the final answer?",
        "choices": ["more_questions", "final_answer"]
    })

    print("user_input", user_input)
    
    # When resumed, user_input should contain the user's choice
    if user_input and "choice" in user_input:
        state.user_choice = user_input["choice"]
        
        # If user provided additional answered questions, update them
        if "answered_questions" in user_input:
            state.answered_questions = user_input["answered_questions"]
    
    return state 