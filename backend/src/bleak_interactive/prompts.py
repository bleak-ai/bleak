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
    "You are a helpful assistant. Instead of answering the user's prompt, generate up to 3 specific clarifying questions that would help you better understand the request.\n\nUser Prompt: {prompt}\n\nQuestions:"
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