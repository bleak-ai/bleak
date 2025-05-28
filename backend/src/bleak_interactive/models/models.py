from pydantic import BaseModel
from typing import Optional, Union, List, Literal

class Answer(BaseModel):
    """Model for the answer"""
    answer: str

class DynamicQuestion(BaseModel):
    """Model for dynamic questions that can handle any UI element type"""
    type: str  # Dynamic type from bleak_elements
    question: str
    options: Optional[List[str]] = None  # Only present for choice-based elements

class StructuredQuestions(BaseModel):
    """Model for structured questions with dynamic types"""
    questions: List[DynamicQuestion]

class BleakElementType(BaseModel):
    name: str  # Name of the elements
    description: str  # Description of the element, has to be accurate so the AI knows what it does

# Legacy models for backward compatibility (if needed)
class RadioQuestion(BaseModel):
    """Legacy model for radio button questions"""
    type: Literal["radio"]
    question: str
    options: List[str]

class TextQuestion(BaseModel):
    """Legacy model for text input questions"""
    type: Literal["text"]
    question: str
