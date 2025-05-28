from typing import List, Dict, Any
from langchain_core.output_parsers import JsonOutputParser
from langchain_openai import ChatOpenAI

from ..state import BleakState
from ..prompts import QUESTION_STRUCTURING_PROMPT
from ..models.models import DynamicQuestion, BleakElementType
from ..models.dynamic_models import create_dynamic_question_schema, create_simple_dynamic_model
from ..utils.logger import (
    node_start, node_info, node_success, node_warning, node_end, 
    ui_elements_mapped, llm_call, error_occurred
)
from ..configuration import Configuration
from ..llm_provider import LLMProvider

def structure_questions_node(state: BleakState, config: Configuration) -> BleakState:
    """
    Convert simple questions into structured questions with appropriate UI element types.
    Uses dynamic schema generation based on available bleak_elements.
    
    Args:
        state: Current state containing questions to structure
        config: Configuration object
        
    Returns:
        Updated state with structured questions
    """
    try:
        node_start("structure_questions_node", 2)
        
        # Check if we have questions to structure
        if not state.questions_to_ask:
            node_warning("No questions to structure")
            node_end("structure_questions_node", True)
            return state
        
        questions_count = len(state.questions_to_ask)
        bleak_elements_count = len(state.bleak_elements) if state.bleak_elements else 0
        
        node_info("Starting question structuring", 
                 questions_count=questions_count,
                 bleak_elements_count=bleak_elements_count)
        
        # Log available bleak elements
        if state.bleak_elements:
            node_info(f"Available UI elements: {', '.join([elem.name for elem in state.bleak_elements])}")
        else:
            node_warning("No bleak_elements provided, using fallback approach")
        
        llm = LLMProvider.get_llm(config)
        
        # Prepare bleak elements description for the prompt
        bleak_elements_text = ""
        if state.bleak_elements:
            for element in state.bleak_elements:
                bleak_elements_text += f"- {element.name}: {element.description}\n"
        else:
            bleak_elements_text = "- text: For open-ended text input\n- radio: For multiple choice questions\n"
        
        # Prepare prompt inputs
        prompt_inputs = {
            "original_prompt": state.prompt,
            "questions": state.questions_to_ask,
            "bleak_elements": bleak_elements_text
        }
        
        structured_questions = []
        
        try:
            # Try dynamic schema approach first
            if state.bleak_elements:
                node_info("Using dynamic JSON schema approach")
                
                # Create dynamic schema
                schema = create_dynamic_question_schema(state.bleak_elements)
                
                # Create chain with JSON schema
                chain = QUESTION_STRUCTURING_PROMPT | llm.with_structured_output(schema)
                
                # Log LLM invocation
                llm_call("QUESTION_STRUCTURING_PROMPT", f"JSON Schema with {questions_count} questions")
                
                # Invoke the chain
                result = chain.invoke(prompt_inputs)
                
                # Convert to DynamicQuestion objects
                if isinstance(result, dict) and "questions" in result:
                    for q_data in result["questions"]:
                        structured_questions.append(DynamicQuestion(
                            type=q_data["type"],
                            question=q_data["question"],
                            options=q_data.get("options")
                        ))
                
                node_success(f"Successfully structured {len(structured_questions)} questions using JSON schema")
                
            else:
                raise ValueError("No bleak_elements provided")
                
        except Exception as schema_error:
            node_warning(f"JSON schema approach failed: {str(schema_error)}")
            node_info("Falling back to dynamic Pydantic model approach")
            
            try:
                # Fallback to dynamic Pydantic model
                DynamicModel = create_simple_dynamic_model(state.bleak_elements or [])
                
                # Create chain with dynamic model
                chain = QUESTION_STRUCTURING_PROMPT | llm.with_structured_output(DynamicModel)
                
                # Log LLM invocation
                llm_call("QUESTION_STRUCTURING_PROMPT", f"Dynamic Model with {questions_count} questions")
                
                # Invoke the chain
                result = chain.invoke(prompt_inputs)
                
                structured_questions = result.questions if hasattr(result, 'questions') else []
                
                node_success(f"Successfully structured {len(structured_questions)} questions using dynamic model")
                
            except Exception as model_error:
                node_warning(f"Dynamic model approach failed: {str(model_error)}")
                node_info("Falling back to simple text questions")
                
                # Final fallback: create simple text questions
                if state.questions_to_ask:
                    for question in state.questions_to_ask:
                        structured_questions.append(DynamicQuestion(
                            type="text",
                            question=question,
                            options=None
                        ))
                
                node_success(f"Created {len(structured_questions)} fallback text questions")
        
        # Log the final UI element mapping
        if structured_questions:
            ui_elements_mapped(structured_questions)
        
        # Update state with structured questions
        state.structured_questions = structured_questions
        
        node_success(f"Node completed with {len(structured_questions)} structured questions")
        node_end("structure_questions_node", True)
        
        return state
        
    except Exception as e:
        error_occurred(e,
                      node="structure_questions_node",
                      questions_count=len(state.questions_to_ask) if state.questions_to_ask else 0,
                      bleak_elements_count=len(state.bleak_elements) if state.bleak_elements else 0)
        
        # Return state with fallback text questions
        fallback_questions = []
        if state.questions_to_ask:
            for question in state.questions_to_ask:
                fallback_questions.append(DynamicQuestion(
                    type="text",
                    question=question,
                    options=None
                ))
        
        state.structured_questions = fallback_questions
        node_end("structure_questions_node", False)
        return state