from pydantic import BaseModel
from ..state import BleakState
from ..prompts import QUESTION_GENERATOR_PROMPT
from ..llm_provider import LLMProvider
from ..configuration import Configuration

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
    prompt = state.prompt
    llm = LLMProvider.get_llm(config)
    llm_with_structured_output = llm.with_structured_output(Questions)

    # Chain that generates questions - removed StrOutputParser since we want the Questions object
    chain = QUESTION_GENERATOR_PROMPT | llm_with_structured_output


    previous_questions = state.all_previous_questions
    result = chain.invoke({"prompt": prompt, "previous_questions": previous_questions})

    print("Clarify node result", result)

    # result = {
    #     "questions": mockQuestions
    # }

    state.questions_to_ask = result.questions

    return state
