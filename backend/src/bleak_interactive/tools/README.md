# Bleak Interactive Tools

This directory contains reusable tools that can be used both within the LangGraph nodes and independently.

## Question Structuring Tool

The `structure_questions_tool` is a LangChain tool that converts simple question strings into structured questions with appropriate UI component types.

### Features

- **Automatic Type Detection**: Analyzes questions to determine if they should be:

  - `radio`: Multiple choice questions with predefined options
  - `text`: Open-ended questions requiring free text input

- **Context-Aware Options**: For radio questions, generates 3-5 relevant options based on the original prompt context

- **Reusable**: Can be used independently or within LangGraph nodes

### Usage

```python
from bleak_interactive.tools import structure_questions_tool

# Use the tool directly
result = structure_questions_tool.invoke({
    "questions": ["What is your favorite color?", "What is your full name?"],
    "original_prompt": "Creating a user profile",
    "config": configuration_object  # Optional
})

# Access structured questions
for question in result.questions:
    print(f"Type: {question.type}")
    print(f"Question: {question.question}")
    if question.type == "radio":
        print(f"Options: {question.options}")
```

### Examples

**Input Questions:**

- "What is your preferred programming language?"
- "What is your full name?"
- "How many years of experience do you have?"

**Output:**

- Radio question with options: ["Python", "JavaScript", "Java", "C++", "Other"]
- Text question (no options)
- Text question (no options)

### Integration with LangGraph

The tool is used in the `structure_questions_node` to convert simple questions from the clarify node into structured questions that can be rendered as appropriate UI components.

### Benefits of Tool-Based Approach

1. **Modularity**: Can be tested and used independently
2. **Reusability**: Can be used in multiple contexts beyond the graph
3. **Maintainability**: Logic is centralized in one place
4. **Testability**: Easier to unit test the functionality
5. **LangChain Integration**: Follows LangChain tool patterns for consistency
