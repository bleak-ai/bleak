from pydantic import BaseModel
from ..state import BleakState
from ..prompts import QUESTION_GENERATOR_PROMPT
from ..llm_provider import LLMProvider
from ..configuration import Configuration
from ..utils.logger import node_start, node_info, node_success, node_end, questions_generated, llm_call, error_occurred

mockQuestions = [
    "When you say 'best,' what qualities are you prioritizing? (e.g., natural beauty, historical significance, affordability, food, nightlife, etc.)", 
    "What time of year are you planning to visit, or are you looking for a region that's enjoyable year-round?",
    "Are you looking for a region for a specific type of trip (e.g., family vacation, romantic getaway, solo adventure, etc.)?"]


class Questions(BaseModel):
    """Model for the questions to ask"""
    questions: list[str]

def clarify_node(state: BleakState, config: Configuration) -> BleakState:
    """
    Node that generates clarifying questions instead of an answer.

    Args:
        state: Current graph state
        config: Configuration object

    Returns:
        Updated state with follow-up questions
    """
    try:
        node_start("clarify_node", 1)
        
        prompt = state.prompt
        node_info("Processing user prompt", prompt_length=len(prompt))
        
        # Check for previous questions
        previous_questions = state.all_previous_questions
        if previous_questions:
            node_info("Found previous questions", count=len(previous_questions))
        
        # Set up LLM
        llm = LLMProvider.get_llm(config)
        llm_with_structured_output = llm.with_structured_output(Questions)
        
        # Chain that generates questions
        chain = QUESTION_GENERATOR_PROMPT | llm_with_structured_output
        
        # Call LLM
        llm_call("QUESTION_GENERATOR_PROMPT", f"prompt + {len(previous_questions)} previous questions")
        result = chain.invoke({"prompt": prompt, "previous_questions": previous_questions})

        # Log the generated questions
        questions_generated(result.questions)
        
        # Update state
        state.questions_to_ask = result.questions
        
        node_success(f"Generated {len(result.questions)} clarifying questions")
        node_end("clarify_node", True)
        
        return state
        
    except Exception as e:
        error_occurred(e, 
                      node="clarify_node",
                      prompt_length=len(state.prompt) if state.prompt else 0,
                      previous_questions_count=len(state.all_previous_questions) if state.all_previous_questions else 0)
        node_end("clarify_node", False)
        return state
