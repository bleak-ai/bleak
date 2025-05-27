from bleak_interactive.nodes.clarify_node import Questions
from ..state import BleakState
from ..configuration import Configuration
from ..prompts import (
    QUESTION_SUFFICIENCY_ASSESSMENT_PROMPT,
    ADDITIONAL_QUESTIONS_PROMPT
)
from ..llm_provider import LLMProvider
from ..configuration import Configuration
from langchain_core.output_parsers import StrOutputParser
from typing import Dict, Any, Optional, List

# Maximum number of questions allowed before forcing completion
MAX_QUESTIONS_LIMIT = 5

def additional_questions_node(state: BleakState, config: Configuration) -> BleakState:
    """
    Node that generates additional clarifying questions based on the original prompt
    and previously answered questions. Ensures new questions are different from previous ones.
    
    Args:
        state: Current graph state containing original prompt and answered questions
        config: Configuration object
        
    Returns:
        Updated state with new questions to ask
    """
    
    # First, assess if more questions are actually needed
    assessment = assess_question_sufficiency(
        state.prompt, 
        state.answered_questions
    )
    
    # If no more questions are needed, skip question generation
    if not assessment.get("needs_more_questions", False):
        # Set questions_to_ask to empty to skip the structure_questions_node
        state.questions_to_ask = []
        return state
    
    # Generate additional questions that are different from previous ones
    new_questions = generate_additional_questions(
        state.prompt,
        state.answered_questions
    )
    
    # Filter out questions that are too similar to previously asked questions
    filtered_questions = []
    for new_q in new_questions:
        is_duplicate = False
        for prev_q in state.all_previous_questions:
            # Simple similarity check - could be enhanced with more sophisticated matching
            if _questions_are_similar(new_q.lower(), prev_q.lower()):
                is_duplicate = True
                break
        
        if not is_duplicate:
            filtered_questions.append(new_q)
    
    # Update state with new questions
    state.questions_to_ask = filtered_questions
    
    # Add new questions to the list of all previous questions
    state.all_previous_questions.extend(filtered_questions)
    
    return state


def _questions_are_similar(q1: str, q2: str, threshold: float = 0.7) -> bool:
    """
    Simple similarity check between two questions.
    
    Args:
        q1: First question
        q2: Second question
        threshold: Similarity threshold (0.0 to 1.0)
        
    Returns:
        True if questions are considered similar
    """
    # Simple word overlap check
    words1 = set(q1.split())
    words2 = set(q2.split())
    
    if not words1 or not words2:
        return False
    
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    
    similarity = len(intersection) / len(union)
    return similarity >= threshold 


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
        llm_with_structured_output = llm.with_structured_output(Questions)

        
        # Format ALL answered questions for context
        all_answered_context = _format_answered_questions(all_answered_questions)
        
        # Create question generation chain
        chain = ADDITIONAL_QUESTIONS_PROMPT | llm_with_structured_output 
        
        # Generate new questions
        result = chain.invoke({
            "original_prompt": original_prompt,
            "all_answered_context": all_answered_context
        })
        
        # Parse and clean the questions
        # new_questions = _parse_questions_from_text(new_questions_text)
        
        new_questions = result.questions
        print("new questions", new_questions)
        print(f"Generated {len(new_questions)} additional questions")
        return new_questions[:3]  # Limit to 3 questions
        
    except Exception as e:
        print(f"Error in generate_additional_questions: {e}")
        return []



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