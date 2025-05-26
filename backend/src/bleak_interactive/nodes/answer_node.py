from langchain_core.output_parsers import StrOutputParser
from ..state import BleakState
from ..prompts import ANSWER_PROMPT, RATING_PROMPT
from ..llm_provider import LLMProvider
from ..configuration import Configuration
from ..models.models import Answer

def answer_node(state: BleakState, config: Configuration) -> BleakState:
    """
    Node that generates an answer to the user's prompt

    Args:
        state: Current graph state
        config: Configuration object

    Returns:
        Updated state
    """
    # 1. Extract relevant data from state
    prompt = state.prompt

    # 2. Process the data
    llm = LLMProvider.get_llm(config)
    chain = ANSWER_PROMPT | llm | StrOutputParser()
    
    answer_text = chain.invoke({"prompt": prompt})

    state.answer = answer_text
    
    return state

