from pydantic import BaseModel, create_model
from typing import List, Union, Dict, Any, Type, get_args
from .models import BleakElementType, DynamicQuestion

def create_dynamic_question_schema(bleak_elements: List[BleakElementType]) -> Dict[str, Any]:
    """
    Create a JSON schema for questions based on bleak_elements.
    This is the recommended approach for with_structured_output with dynamic types.
    
    Args:
        bleak_elements: List of UI element types from frontend
        
    Returns:
        JSON schema dictionary
    """
    # Get all available element names
    element_names = [element.name for element in bleak_elements]
    
    # Create a single question schema that can handle any element type
    question_schema = {
        "type": "object",
        "properties": {
            "type": {
                "type": "string", 
                "enum": element_names  # Only allow types from bleak_elements
            },
            "question": {"type": "string"},
            "options": {
                "type": "array",
                "items": {"type": "string"},
                "minItems": 1
            }
        },
        "required": ["type", "question"],
        "additionalProperties": False
    }
    
    # Create the main schema
    schema = {
        "type": "object",
        "properties": {
            "questions": {
                "type": "array",
                "items": question_schema
            }
        },
        "required": ["questions"],
        "additionalProperties": False
    }
    
    return schema

def create_simple_dynamic_model(bleak_elements: List[BleakElementType]) -> Type[BaseModel]:
    """
    Create a simple dynamic model that can handle any question type.
    This is a fallback approach when JSON schema fails.
    
    Args:
        bleak_elements: List of UI element types from frontend
        
    Returns:
        StructuredQuestions model class
    """
    # Create the StructuredQuestions model using DynamicQuestion
    StructuredQuestions = create_model(
        'StructuredQuestions',
        questions=(List[DynamicQuestion], ...)
    )
    
    return StructuredQuestions 