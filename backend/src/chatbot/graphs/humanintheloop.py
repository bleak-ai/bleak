import json
from typing import Annotated

from chatbot.configuration import Configuration
from chatbot.llm_provider import LLMProvider
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.tools import tool
from langchain_core.messages import ToolMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import Command, interrupt
from langgraph.prebuilt import ToolNode, tools_condition


class State(TypedDict):
    messages: Annotated[list, add_messages]

memory = MemorySaver()
graph_builder = StateGraph(State)


# Tool definitions
@tool
def multiply(a: int, b: int) -> int:
    """Multiply two numbers together"""
    print(f"Using multiply tool: {a} × {b}")
    return a * b


@tool
def divide(a: int, b: int) -> float:
    """Divide two numbers together"""
    print(f"Using divide tool: {a} ÷ {b}")
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

@tool
def human_assistance(query: str) -> str:
    """Request assistance from a human."""
    # This will interrupt the graph execution and wait for human input
    human_response = interrupt({
        "query": query,
        "message": "Human assistance requested",
        "type": "human_assistance"
    })
    
    # When resumed, human_response should contain the data
    # If no data is provided, return a default response
    if human_response and "data" in human_response:
        return human_response["data"]
    else:
        # Return a default response if no human input is provided
        return f"No human response provided for query: {query}"


# Available tools for the chatbot
tools = [multiply, divide, human_assistance]

config = Configuration()
llm = LLMProvider.get_llm(config)
llm_with_tools = llm.bind_tools(tools)

def chatbot(state: State):
    message = llm_with_tools.invoke(state["messages"])
    assert(len(message.tool_calls) <= 1)
    return {"messages": [message]}

graph_builder.add_node("chatbot", chatbot)

tool_node = ToolNode(tools=tools)
graph_builder.add_node("tools", tool_node)

graph_builder.add_conditional_edges(
    "chatbot",
    tools_condition,
)
graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge(START, "chatbot")

memory = MemorySaver()
graph = graph_builder.compile(checkpointer=memory)
