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

memory = MemorySaver()


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


# Available tools for the chatbot
TOOLS = [multiply, divide]


class BasicToolNode:
    """Executes tools requested by the AI assistant."""
    
    def __init__(self, tools: list) -> None:
        print(f"Initializing tool node with {len(tools)} tools")
        self.tools_by_name = {tool.name: tool for tool in tools}

    def __call__(self, inputs: dict) -> dict:
        """Execute tool calls from the latest AI message."""
        messages = inputs.get("messages", [])
        if not messages:
            raise ValueError("No messages found in input")
        
        last_message = messages[-1]
        tool_outputs = []
        
        # Execute each tool call and collect results
        for tool_call in last_message.tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]
            
            # Execute the tool
            result = self.tools_by_name[tool_name].invoke(tool_args)
            
            # Create tool message with result
            tool_outputs.append(
                ToolMessage(
                    content=json.dumps(result),
                    name=tool_name,
                    tool_call_id=tool_call["id"],
                )
            )
        
        return {"messages": tool_outputs}


class State(TypedDict):
    """Graph state containing conversation messages."""
    messages: Annotated[list, add_messages]


def chatbot_node(state: State) -> dict:
    """Main chatbot node that generates responses using LLM with tools."""
    return {"messages": [llm_with_tools.invoke(state["messages"])]}
    # return {"messages": [llm.invoke(state["messages"])]}


def route_after_chatbot(state: State) -> str:
    """
    Route to tools if the AI wants to use them, otherwise end conversation.
    
    Returns:
        "tools" if AI made tool calls, END otherwise
    """
    messages = state.get("messages", [])
    if not messages:
        raise ValueError("No messages found in state")
    
    last_message = messages[-1]
    
    # Check if AI wants to use tools
    if hasattr(last_message, "tool_calls") and len(last_message.tool_calls) > 0:
        return "tools"
    
    return END


def build_chatbot_graph():
    """Build and return the chatbot conversation graph."""
    # Initialize LLM with tool capabilities
    config = Configuration()
    llm = LLMProvider.get_llm(config)
    llm_with_tools = llm.bind_tools(TOOLS)
    
    # Create tool execution node
    tool_node = BasicToolNode(tools=TOOLS)
    
    # Build the conversation graph
    graph_builder = StateGraph(State)
    
    # Add nodes
    graph_builder.add_node("chatbot", chatbot_node)
    graph_builder.add_node("tools", tool_node)
    
    # Add edges
    graph_builder.add_edge(START, "chatbot")
    graph_builder.add_edge("tools", "chatbot")  # Return to chatbot after using tools
    
    # Add conditional routing from chatbot
    graph_builder.add_conditional_edges(
        "chatbot",
        route_after_chatbot,
        {"tools": "tools", END: END}
    )
    
    return graph_builder.compile(checkpointer=memory)


# Initialize the chatbot graph
config = Configuration()
llm = LLMProvider.get_llm(config)
llm_with_tools = llm.bind_tools(TOOLS)

# Build the complete graph
graph = build_chatbot_graph()