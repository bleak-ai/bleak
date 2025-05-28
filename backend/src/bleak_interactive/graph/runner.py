from typing import Dict, Any, Optional, List
from .build_graph import create_interactive_graph
from langgraph.types import Command
from ..utils.logger import flow_start, flow_resumed, error_occurred


def run_interactive_graph(input_data: Dict[str, Any], thread_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Run the interactive graph with human-in-the-loop capabilities.
    
    This function initiates a new interactive conversation or continues an existing one.
    It handles the initial prompt processing and question generation.
    
    Args:
        input_data: Dictionary containing the input data or Command for resuming
        thread_id: Thread ID for maintaining conversation state
        
    Returns:
        Dictionary containing the graph execution results, including questions or errors
    """
    try:
        # Log the start of graph execution
        flow_start(input_data["prompt"])
        
        # Get the interactive graph
        graph = create_interactive_graph()
        
        # Configure thread for state persistence
        config = {"configurable": {"thread_id": thread_id or "default_thread"}}
        
        # Check if this is a resume command with user answers
        if isinstance(input_data, dict) and "resume_with_answers" in input_data:
            # This is a resume operation with user answers
            user_answers = input_data["resume_with_answers"]
            command = Command(resume={"answered_questions": user_answers})
            result = graph.invoke(command, config)  # type: ignore
        else:
            # This is a new conversation or continuation
            result = graph.invoke(input_data, config)  # type: ignore
        
        return result
    except Exception as e:
        error_occurred(e, 
                      function="run_interactive_graph",
                      input_data_type=type(input_data).__name__,
                      thread_id=thread_id)
        return {"error": str(e)}


def resume_interactive_graph(answered_questions: List[Dict[str, str]], thread_id: str) -> Dict[str, Any]:
    """
    Resume an interrupted interactive graph with user answers.
    
    This function continues the conversation flow after the user has provided
    answers to clarifying questions, leading to the final answer generation.
    
    Args:
        answered_questions: List of answered questions from the user
        thread_id: Thread ID of the interrupted conversation
        
    Returns:
        Dictionary containing the final answer
    """
    try:
        # Log the resumption of graph execution
        flow_resumed(thread_id)

        # Get the interactive graph
        graph = create_interactive_graph()
        
        # Configure thread for state persistence
        config = {"configurable": {"thread_id": thread_id}}
        
        # Create a command to resume with user answers
        command = Command(resume={"answered_questions": answered_questions})
        
        # Resume the graph execution
        result = graph.invoke(command, config)  # type: ignore
        
        # Return the result directly as a dict
        return dict(result)
        
    except Exception as e:
        error_occurred(e,
                      function="resume_interactive_graph", 
                      thread_id=thread_id,
                      answered_questions_count=len(answered_questions))
        return {"error": str(e)}


def resume_with_choice(choice: str, answered_questions: List[Dict[str, str]], thread_id: str) -> Dict[str, Any]:
    """
    Resume an interrupted interactive graph with user choice.
    
    This function continues the conversation flow after the user has made a choice
    between getting more questions or proceeding to the final answer.
    
    Args:
        choice: User's choice ("more_questions" or "final_answer")
        answered_questions: List of answered questions from the user
        thread_id: Thread ID of the interrupted conversation
        
    Returns:
        Dictionary containing either new questions or the final answer
    """
    try:
        # Log the resumption of graph execution
        flow_resumed(thread_id)
        
        # Get the interactive graph
        graph = create_interactive_graph()
        
        # Configure thread for state persistence
        config = {"configurable": {"thread_id": thread_id}}
        # Create a command to resume with user choice
        command = Command(resume={
            "choice": choice,
            "answered_questions": answered_questions
        })
        
        # Resume the graph execution
        result = graph.invoke(command, config)  # type: ignore
        
        # Return the result directly as a dict
        return dict(result)
        
    except Exception as e:
        error_occurred(e,
                      function="resume_with_choice",
                      choice=choice,
                      thread_id=thread_id,
                      answered_questions_count=len(answered_questions))
        return {"error": str(e)}
