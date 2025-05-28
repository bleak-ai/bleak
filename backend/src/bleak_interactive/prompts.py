from langchain_core.prompts import ChatPromptTemplate, PromptTemplate

# Basic answer generation prompt
# Used when generating the final answer to the user's question
ANSWER_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful AI assistant. Answer the user's question accurately and concisely."),
    ("human", "{prompt}")
])

# Initial question generation prompt
# Used to generate clarifying questions when first processing a user's prompt
QUESTION_GENERATOR_PROMPT = PromptTemplate.from_template(
    "You are a helpful assistant. Instead of answering the user's prompt, generate up to 3 specific clarifying questions that would help you better understand the request, avoid these questions that have already been answered {previous_questions}.\n\nUser Prompt: {prompt}\n\nQuestions:"
)

# QUESTION_STRUCTURING_PROMPT = PromptTemplate.from_template(
#     """You are a UX expert that converts questions into appropriate UI components.

# Given a list of questions, classify each one as either:
# 1. "radio" - Multiple choice questions where users select from predefined options
# 2. "text" - Open-ended questions requiring free text input

# For radio questions, generate 3-5 relevant options based on the question context.
# For text questions, just provide the question as-is.

# Original context: {original_prompt}
# Questions to structure: {questions}


# Guidelines:
# - Use "radio" for questions about preferences, categories, locations, or choices with limited options
# - Use "text" for questions requiring specific details, names, numbers, or open-ended responses
# - Generate realistic, helpful options for radio questions
# - Keep questions clear and concise
# """
# )

QUESTION_STRUCTURING_PROMPT = PromptTemplate.from_template(
    """You are a UX expert that converts questions into appropriate UI components.

Given a list of questions, classify each one using the available UI elements provided.

Original context: {original_prompt}
Questions to structure: {questions}

Available UI Elements:
{bleak_elements}

Instructions:
1. For each question, choose the most appropriate UI element type from the available elements above
2. Use the element's name exactly as provided as the "type" field
3. Read each element's description carefully to understand when to use it
4. If the element's description suggests it handles multiple choices/options, generate 3-5 relevant options based on the question context
5. If the element's description suggests it's for single input/text, don't include options
6. Keep questions clear and concise

Output format:
{{
  "questions": [
    {{
      "type": "element_name_from_available_elements",
      "question": "the question text",
      "options": ["option1", "option2", "option3"] // only include if the element description suggests multiple choices
    }}
  ]
}}

Guidelines:
- Match questions to elements based on the element descriptions provided
- Generate realistic, helpful options when the element description indicates multiple choice functionality
- Use the exact element names as provided in the available elements list
- Consider the original context when generating options
"""
)

# Assessment prompt for determining if more questions are needed
# Used to evaluate if we have sufficient information or need additional clarifying questions
# Takes into account ALL previously answered questions, not just the latest ones
QUESTION_SUFFICIENCY_ASSESSMENT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are an AI assistant that determines if enough information has been gathered to provide a comprehensive answer.

Given an original question and ALL the user's answers to clarifying questions, determine if:
1. You have enough information to provide a good answer (respond with "sufficient")
2. You need more specific clarifying questions (respond with "need_more")

Important considerations:
- Review ALL previous answers, not just recent ones
- Be conservative - only ask for more questions if they would significantly improve the answer quality
- Consider if the user has already answered {total_questions} questions (maximum is 5)
- If 5 or more questions have been answered, always respond with "sufficient"

Respond with ONLY "sufficient" or "need_more" followed by a brief explanation."""),
    ("human", """Original Question: {original_prompt}

All Previous Answers (Total: {total_questions}):
{all_answered_context}

Assessment:""")
])

# Additional question generation prompt
# Used when more clarifying questions are needed after initial assessment
ADDITIONAL_QUESTIONS_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are an AI assistant that generates specific clarifying questions.

Based on the original question and ALL previous answers, generate 1-3 additional specific questions that would help provide a better answer. 

Important guidelines:
- Focus on gaps in the information that would significantly improve the response quality
- Avoid asking questions that have already been answered or are similar to previous questions
- Keep questions concise and specific
- Generate a maximum of 3 questions"""),
    ("human", """Original Question: {original_prompt}

All Previous Answers:
{all_answered_context}

Generate 1-3 additional clarifying questions:""")
])