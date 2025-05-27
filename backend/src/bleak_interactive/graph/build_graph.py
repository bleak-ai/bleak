from langgraph.graph import StateGraph, END, START
from bleak_interactive.state import BleakState, BleakStateInput, BleakStateOutput
from bleak_interactive.nodes import (
    answer_node, 
    clarify_node, 
    structure_questions_node, 
    wait_for_human_node,
    choice_node,
    additional_questions_node
)
from bleak_interactive.configuration import Configuration
from langgraph.checkpoint.memory import MemorySaver

# Create a shared checkpointer instance for state persistence across function calls
_shared_checkpointer = MemorySaver()

def create_node_wrapper(node_func):
    """Create a wrapper that adapts node functions to RunnableLike format"""
    def wrapped_node(state):
        config = Configuration()
        return node_func(state, config)
    return wrapped_node

def should_ask_more_questions(state: BleakState) -> str:
    """
    Conditional edge function to determine the next node based on user choice.
    
    Args:
        state: Current graph state
        
    Returns:
        String indicating the next node to execute
    """
    print("should_ask_more_questions", state.user_choice)
    if state.user_choice == "more_questions":
        return "additional_questions_node"
    elif state.user_choice == "final_answer":
        return "answer_node"
    else:
        # Default to final answer if no choice is made
        return "answer_node"

def should_continue_or_answer(state: BleakState) -> str:
    """
    Conditional edge function to determine if we should continue with more questions
    or proceed to answer based on whether new questions were generated.
    
    Args:
        state: Current graph state
        
    Returns:
        String indicating the next node to execute
    """
    if state.questions_to_ask:
        print("should_ask_more_questions", len(state.questions_to_ask))

    # If we have questions to ask, go to structure them
    if state.questions_to_ask and len(state.questions_to_ask) > 0:
        return "structure_questions_node"
    else:
        # No more questions, proceed to answer
        return "answer_node"

def create_interactive_graph():
    """Build and compile the interactive bleak graph with human-in-the-loop"""
    builder = StateGraph(
        BleakState,
        input=BleakStateInput,
        output=BleakStateOutput
    )

    # Add all nodes for the interactive flow
    builder.add_node("clarify_node", create_node_wrapper(clarify_node))
    builder.add_node("structure_questions_node", create_node_wrapper(structure_questions_node))
    builder.add_node("wait_for_human", create_node_wrapper(wait_for_human_node))
    builder.add_node("choice_node", create_node_wrapper(choice_node))
    builder.add_node("additional_questions_node", create_node_wrapper(additional_questions_node))
    builder.add_node("answer_node", create_node_wrapper(answer_node))
    
    # Add edges for interactive flow
    builder.add_edge(START, "clarify_node")
    builder.add_edge("clarify_node", "structure_questions_node")
    builder.add_edge("structure_questions_node", "choice_node")
    # builder.add_edge "choice_node")
    
    # Conditional edge from choice_node based on user choice
    builder.add_conditional_edges(
        "choice_node",
        should_ask_more_questions,
        {
            "additional_questions_node": "additional_questions_node",
            "answer_node": "answer_node"
        }
    )
    
    # Conditional edge from additional_questions_node
    builder.add_conditional_edges(
        "additional_questions_node",
        should_continue_or_answer,
        {
            "structure_questions_node": "structure_questions_node",
            "answer_node": "answer_node"
        }
    )
    
    builder.add_edge("answer_node", END)

    # Use the shared checkpointer for state persistence
    # Compile with checkpointer and interrupt before wait_for_human and choice nodes
    return builder.compile(
        checkpointer=_shared_checkpointer, 
        interrupt_before=["wait_for_human", "choice_node"]
    )

# Export the graph variable that langgraph.json expects
graph = create_interactive_graph() 