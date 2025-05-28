from typing import Annotated

from chatbot.configuration import Configuration
from chatbot.llm_provider import LLMProvider
from langchain_core.messages import BaseMessage
from typing_extensions import TypedDict
from dotenv import load_dotenv

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_core.tools import tool

load_dotenv()

class State(TypedDict):
    messages: Annotated[list, add_messages]


config = Configuration()
llm = LLMProvider.get_llm(config)

graph_builder = StateGraph(State)

# tool = TavilySearch(max_results=2)

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

tools = [multiply, divide]
llm_with_tools = llm.bind_tools(tools)

def chatbot(state: State):
    return {"messages": [llm_with_tools.invoke(state["messages"])]}

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