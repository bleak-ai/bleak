from typing import Dict, Any, Optional, List
from .build_graph import create_interactive_graph
from langgraph.types import Command
from ..llm_provider import LLMProvider
from ..configuration import Configuration
from langchain_core.output_parsers import StrOutputParser
from ..prompts import (
    QUESTION_SUFFICIENCY_ASSESSMENT_PROMPT,
    ADDITIONAL_QUESTIONS_PROMPT
)

# Maximum number of questions allowed before forcing completion
MAX_QUESTIONS_LIMIT = 5


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
        print(f"Error in resume_interactive_graph: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}


def assess_question_sufficiency(
    original_prompt: str, 
    all_answered_questions: List[Dict[str, str]]
) -> Dict[str, Any]:
    """
    Assess whether we have sufficient information to provide a comprehensive answer.
    
    This function evaluates all previously answered questions (not just recent ones)
    and determines if more clarifying questions are needed. It enforces a maximum
    of 5 questions before automatically considering information sufficient.
    
    Args:
        original_prompt: The original user question
        all_answered_questions: List of ALL previously answered questions
        
    Returns:
        Dictionary containing assessment results and reasoning
    """
    try:
        config = Configuration()
        llm = LLMProvider.get_llm(config)
        
        total_questions = len(all_answered_questions)
        
        # Enforce maximum question limit
        if total_questions >= MAX_QUESTIONS_LIMIT:
            return {
                "needs_more_questions": False,
                "message": f"Maximum of {MAX_QUESTIONS_LIMIT} questions reached. I have enough information to provide a comprehensive answer.",
                "reason": "max_questions_reached"
            }
        
        # Format ALL answered questions for context
        all_answered_context = _format_answered_questions(all_answered_questions)
        
        # Create assessment chain
        chain = QUESTION_SUFFICIENCY_ASSESSMENT_PROMPT | llm | StrOutputParser()
        
        # Get assessment from LLM
        assessment_response = chain.invoke({
            "original_prompt": original_prompt,
            "all_answered_context": all_answered_context,
            "total_questions": total_questions
        }).strip().lower()

        print(f"Question sufficiency assessment for {total_questions} questions:")
        print(f"Original Prompt: {original_prompt}")
        print(f"Assessment Response: {assessment_response}")
        
        # Parse the assessment response
        needs_more = "need_more" in assessment_response
        
        return {
            "needs_more_questions": needs_more,
            "message": _extract_assessment_message(assessment_response, needs_more),
            "reason": "llm_assessment",
            "total_questions_answered": total_questions
        }
            
    except Exception as e:
        print(f"Error in assess_question_sufficiency: {e}")
        return {
            "needs_more_questions": False,
            "message": "I have enough information to provide an answer.",
            "error": str(e),
            "reason": "error_fallback"
        }


def generate_additional_questions(
    original_prompt: str, 
    all_answered_questions: List[Dict[str, str]]
) -> List[str]:
    """
    Generate additional clarifying questions based on the original prompt and ALL previous answers.
    
    This function creates new questions that fill gaps in the information,
    avoiding duplication with previously asked questions.
    
    Args:
        original_prompt: The original user question
        all_answered_questions: List of ALL previously answered questions
        
    Returns:
        List of new clarifying questions (maximum 3)
    """
    try:
        config = Configuration()
        llm = LLMProvider.get_llm(config)
        
        # Format ALL answered questions for context
        all_answered_context = _format_answered_questions(all_answered_questions)
        
        # Create question generation chain
        chain = ADDITIONAL_QUESTIONS_PROMPT | llm | StrOutputParser()
        
        # Generate new questions
        new_questions_text = chain.invoke({
            "original_prompt": original_prompt,
            "all_answered_context": all_answered_context
        })
        
        # Parse and clean the questions
        new_questions = _parse_questions_from_text(new_questions_text)
        
        print(f"Generated {len(new_questions)} additional questions")
        return new_questions[:3]  # Limit to 3 questions
        
    except Exception as e:
        print(f"Error in generate_additional_questions: {e}")
        return []


def generate_structured_questions_from_text(questions: List[str], original_prompt: str) -> Dict[str, Any]:
    """
    Convert text questions into structured questions for the UI.
    
    This function takes plain text questions and converts them into structured
    format with appropriate UI component types (radio buttons or text input).
    
    Args:
        questions: List of text questions to structure
        original_prompt: The original user prompt for context
        
    Returns:
        Dictionary containing structured questions ready for UI rendering
    """
    try:
        from ..tools import structure_questions_tool
        from ..configuration import Configuration
        
        config = Configuration()
        
        result = structure_questions_tool.invoke({
            "questions": questions,
            "original_prompt": original_prompt,
            "config": config
        })
        
        return {
            "structured_questions": [q.model_dump() for q in result.questions]
        }
        
    except Exception as e:
        print(f"Error in generate_structured_questions_from_text: {e}")
        # Fallback to text questions
        structured_questions = []
        for question in questions:
            structured_questions.append({
                "question": question,
                "type": "text"
            })
        return {
            "structured_questions": structured_questions
        }


# Helper functions for better code organization

def _format_answered_questions(answered_questions: List[Dict[str, str]]) -> str:
    """Format answered questions into a readable context string."""
    if not answered_questions:
        return "No questions have been answered yet."
    
    formatted_context = ""
    for i, q in enumerate(answered_questions, 1):
        formatted_context += f"{i}. Q: {q['question']}\n   A: {q['answer']}\n\n"
    
    return formatted_context.strip()


def _extract_assessment_message(assessment_response: str, needs_more: bool) -> str:
    """Extract a user-friendly message from the LLM assessment response."""
    if needs_more:
        if "explanation" in assessment_response.lower():
            # Try to extract explanation after the assessment
            parts = assessment_response.split("need_more", 1)
            if len(parts) > 1:
                explanation = parts[1].strip().strip(".:").strip()
                if explanation:
                    return f"I can provide a better answer with a bit more information. {explanation}"
        return "I can provide a better answer with a bit more information."
    else:
        return "I have enough information to provide a comprehensive answer."


def _parse_questions_from_text(questions_text: str) -> List[str]:
    """Parse questions from LLM-generated text, handling various formats."""
    # Split by lines and clean up
    lines = [line.strip() for line in questions_text.split('\n') if line.strip()]
    
    questions = []
    for line in lines:
        # Skip headers, numbers, or empty lines
        if (line.startswith('#') or 
            line.startswith('Question') or 
            line.lower().startswith('here are') or
            len(line) < 10):
            continue
        
        # Remove leading numbers or bullets
        cleaned_line = line
        if line[0].isdigit():
            # Remove "1. " or "1)" patterns
            cleaned_line = line.split('.', 1)[-1].split(')', 1)[-1].strip()
        elif line.startswith('- '):
            cleaned_line = line[2:].strip()
        elif line.startswith('* '):
            cleaned_line = line[2:].strip()
        
        if cleaned_line and len(cleaned_line) > 10:
            questions.append(cleaned_line)
    
    return questions


# Legacy function for backward compatibility
def check_if_more_questions_needed(
    original_prompt: str, 
    answered_questions: List[Dict[str, str]], 
    thread_id: str
) -> Dict[str, Any]:
    """
    Legacy function for backward compatibility.
    
    This function is deprecated. Use assess_question_sufficiency and 
    generate_additional_questions instead for better separation of concerns.
    """
    print("Warning: check_if_more_questions_needed is deprecated. Use assess_question_sufficiency instead.")
    
    # Use the new assessment function
    assessment = assess_question_sufficiency(original_prompt, answered_questions)
    
    if assessment["needs_more_questions"]:
        # Generate additional questions
        new_questions = generate_additional_questions(original_prompt, answered_questions)
        assessment["questions"] = new_questions
    
    return assessment 