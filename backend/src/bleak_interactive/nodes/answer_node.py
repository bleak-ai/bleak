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
        answered_questions = state.answered_questions
        
        node_info("Generating final answer", 
                 prompt_length=len(prompt),
                 answered_questions_count=len(answered_questions))

        # Format answered questions for the prompt
        answered_questions_context = _format_answered_questions_for_answer(answered_questions)

        # Process the data
        llm = LLMProvider.get_llm(config)
        chain = ANSWER_PROMPT | llm | StrOutputParser()
        
        # Call LLM to generate answer
        llm_call("ANSWER_PROMPT", f"prompt + {len(answered_questions)} answered questions")
        answer_text = chain.invoke({
            "prompt": prompt,
            "answered_questions_context": answered_questions_context
        })

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


def _format_answered_questions_for_answer(answered_questions):
    """
    Format answered questions into a readable context string for the answer prompt.
    
    Args:
        answered_questions: List of dictionaries with 'question' and 'answer' keys
        
    Returns:
        Formatted string with questions and answers
    """
    if not answered_questions:
        return "No clarifying questions were answered."
    
    formatted_context = ""
    for i, qa in enumerate(answered_questions, 1):
        formatted_context += f"{i}. Question: {qa['question']}\n"
        formatted_context += f"   Answer: {qa['answer']}\n\n"
    
    return formatted_context.strip()

