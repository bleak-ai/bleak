from langchain_core.output_parsers import StrOutputParser
from ..state import BleakState
from ..prompts import ANSWER_PROMPT
from ..llm_provider import LLMProvider
from ..configuration import Configuration
from ..models.models import Answer
from ..utils.logger import (
    node_start, node_info, node_success, node_end, 
    final_answer, llm_call, error_occurred
)

def answer_node(state: BleakState, config: Configuration) -> BleakState:
    """
    Node that generates an answer to the user's prompt

    Args:
        state: Current graph state
        config: Configuration object

    Returns:
        Updated state
    """
    try:
        node_start("answer_node", 4)
        
        # Extract relevant data from state
        prompt = state.prompt
        node_info("Generating final answer", 
                 prompt_length=len(prompt),
                 answered_questions_count=len(state.answered_questions))

        # Process the data
        llm = LLMProvider.get_llm(config)
        chain = ANSWER_PROMPT | llm | StrOutputParser()
        
        # Call LLM to generate answer
        llm_call("ANSWER_PROMPT", f"prompt + {len(state.answered_questions)} answered questions")
        answer_text = chain.invoke({"prompt": prompt})

        state.answer = answer_text
        
        # Log the final answer
        final_answer(answer_text)
        
        node_success("Final answer generated successfully")
        node_end("answer_node", True)
        
        return state
        
    except Exception as e:
        error_occurred(e,
                      node="answer_node",
                      prompt_length=len(state.prompt) if state.prompt else 0,
                      answered_questions_count=len(state.answered_questions))
        node_end("answer_node", False)
        return state

