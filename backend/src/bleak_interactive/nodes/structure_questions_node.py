from warnings import catch_warnings

from bleak_interactive.llm_provider import LLMProvider
from bleak_interactive.models.models import StructuredQuestions, DynamicQuestion
from bleak_interactive.models.dynamic_models import create_dynamic_question_schema, create_simple_dynamic_model
from bleak_interactive.prompts import QUESTION_STRUCTURING_PROMPT
from ..state import BleakState
from ..configuration import Configuration

def structure_questions_node(state: BleakState, config: Configuration) -> BleakState:
    """
    Node that transforms simple questions into structured questions with types.
    Uses dynamic models/schemas based on the bleak_elements from frontend.

    Args:
        state: Current graph state
        config: Configuration object

    Returns:
        Updated state with structured questions
    """
    print("state structure_questions_node", state)
    try:
        if not state.questions_to_ask:
            return state

        print("questions to ask", state.questions_to_ask)
        
        llm = LLMProvider.get_llm(config)
        
        # Try using JSON schema approach first (recommended)
        try:
            schema = create_dynamic_question_schema(state.bleak_elements)
            llm_with_structured_output = llm.with_structured_output(schema)
        except Exception as schema_error:
            print(f"Schema approach failed: {schema_error}, falling back to dynamic model")
            # Fallback to simple dynamic model
            DynamicModel = create_simple_dynamic_model(state.bleak_elements)
            llm_with_structured_output = llm.with_structured_output(DynamicModel)

        # Chain that structures questions
        chain = QUESTION_STRUCTURING_PROMPT | llm_with_structured_output

        print("structured questions bleak elements", state.bleak_elements)
        result = chain.invoke({
            "original_prompt": state.prompt,
            "questions": state.questions_to_ask,
            "bleak_elements": state.bleak_elements
        })

        # Handle different result formats
        if hasattr(result, 'questions'):
            # Pydantic model result
            questions = result.questions
        elif isinstance(result, dict) and 'questions' in result:
            # Dictionary result from schema
            questions = result['questions']
        else:
            print(f"Unexpected result format: {type(result)}")
            return state

        # Convert to DynamicQuestion objects preserving the actual types
        structured_questions = []
        for q in questions:
            if isinstance(q, dict):
                # Create DynamicQuestion with the actual dynamic type
                dynamic_q = DynamicQuestion(
                    type=q.get('type', ''),  # Use the actual dynamic type
                    question=q['question'],
                    options=q.get('options')  # Include options if present
                )
                structured_questions.append(dynamic_q)
            elif hasattr(q, 'type') and hasattr(q, 'question'):
                # Already a question object, convert to DynamicQuestion
                dynamic_q = DynamicQuestion(
                    type=q.type,
                    question=q.question,
                    options=getattr(q, 'options', None)
                )
                structured_questions.append(dynamic_q)
            else:
                print(f"Unexpected question format: {q}")

        # Replace simple questions with structured ones
        state.structured_questions = structured_questions

        print("Structured questions with dynamic types:")
        for q in structured_questions:
            print(f"  Type: {q.type}, Question: {q.question}, Has options: {q.options is not None}")

        return state

    except Exception as e:
        print(f"Error in structure_questions_node: {e}")
        # Fallback: create simple dynamic questions with first available element type
        fallback_type = state.bleak_elements[0].name if state.bleak_elements else "text"
        fallback_questions = [
            DynamicQuestion(type=fallback_type, question=q) 
            for q in (state.questions_to_ask or [])
        ]
        state.structured_questions = fallback_questions
        return state