import json
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
from colorama import Fore, Back, Style, init
from ..models.models import BleakElementType, DynamicQuestion

# Initialize colorama for cross-platform colored output
# init(autoreset=True)

class BleakLogger:
    """Enhanced logger for Bleak Interactive with clean, visual output for graph flow tracking."""
    
    def __init__(self, name: str = "bleak_interactive"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        # Remove existing handlers to avoid duplicates
        for handler in self.logger.handlers[:]:
            self.logger.removeHandler(handler)
        
        # Create console handler with minimal formatter
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        
        # Minimal formatter - just the message
        formatter = logging.Formatter('%(message)s')
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)
        
        # Track current step for flow visualization
        self.current_step = 0
    
    def _print(self, message: str):
        """Print message directly without log level prefixes."""
        print(message)
    
    def flow_start(self, prompt: str):
        """Start of graph execution flow."""
        self._print(f"\n{Fore.MAGENTA}{'='*80}")
        self._print(f"{Fore.MAGENTA}🚀 BLEAK INTERACTIVE GRAPH EXECUTION STARTED")
        self._print(f"{Fore.MAGENTA}{'='*80}")
        self._print(f"{Fore.CYAN}📝 User Prompt: {Fore.WHITE}{prompt[:100]}{'...' if len(prompt) > 100 else ''}")
        self._print(f"{Fore.MAGENTA}{'='*80}{Style.RESET_ALL}\n")
    
    def node_start(self, node_name: str, step_number: Optional[int] = None):
        """Log the start of a node execution."""
        if step_number:
            self.current_step = step_number
        else:
            self.current_step += 1
            
        node_display_names = {
            "clarify_node": "CLARIFY QUESTIONS",
            "structure_questions_node": "STRUCTURE UI ELEMENTS", 
            "choice_node": "USER CHOICE",
            "additional_questions_node": "ADDITIONAL QUESTIONS",
            "answer_node": "GENERATE ANSWER",
            "wait_for_human": "WAIT FOR USER"
        }
        
        display_name = node_display_names.get(node_name, node_name.upper())
        
        self._print(f"{Fore.YELLOW}┌─ STEP {self.current_step}: {display_name}")
        self._print(f"{Fore.YELLOW}│")
    
    def node_info(self, message: str, **data):
        """Log information within a node."""
        self._print(f"{Fore.YELLOW}│ {Fore.GREEN}✓ {message}")
        if data:
            for key, value in data.items():
                if isinstance(value, list):
                    self._print(f"{Fore.YELLOW}│   {Fore.BLUE}{key}: {len(value)} items")
                elif isinstance(value, str) and len(value) > 60:
                    self._print(f"{Fore.YELLOW}│   {Fore.BLUE}{key}: {value[:60]}...")
                else:
                    self._print(f"{Fore.YELLOW}│   {Fore.BLUE}{key}: {value}")
    
    def node_success(self, message: str):
        """Log successful completion of a node step."""
        self._print(f"{Fore.YELLOW}│ {Fore.GREEN}✅ {message}")
    
    def node_warning(self, message: str):
        """Log a warning within a node."""
        self._print(f"{Fore.YELLOW}│ {Fore.YELLOW}⚠️  {message}")
    
    def node_error(self, message: str):
        """Log an error within a node."""
        self._print(f"{Fore.YELLOW}│ {Fore.RED}❌ {message}")
    
    def node_end(self, node_name: str, success: bool = True):
        """Log the end of a node execution."""
        status = "✅ COMPLETED" if success else "❌ FAILED"
        self._print(f"{Fore.YELLOW}└─ {Fore.GREEN if success else Fore.RED}{status}")
        self._print("")
    
    def questions_generated(self, questions: List[str]):
        """Log generated questions in a clean format."""
        self._print(f"{Fore.YELLOW}│ {Fore.CYAN}📋 Generated {len(questions)} questions:")
        for i, question in enumerate(questions, 1):
            self._print(f"{Fore.YELLOW}│   {Fore.WHITE}{i}. {question}")
    
    def ui_elements_mapped(self, structured_questions: List[DynamicQuestion]):
        """Log UI element mapping in a clean format."""
        self._print(f"{Fore.YELLOW}│ {Fore.CYAN}🎯 UI Element Mapping:")
        for i, sq in enumerate(structured_questions, 1):
            self._print(f"{Fore.YELLOW}│   {Fore.WHITE}{i}. [{Fore.MAGENTA}{sq.type.upper()}{Fore.WHITE}] {sq.question}")
            if sq.options:
                self._print(f"{Fore.YELLOW}│      {Fore.BLUE}Options: {', '.join(sq.options[:3])}{'...' if len(sq.options) > 3 else ''}")
    
    def user_answers_received(self, answers: List[Dict[str, str]]):
        """Log user answers in a clean format."""
        self._print(f"{Fore.YELLOW}│ {Fore.CYAN}💬 User Answers Received:")
        for i, answer in enumerate(answers, 1):
            question = answer.get('question', 'Unknown')[:50]
            user_answer = answer.get('answer', 'No answer')
            self._print(f"{Fore.YELLOW}│   {Fore.WHITE}{i}. Q: {question}{'...' if len(answer.get('question', '')) > 50 else ''}")
            self._print(f"{Fore.YELLOW}│      {Fore.GREEN}A: {user_answer}")
    
    def user_choice_received(self, choice: str):
        """Log user choice in a clean format."""
        choice_display = {
            "more_questions": "🔄 Ask More Questions",
            "final_answer": "🎯 Generate Final Answer"
        }
        display = choice_display.get(choice, choice)
        self._print(f"{Fore.YELLOW}│ {Fore.CYAN}🎯 User Choice: {Fore.WHITE}{display}")
    
    def llm_call(self, prompt_name: str, input_summary: str = ""):
        """Log LLM invocation in a clean format."""
        self._print(f"{Fore.YELLOW}│ {Fore.BLUE}🤖 LLM Call: {prompt_name}")
        if input_summary:
            self._print(f"{Fore.YELLOW}│   {Fore.BLUE}Input: {input_summary}")
    
    def final_answer(self, answer: str):
        """Log the final answer."""
        self._print(f"{Fore.GREEN}{'='*80}")
        self._print(f"{Fore.GREEN}🎉 FINAL ANSWER GENERATED")
        self._print(f"{Fore.GREEN}{'='*80}")
        self._print(f"{Fore.WHITE}{answer}")
        self._print(f"{Fore.GREEN}{'='*80}{Style.RESET_ALL}\n")
    
    def flow_interrupted(self, reason: str, data: Optional[Dict[str, Any]] = None):
        """Log when the flow is interrupted for user input."""
        self._print(f"{Fore.YELLOW}│ {Fore.MAGENTA}⏸️  FLOW INTERRUPTED: {reason}")
        if data:
            self._print(f"{Fore.YELLOW}│   {Fore.BLUE}Waiting for: {', '.join(data.keys())}")
        self._print(f"{Fore.YELLOW}└─ {Fore.MAGENTA}⏳ WAITING FOR USER INPUT...")
        self._print("")
    
    def flow_resumed(self, thread_id: str):
        """Log when the flow is resumed."""
        self._print(f"\n{Fore.MAGENTA}{'='*80}")
        self._print(f"{Fore.MAGENTA}▶️  GRAPH EXECUTION RESUMED")
        self._print(f"{Fore.MAGENTA}Thread ID: {thread_id}")
        self._print(f"{Fore.MAGENTA}{'='*80}{Style.RESET_ALL}\n")
    
    def error_occurred(self, error: Exception, context: Optional[Dict[str, Any]] = None):
        """Log errors in a clean format."""
        self._print(f"{Fore.RED}{'='*80}")
        self._print(f"{Fore.RED}💥 ERROR OCCURRED")
        self._print(f"{Fore.RED}{'='*80}")
        self._print(f"{Fore.RED}Error: {type(error).__name__}")
        self._print(f"{Fore.RED}Message: {str(error)}")
        if context:
            self._print(f"{Fore.RED}Context:")
            for key, value in context.items():
                self._print(f"{Fore.RED}  {key}: {value}")
        self._print(f"{Fore.RED}{'='*80}{Style.RESET_ALL}\n")

# Global logger instance
bleak_logger = BleakLogger()

# Convenience functions for easy use in nodes
def flow_start(prompt: str):
    """Start graph execution flow."""
    bleak_logger.flow_start(prompt)

def node_start(node_name: str, step_number: Optional[int] = None):
    """Start node execution."""
    bleak_logger.node_start(node_name, step_number)

def node_info(message: str, **data):
    """Log node information."""
    bleak_logger.node_info(message, **data)

def node_success(message: str):
    """Log node success."""
    bleak_logger.node_success(message)

def node_warning(message: str):
    """Log node warning."""
    bleak_logger.node_warning(message)

def node_error(message: str):
    """Log node error."""
    bleak_logger.node_error(message)

def node_end(node_name: str, success: bool = True):
    """End node execution."""
    bleak_logger.node_end(node_name, success)

def questions_generated(questions: List[str]):
    """Log generated questions."""
    bleak_logger.questions_generated(questions)

def ui_elements_mapped(structured_questions: List[DynamicQuestion]):
    """Log UI element mapping."""
    bleak_logger.ui_elements_mapped(structured_questions)

def user_answers_received(answers: List[Dict[str, str]]):
    """Log user answers."""
    bleak_logger.user_answers_received(answers)

def user_choice_received(choice: str):
    """Log user choice."""
    bleak_logger.user_choice_received(choice)

def llm_call(prompt_name: str, input_summary: str = ""):
    """Log LLM call."""
    bleak_logger.llm_call(prompt_name, input_summary)

def final_answer(answer: str):
    """Log final answer."""
    bleak_logger.final_answer(answer)

def flow_interrupted(reason: str, data: Optional[Dict[str, Any]] = None):
    """Log flow interruption."""
    bleak_logger.flow_interrupted(reason, data)

def flow_resumed(thread_id: str):
    """Log flow resumption."""
    bleak_logger.flow_resumed(thread_id)

def error_occurred(error: Exception, **context):
    """Log error with context."""
    bleak_logger.error_occurred(error, context if context else None)

# Legacy function names for backward compatibility
def log_bleak_elements(elements: List[BleakElementType]):
    """Log available bleak elements (legacy)."""
    node_info(f"Available UI elements: {len(elements)}")
    for elem in elements:
        node_info(f"  - {elem.name}: {elem.description}")

def log_question_mapping(questions: List[str], structured_questions: List[DynamicQuestion]):
    """Log question to UI element mapping (legacy)."""
    questions_generated(questions)
    ui_elements_mapped(structured_questions)

def log_llm_invocation(prompt_name: str, inputs: Dict[str, Any], result: Any):
    """Log LLM invocation details (legacy)."""
    input_summary = f"{len(inputs)} inputs"
    if "questions" in inputs:
        input_summary += f", {len(inputs['questions'])} questions"
    llm_call(prompt_name, input_summary)

def log_node_execution(node_name: str, **state_data):
    """Log node execution (legacy)."""
    node_info("Node execution started", **state_data)

def log_error_with_context(error: Exception, **context):
    """Log error with context (legacy)."""
    bleak_logger.error_occurred(error, context if context else None) 