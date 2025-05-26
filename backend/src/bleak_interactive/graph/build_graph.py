from langgraph.graph import StateGraph, END, START
from bleak_interactive.state import BleakState, BleakStateInput, BleakStateOutput
from bleak_interactive.nodes import answer_node, clarify_node, structure_questions_node, wait_for_human_node
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
    builder.add_node("answer_node", create_node_wrapper(answer_node))
    
    # Add edges for interactive flow
    builder.add_edge(START, "clarify_node")
    builder.add_edge("clarify_node", "structure_questions_node")
    builder.add_edge("structure_questions_node", "wait_for_human")
    builder.add_edge("wait_for_human", "answer_node")
    builder.add_edge("answer_node", END)

    # Use the shared checkpointer for state persistence
    # Compile with checkpointer and interrupt before wait_for_human node
    return builder.compile(
        # checkpointer=_shared_checkpointer, 
        interrupt_before=["wait_for_human"]
    )

# Export the graph variable that langgraph.json expects
graph = create_interactive_graph() 