from typing import List, Union, Optional
from langchain_core.tools import tool
from langchain_core.prompts import PromptTemplate
from ..llm_provider import LLMProvider
from ..configuration import Configuration
from ..models.models import StructuredQuestions, RadioQuestion, TextQuestion

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