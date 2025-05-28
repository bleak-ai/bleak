# Dynamic Question Structuring with Custom UI Elements

This document explains how to achieve structured output with `with_structured_output` when the UI element types are dynamically defined by the frontend.

## Problem

Previously, the system used hardcoded Pydantic models (`RadioQuestion`, `TextQuestion`) with `with_structured_output`. However, when UI element types are defined dynamically by the frontend (e.g., `slider`, `multiselect`, `datepicker`), you can't predefine the Pydantic models.

## Solution: Truly Dynamic Backend

The backend now supports **any** UI element types defined by the frontend without hardcoding specific element names. The system uses:

1. **DynamicQuestion Model**: A flexible Pydantic model that can handle any UI element type
2. **Dynamic JSON Schema**: Generated based on the actual `bleak_elements` provided by frontend
3. **Smart Type Detection**: Uses element descriptions to determine if options are needed

### Key Components

#### DynamicQuestion Model

```python
class DynamicQuestion(BaseModel):
    type: str  # Any type from bleak_elements
    question: str
    options: Optional[List[str]] = None  # Only present for choice-based elements
```

#### Dynamic Schema Generation

```python
def create_dynamic_question_schema(bleak_elements: List[BleakElementType]) -> Dict[str, Any]:
    # Creates schema that only allows types from bleak_elements
    element_names = [element.name for element in bleak_elements]

    question_schema = {
        "properties": {
            "type": {"enum": element_names},  # Dynamic enum!
            "question": {"type": "string"},
            "options": {"type": "array", "items": {"type": "string"}}
        }
    }
```

## Usage Examples

### Example 1: Custom UI Elements

```python
# Frontend defines any UI elements
custom_elements = [
    BleakElementType(name="slider", description="Use slider for numeric ranges or ratings"),
    BleakElementType(name="multiselect", description="Use multiselect for multiple choice questions"),
    BleakElementType(name="datepicker", description="Use datepicker for date selection"),
    BleakElementType(name="colorpicker", description="Use colorpicker for color selection"),
    BleakElementType(name="fileupload", description="Use fileupload for file attachments")
]

# Backend automatically supports ALL these types
questions = [
    "How would you rate this?",           # -> type: "slider"
    "Which languages do you know?",       # -> type: "multiselect"
    "When do you want to start?",         # -> type: "datepicker"
    "What's your brand color?",           # -> type: "colorpicker"
    "Upload your resume",                 # -> type: "fileupload"
]
```

### Example 2: E-commerce UI Elements

```python
# E-commerce specific elements
ecommerce_elements = [
    BleakElementType(name="pricerange", description="Use for price range selection"),
    BleakElementType(name="rating", description="Use for star ratings"),
    BleakElementType(name="sizeselect", description="Use for clothing size selection"),
    BleakElementType(name="quantity", description="Use for quantity input")
]

# Backend adapts automatically
questions = [
    "What's your budget?",               # -> type: "pricerange"
    "Rate this product",                 # -> type: "rating"
    "What size do you need?",            # -> type: "sizeselect"
    "How many do you want?"              # -> type: "quantity"
]
```

## How It Works

### 1. Frontend Sends Dynamic Elements

```typescript
const customElements = [
  {name: "slider", description: "Use slider for numeric ranges"},
  {name: "tags", description: "Use tags for multiple selection"}
];

// Send to backend
startInteractiveSession(prompt, customElements);
```

### 2. Backend Generates Dynamic Schema

```python
# Backend automatically creates schema for these specific elements
schema = create_dynamic_question_schema(bleak_elements)
# Schema only allows "slider" and "tags" as valid types
```

### 3. LLM Uses Dynamic Types

```python
# LLM output uses the actual dynamic types
{
  "questions": [
    {
      "type": "slider",  # Actual dynamic type!
      "question": "Rate your experience",
      "options": ["1", "2", "3", "4", "5"]
    },
    {
      "type": "tags",    # Actual dynamic type!
      "question": "Select your interests",
      "options": ["Tech", "Sports", "Music", "Art"]
    }
  ]
}
```

### 4. Backend Preserves Dynamic Types

```python
# state.structured_questions contains DynamicQuestion objects
for q in state.structured_questions:
    print(f"Type: {q.type}")  # "slider", "tags", etc.
    print(f"Question: {q.question}")
    print(f"Options: {q.options}")
```

## Smart Option Detection

The system automatically determines when to include options based on element descriptions:

```python
# These descriptions trigger option generation:
"Use for multiple choice questions"     # -> includes options
"Use for selection from predefined"     # -> includes options
"Use for picking from options"          # -> includes options

# These descriptions don't trigger options:
"Use for text input"                    # -> no options
"Use for numeric input"                 # -> no options
"Use for file upload"                   # -> no options
```

## Benefits

1. **Unlimited Flexibility** - Support any UI element types
2. **No Backend Changes** - Add new UI elements without touching backend code
3. **Type Safety** - Still validates against provided element types
4. **Smart Defaults** - Automatically determines option requirements
5. **Future Proof** - Works with UI frameworks that don't exist yet

## Implementation Details

### Updated Structure Questions Node

```python
def structure_questions_node(state: BleakState, config: Configuration):
    # Generate schema for the specific bleak_elements
    schema = create_dynamic_question_schema(state.bleak_elements)
    llm_with_structured_output = llm.with_structured_output(schema)

    # LLM outputs questions with actual dynamic types
    result = chain.invoke({
        "bleak_elements": state.bleak_elements,  # Dynamic elements
        "questions": state.questions_to_ask
    })

    # Convert to DynamicQuestion objects (preserves actual types)
    structured_questions = [
        DynamicQuestion(
            type=q['type'],      # Actual dynamic type (e.g., "slider")
            question=q['question'],
            options=q.get('options')
        )
        for q in result['questions']
    ]
```

### Enhanced Prompt

The prompt now uses the actual `bleak_elements` descriptions:

```python
"""
Available UI Elements:
{bleak_elements}  # Dynamic list from frontend

Instructions:
1. Choose the most appropriate UI element type from the available elements above
2. Use the element's name exactly as provided
3. Read each element's description to understand when to use it
4. Generate options only if the description suggests multiple choices
"""
```

## Migration

### For Frontend Developers

You can now define **any** UI element types:

```typescript
// Before: Limited to "radio" and "text"
// After: Any types you want!
const myCustomElements = [
  {name: "whatever", description: "Use whatever for whatever"},
  {name: "anything", description: "Use anything for anything"}
];
```

### For Backend Developers

The backend is now completely agnostic to UI element types. No more hardcoded element names anywhere in the backend code.

## Testing

The system works with any combination of UI elements. Test with your own custom elements to see the dynamic behavior in action.
