from ..state import BleakState
from ..llm_provider import LLMProvider
from ..configuration import Configuration
from ..models.models import StructuredQuestions
from langchain_core.prompts import PromptTemplate

QUESTION_STRUCTURING_PROMPT = PromptTemplate.from_template(
    """You are a UX expert that converts questions into appropriate UI components.

Given a list of questions, classify each one as either:
1. "radio" - Multiple choice questions where users select from predefined options
2. "text" - Open-ended questions requiring free text input

For radio questions, generate 3-5 relevant options based on the question context.
For text questions, just provide the question as-is.

Original context: {original_prompt}
Questions to structure: {questions}

Guidelines:
- Use "radio" for questions about preferences, categories, locations, or choices with limited options
- Use "text" for questions requiring specific details, names, numbers, or open-ended responses
- Generate realistic, helpful options for radio questions
- Keep questions clear and concise
"""
)

def structure_questions_node(state: BleakState, config: Configuration) -> BleakState:
    """
    Node that transforms simple questions into structured questions with types.

    Args:
        state: Current graph state
        config: Configuration object

    Returns:
        Updated state with structured questions
    """
    if not state.questions_to_ask:
        return state
    
    llm = LLMProvider.get_llm(config)
    llm_with_structured_output = llm.with_structured_output(StructuredQuestions)

    # Chain that structures questions
    chain = QUESTION_STRUCTURING_PROMPT | llm_with_structured_output

    result = chain.invoke({
        "original_prompt": state.prompt,
        "questions": state.questions_to_ask
    })

    # Replace simple questions with structured ones
    state.structured_questions = result.questions

    return state 