from warnings import catch_warnings

from bleak_interactive.llm_provider import LLMProvider
from bleak_interactive.models.models import StructuredQuestions
from bleak_interactive.prompts import QUESTION_STRUCTURING_PROMPT
from ..state import BleakState
from ..configuration import Configuration

def structure_questions_node(state: BleakState, config: Configuration) -> BleakState:
    """
    Node that transforms simple questions into structured questions with types.
    Uses the structure_questions_tool to determine appropriate UI component types.

    Args:
        state: Current graph state
        config: Configuration object

    Returns:
        Updated state with structured questions
    """
    print("state structure_questions_node", state)
    try:
        if not state.questions_to_ask:
            return state
        
        # llm = LLMProvider.get_llm(config)
        # llm_with_structured_output = llm.with_structured_output(StructuredQuestions)

        # # Chain that structures questions
        # chain = QUESTION_STRUCTURING_PROMPT | llm_with_structured_output

        # result = chain.invoke({
        #     "original_prompt": state.prompt,
        #     "questions": state.questions_to_ask
        # })

        print("questions to ask", state.questions_to_ask)
        
        llm = LLMProvider.get_llm(config)
        llm_with_structured_output = llm.with_structured_output(StructuredQuestions)

        # Chain that structures questions
        chain = QUESTION_STRUCTURING_PROMPT | llm_with_structured_output

        result = chain.invoke({
            "original_prompt": state.prompt,
            "questions": state.questions_to_ask
        })

        print("structure_questions", result)

        # Replace simple questions with structured ones
        state.structured_questions = result.questions

        return state 
    except Exception as e:
        print(f"Error in structured questions node: {e}")
        return state