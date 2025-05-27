from typing import List, Union, Optional
from bleak_interactive.prompts import QUESTION_STRUCTURING_PROMPT
from langchain_core.tools import tool
from langchain_core.prompts import PromptTemplate
from ..llm_provider import LLMProvider
from ..configuration import Configuration
from ..models.models import StructuredQuestions, RadioQuestion, TextQuestion



@tool
def structure_questions_tool(
    questions: List[str], 
    original_prompt: str,
    config: Optional[Configuration] = None
) -> StructuredQuestions:
    """
    Convert simple questions into structured questions with appropriate UI component types.
    
    This tool analyzes each question and determines whether it should be:
    - A radio button question (multiple choice with predefined options)
    - A text input question (open-ended response)
    
    For radio questions, it generates 3-5 relevant options based on context.
    
    Args:
        questions: List of simple question strings to structure
        original_prompt: The original context/prompt that generated these questions
        config: Configuration object for LLM access (optional, will create default if None)
    
    Returns:
        StructuredQuestions object containing the structured questions with types and options
    """
    if not questions:
        return StructuredQuestions(questions=[])
    
    if config is None:
        config = Configuration()
    
    llm = LLMProvider.get_llm(config)
    llm_with_structured_output = llm.with_structured_output(StructuredQuestions)

    # Chain that structures questions
    chain = QUESTION_STRUCTURING_PROMPT | llm_with_structured_output

    result = chain.invoke({
        "original_prompt": original_prompt,
        "questions": questions
    })

    return result 