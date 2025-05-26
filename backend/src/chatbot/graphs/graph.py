from typing import Annotated

from chatbot.configuration import Configuration
from chatbot.llm_provider import LLMProvider
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages

config = Configuration()
llm = LLMProvider.get_llm(config)

def create_node_wrapper(node_func):
    """Create a wrapper that adapts node functions to RunnableLike format"""
    def wrapped_node(state):
        config = Configuration()
        return node_func(state, config)
    return wrapped_node

class State(TypedDict):
    # Messages have the type "list". The `add_messages` function
    # in the annotation defines how this state key should be updated
    # (in this case, it appends messages to the list, rather than overwriting them)
    messages: Annotated[list, add_messages]

def chatbot(state: State):
    return {"messages": [llm.invoke(state["messages"])]}


graph_builder = StateGraph(State)

# The first argument is the unique node name
# The second argument is the function or object that will be called whenever
# the node is used.
graph_builder.add_edge(START, "chatbot")

graph_builder.add_node("chatbot", chatbot)


graph = graph_builder.compile()

