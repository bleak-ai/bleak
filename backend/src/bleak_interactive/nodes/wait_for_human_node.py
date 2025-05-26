from ..state import BleakState
from ..configuration import Configuration
from langgraph.types import interrupt

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
    
    # Check if we have structured questions to present to the user
    if not state.structured_questions:
        # If no questions, skip waiting and continue
        return state
    
    # Present the questions to the user and wait for input
    # The interrupt will pause execution here until resumed with user answers
    user_answers = interrupt({
        "questions": [q.model_dump() for q in state.structured_questions],
        "message": "Please answer the structured questions to continue."
    })
    
    # When resumed, user_answers should contain the answered questions
    # We'll add the answers to our state for the answer node to process
    if user_answers and "answered_questions" in user_answers:
        # Convert answered questions to a context string for the answer node
        answered_context = "\n\nUser's answers to clarifying questions:\n"
        for q in user_answers["answered_questions"]:
            answered_context += f"Q: {q['question']}\nA: {q['answer']}\n"
        
        # Enhance the prompt with the user's answers
        state.prompt = state.prompt + answered_context
    
    return state 