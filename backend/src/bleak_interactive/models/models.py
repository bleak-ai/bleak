from pydantic import BaseModel
from typing import Optional, Union, List, Literal

class Answer(BaseModel):
    """Model for the answer and its rating"""
    answer: str
    rating: float

class RadioQuestion(BaseModel):
    """Model for radio button questions"""
    type: Literal["radio"]
    question: str
    options: List[str]

class TextQuestion(BaseModel):
    """Model for text input questions"""
    type: Literal["text"]
    question: str

class StructuredQuestions(BaseModel):
    """Model for structured questions with types"""
    questions: List[Union[RadioQuestion, TextQuestion]]