from langchain_core.output_parsers import StrOutputParser
from ..state import BleakState
from ..prompts import ANSWER_PROMPT, RATING_PROMPT
from ..llm_provider import LLMProvider
from ..configuration import Configuration


def rating_node(state: BleakState, config: Configuration) -> BleakState:
    """
    Node that rates the answer's accuracy

    Args:
        state: Current graph state
        config: Configuration object

    Returns:
        Updated state
    """
    # 1. Extract relevant data from state
    if not state.answer:
        return state

    # 2. Process the data
    llm = LLMProvider.get_llm(config)
    chain = RATING_PROMPT | llm | StrOutputParser()
    
    rating_text = chain.invoke({
        "prompt": state.prompt,
        "answer": state.answer
    })

    # 3. Update state
    try:
        rating = float(rating_text.strip())
        rating = min(max(rating, 0.0), 1.0)  # Ensure rating is between 0 and 1
    except ValueError:
        rating = 0.0
    
    # state.intermediate_results.append(
    #     IntermediateResult(step="rating", result=rating)
    # )
    state.rating = rating
    
    return state 