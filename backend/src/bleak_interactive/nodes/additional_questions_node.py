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
from ..utils.logger import (
    node_start, node_info, node_success, node_warning, node_end,
    questions_generated, llm_call, error_occurred
)

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
    
    try:
        node_start("additional_questions_node", 4)
        
        # Log node execution
        node_info("Evaluating need for additional questions",
                 answered_questions_count=len(state.answered_questions),
                 total_previous_questions=len(state.all_previous_questions))
        
        # First, assess if more questions are actually needed
        node_info("Assessing if more questions are needed...")
        assessment = assess_question_sufficiency(
            state.prompt, 
            state.answered_questions
        )
        
        # If no more questions are needed, skip question generation
        if not assessment.get("needs_more_questions", False):
            node_success(f"No more questions needed: {assessment.get('reason', 'unknown')}")
            # Set questions_to_ask to empty to skip the structure_questions_node
            state.questions_to_ask = []
            node_end("additional_questions_node", True)
            return state
        
        node_info("Generating additional questions...")
        # Generate additional questions that are different from previous ones
        new_questions = generate_additional_questions(
            state.prompt,
            state.answered_questions
        )
        
        node_info(f"Generated {len(new_questions)} new questions, filtering duplicates...")
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
        
        # Log the generated questions
        if filtered_questions:
            questions_generated(filtered_questions)
        
        node_success(f"Generated {len(filtered_questions)} unique additional questions")
        node_end("additional_questions_node", True)
        
        return state
        
    except Exception as e:
        error_occurred(e,
                      node="additional_questions_node",
                      answered_questions_count=len(state.answered_questions))
        
        # Fallback: no additional questions
        state.questions_to_ask = []
        node_end("additional_questions_node", False)
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
        
        node_info(f"Assessing sufficiency: {total_questions}/{MAX_QUESTIONS_LIMIT} questions answered")
        
        # Enforce maximum question limit
        if total_questions >= MAX_QUESTIONS_LIMIT:
            node_warning(f"Maximum question limit reached ({MAX_QUESTIONS_LIMIT})")
            return {
                "needs_more_questions": False,
                "message": f"Maximum of {MAX_QUESTIONS_LIMIT} questions reached. I have enough information to provide a comprehensive answer.",
                "reason": "max_questions_reached"
            }
        
        # Format ALL answered questions for context
        all_answered_context = _format_answered_questions(all_answered_questions)
        
        # Create assessment chain
        chain = QUESTION_SUFFICIENCY_ASSESSMENT_PROMPT | llm | StrOutputParser()
        
        # Prepare inputs for LLM
        inputs = {
            "original_prompt": original_prompt,
            "all_answered_context": all_answered_context,
            "total_questions": total_questions
        }
        
        # Log LLM invocation
        llm_call("QUESTION_SUFFICIENCY_ASSESSMENT", f"{total_questions} answered questions")
        
        # Get assessment from LLM
        assessment_response = chain.invoke(inputs).strip().lower()

        node_info(f"LLM Assessment: {assessment_response[:100]}...")
        
        # Parse the assessment response
        needs_more = "need_more" in assessment_response
        
        if needs_more:
            node_info("Assessment: More questions needed")
        else:
            node_success("Assessment: Sufficient information available")
        
        return {
            "needs_more_questions": needs_more,
            "message": _extract_assessment_message(assessment_response, needs_more),
            "reason": "llm_assessment",
            "total_questions_answered": total_questions
        }
            
    except Exception as e:
        error_occurred(e, function="assess_question_sufficiency")
        # Fallback: assume we need more questions if assessment fails
        return {
            "needs_more_questions": True,
            "message": "Unable to assess question sufficiency. Proceeding with additional questions.",
            "reason": "assessment_error"
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

        node_info("Generating additional questions based on previous answers...")
        
        # Format ALL answered questions for context
        all_answered_context = _format_answered_questions(all_answered_questions)
        
        # Create question generation chain
        chain = ADDITIONAL_QUESTIONS_PROMPT | llm_with_structured_output 
        
        # Prepare inputs
        inputs = {
            "original_prompt": original_prompt,
            "all_answered_context": all_answered_context
        }
        
        # Log LLM invocation
        llm_call("ADDITIONAL_QUESTIONS_PROMPT", "Generating additional questions")
        
        # Generate new questions
        result = chain.invoke(inputs)
        
        # Extract questions from result
        if hasattr(result, 'questions'):
            questions = result.questions
        elif isinstance(result, dict) and 'questions' in result:
            questions = result['questions']
        else:
            node_warning(f"Unexpected result format: {type(result)}")
            questions = []
        
        node_success(f"Generated {len(questions)} additional questions")
        for i, q in enumerate(questions, 1):
            node_info(f"  {i}. {q[:80]}...")
        
        return questions
        
    except Exception as e:
        error_occurred(e, function="generate_additional_questions")
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