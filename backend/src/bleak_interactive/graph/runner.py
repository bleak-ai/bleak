from typing import Dict, Any, Optional
from .build_graph import create_interactive_graph
from langgraph.types import Command
from ..llm_provider import LLMProvider
from ..configuration import Configuration
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate



def run_interactive_graph(input_data: Dict[str, Any], thread_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Run the interactive graph with human-in-the-loop capabilities
    
    Args:
        input_data: Dictionary containing the input data or Command for resuming
        thread_id: Thread ID for maintaining conversation state
        
    Returns:
        Dictionary containing the graph execution results
    """
    try:
        # Get the interactive graph
        graph = create_interactive_graph()
        
        # Configure thread for state persistence
        config = {"configurable": {"thread_id": thread_id or "default_thread"}}
        
        # Check if this is a resume command with user answers
        if isinstance(input_data, dict) and "resume_with_answers" in input_data:
            # This is a resume operation with user answers
            user_answers = input_data["resume_with_answers"]
            command = Command(resume={"answered_questions": user_answers})
            result = graph.invoke(command, config)  # type: ignore
        else:
            # This is a new conversation or continuation
            result = graph.invoke(input_data, config)  # type: ignore
        
        return result
    except Exception as e:
        return {"error": str(e)}

def resume_interactive_graph(answered_questions: list, thread_id: str) -> Dict[str, Any]:
    """
    Resume an interrupted interactive graph with user answers
    
    Args:
        answered_questions: List of answered questions from the user
        thread_id: Thread ID of the interrupted conversation
        
    Returns:
        Dictionary containing the final answer and rating
    """
    try:
        # Get the interactive graph
        graph = create_interactive_graph()
        
        # Configure thread for state persistence
        config = {"configurable": {"thread_id": thread_id}}
        
        # Create a command to resume with user answers
        command = Command(resume={"answered_questions": answered_questions})
        
        # Resume the graph execution
        result = graph.invoke(command, config)  # type: ignore
        
        # Return the result directly as a dict
        return dict(result)
        
    except Exception as e:
        print(f"Error in resume_interactive_graph: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

def check_if_more_questions_needed(
    original_prompt: str, 
    answered_questions: list, 
    thread_id: str
) -> Dict[str, Any]:
    """
    Check if more clarifying questions are needed or if we have enough information
    to provide a comprehensive answer.
    
    Args:
        original_prompt: The original user question
        answered_questions: List of previously answered questions
        thread_id: Thread ID for context
        
    Returns:
        Dictionary containing whether more questions are needed and potential new questions
    """
    try:
        config = Configuration()
        llm = LLMProvider.get_llm(config)
        
        # Create a prompt to assess if more questions are needed
        assessment_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an AI assistant that determines if enough information has been gathered to provide a comprehensive answer.

Given an original question and the user's answers to clarifying questions, determine if:
1. You have enough information to provide a good answer (respond with "sufficient")
2. You need more specific clarifying questions (respond with "need_more")

Be conservative - only ask for more questions if they would significantly improve the answer quality."""),
            ("human", """Original Question: {original_prompt}

Previous Answers:
{answered_context}

Assessment (respond with either "sufficient" or "need_more"):""")
        ])
        
        # Format the answered questions
        answered_context = ""
        for q in answered_questions:
            answered_context += f"Q: {q['question']}\nA: {q['answer']}\n\n"
        
        chain = assessment_prompt | llm | StrOutputParser()
        assessment = chain.invoke({
            "original_prompt": original_prompt,
            "answered_context": answered_context
        }).strip().lower()
        
        if "sufficient" in assessment:
            return {
                "needs_more_questions": False,
                "message": "I have enough information to provide a comprehensive answer."
            }
        else:
            # Generate new questions if more are needed
            question_prompt = ChatPromptTemplate.from_messages([
                ("system", """You are an AI assistant that generates specific clarifying questions.

Based on the original question and previous answers, generate 1-3 additional specific questions that would help provide a better answer. Focus on gaps in the information that would significantly improve the response quality."""),
                ("human", """Original Question: {original_prompt}

Previous Answers:
{answered_context}

Generate 1-3 additional clarifying questions:""")
            ])
            
            question_chain = question_prompt | llm | StrOutputParser()
            new_questions_text = question_chain.invoke({
                "original_prompt": original_prompt,
                "answered_context": answered_context
            })
            
            # Parse the questions (simple split by lines)
            new_questions = [q.strip() for q in new_questions_text.split('\n') if q.strip() and not q.strip().startswith('#')]
            
            return {
                "needs_more_questions": True,
                "questions": new_questions[:3],  # Limit to 3 questions
                "message": "I can provide a better answer with a bit more information."
            }
            
    except Exception as e:
        print(f"Error in check_if_more_questions_needed: {e}")
        return {
            "needs_more_questions": False,
            "message": "I have enough information to provide an answer.",
            "error": str(e)
        }

def generate_structured_questions_from_text(questions: list, original_prompt: str) -> Dict[str, Any]:
    """
    Convert text questions into structured questions for the UI
    
    Args:
        questions: List of text questions
        original_prompt: The original user prompt for context
        
    Returns:
        Dictionary containing structured questions
    """
    try:
        from ..tools import structure_questions_tool
        from ..configuration import Configuration
        
        config = Configuration()
        
        result = structure_questions_tool.invoke({
            "questions": questions,
            "original_prompt": original_prompt,
            "config": config
        })
        
        return {
            "structured_questions": [q.model_dump() for q in result.questions]
        }
        
    except Exception as e:
        print(f"Error in generate_structured_questions_from_text: {e}")
        # Fallback to text questions
        structured_questions = []
        for question in questions:
            structured_questions.append({
                "question": question,
                "type": "text"
            })
        return {
            "structured_questions": structured_questions
        } 