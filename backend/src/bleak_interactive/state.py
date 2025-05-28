from dataclasses import dataclass, field
from typing import List, Optional, Union, Dict
from typing_extensions import Annotated
import operator
from .models.models import Answer, BleakElementType, DynamicQuestion

# Main state class
@dataclass(kw_only=True)
class BleakState:
    """Main state for the bleak graph"""
    prompt: str = field(default="What is the best region in Europe?")
    intermediate_results: Annotated[list, operator.add] = field(default_factory=list)
    answer: Optional[str] = field(default=None)
    questions_to_ask: Optional[List[str]] = field(default=None)
    structured_questions: Optional[List[DynamicQuestion]] = field(default=None)
    answered_questions: List[Dict[str, str]] = field(default_factory=list)
    user_choice: Optional[str] = field(default=None)  # "more_questions" or "final_answer"
    all_previous_questions: List[str] = field(default_factory=list)  # Track all questions asked to avoid duplicates
    bleak_elements: List[BleakElementType]
    metadata: dict = field(default_factory=dict)

# Input state
@dataclass(kw_only=True)
class BleakStateInput:
    """Input state definition"""
    prompt: str = field(default="")
    bleak_elements: List[BleakElementType]
    metadata: dict = field(default_factory=dict)

# Output state
@dataclass(kw_only=True)
class BleakStateOutput:
    """Output state definition"""
    # For questions workflow
    structured_questions: List[DynamicQuestion] = field(default_factory=list)
    # For answer workflow
    answer: Optional[str] = field(default=None)



