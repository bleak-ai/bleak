from langchain_core.prompts import ChatPromptTemplate, PromptTemplate

ANSWER_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful AI assistant. Answer the user's question accurately and concisely."),
    ("human", "{prompt}")
])

RATING_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are an accuracy rating system. Rate how well the answer addresses the original question on a scale from 0 to 1. Return only the number."),
    ("human", "Question: {prompt}\nAnswer: {answer}\nRate the answer's accuracy (0-1):")
]) 

QUESTION_GENERATOR_PROMPT = PromptTemplate.from_template(
    "You are a helpful assistant. Instead of answering the user's prompt, generate up to 3 specific clarifying questions that would help you better understand the request.\n\nUser Prompt: {prompt}\n\nQuestions:"
)