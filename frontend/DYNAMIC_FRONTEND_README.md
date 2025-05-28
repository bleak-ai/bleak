# Dynamic Frontend Components

The frontend now supports **any** UI element types dynamically! No more hardcoded "radio" and "text" limitations.

## Overview

The frontend has been completely refactored to handle dynamic UI component types through:

1. **Dynamic Question Schema** - Accepts any `type` string
2. **Component Registry** - Maps types to React components
3. **Dynamic Renderer** - Automatically selects the right component
4. **New Components** - Added `slider` and `multiselect` types
5. **Extensible Architecture** - Easy to add new component types

## New Components Added

### 1. SliderQuestion

For numeric ratings, scales, and ranges.

```typescript
{
  type: "slider",
  question: "Rate your experience from 1 to 10",
  options: ["1", "10", "1"] // [min, max, step]
}
```

**Features:**

- Native HTML range input
- Configurable min/max/step via options
- Real-time value display
- Responsive design

### 2. MultiSelectQuestion

For multiple choice selections with checkboxes.

```typescript
{
  type: "multiselect",
  question: "Which programming languages do you know?",
  options: ["JavaScript", "Python", "TypeScript", "Java"]
}
```

**Features:**

- Multiple checkbox selection
- "Other" option with text input
- Selected items summary
- Comma-separated value output

## Component Registry

The `DynamicQuestionRenderer` uses a registry system to map types to components:

```typescript
const ComponentRegistry: Record<string, React.ComponentType<any>> = {
  // Legacy types (backward compatibility)
  radio: RadioQuestion,
  text: TextQuestion,

  // New dynamic types
  input: RadioQuestion, // Choice-based input
  malo: TextQuestion, // Open-ended input
  slider: SliderQuestion, // Numeric ranges
  multiselect: MultiSelectQuestion, // Multiple choices

  // Fallback mappings
  select: RadioQuestion,
  dropdown: RadioQuestion,
  checkbox: MultiSelectQuestion,
  range: SliderQuestion,
  scale: SliderQuestion,
  rating: SliderQuestion,
  textarea: TextQuestion,
  textinput: TextQuestion
};
```

## Usage Examples

### Backend Sends Dynamic Types

```json
{
  "questions": [
    {
      "type": "slider",
      "question": "How satisfied are you?",
      "options": ["1", "5"]
    },
    {
      "type": "multiselect",
      "question": "Select your interests",
      "options": ["Tech", "Sports", "Music"]
    },
    {
      "type": "customtype",
      "question": "Any question with any type!"
    }
  ]
}
```

### Frontend Automatically Renders

```tsx
// Automatically selects the right component based on type
<DynamicQuestionRenderer
  question={question}
  value={value}
  onChange={onChange}
  questionIndex={index}
/>
```

## Adding New Component Types

### Step 1: Create the Component

```tsx
// components/chat/MyCustomQuestion.tsx
export const MyCustomQuestion = ({question, options, value, onChange}) => {
  return (
    <div>
      <Label>{question}</Label>
      {/* Your custom UI here */}
    </div>
  );
};
```

### Step 2: Register the Component

```tsx
import {registerComponent} from "./DynamicQuestionRenderer";
import {MyCustomQuestion} from "./MyCustomQuestion";

// Register your new component type
registerComponent("mycustom", MyCustomQuestion);
```

### Step 3: Use It

Backend can now send:

```json
{
  "type": "mycustom",
  "question": "Your custom question",
  "options": ["any", "options", "needed"]
}
```

## API Changes

### Before (Hardcoded)

```typescript
// Old schema - only "radio" and "text"
const InteractiveQuestionSchema = z.discriminatedUnion("type", [
  z.object({
    question: z.string(),
    type: z.literal("radio"),
    options: z.array(z.string()).min(1)
  }),
  z.object({
    question: z.string(),
    type: z.literal("text")
  })
]);
```

### After (Dynamic)

```typescript
// New schema - any type string
const InteractiveQuestionSchema = z.object({
  question: z.string(),
  type: z.string(), // Any string!
  options: z.array(z.string()).optional()
});
```

## Updated BleakElements

```typescript
const BleakElements: BleakElementType[] = [
  {
    name: "input",
    description:
      "Use input for questions about preferences, categories, locations, or choices with limited options"
  },
  {
    name: "malo",
    description:
      "Use malo for questions requiring specific details, names, numbers, or open-ended responses"
  },
  {
    name: "slider",
    description:
      "Use slider for numeric ratings, scales, or range selections (1-10, percentages, etc.)"
  },
  {
    name: "multiselect",
    description:
      "Use multiselect for questions where users can select multiple options from a list"
  }
];
```

## Backward Compatibility

✅ **Fully backward compatible!**

- Existing "radio" and "text" types still work
- Old API responses are handled correctly
- No breaking changes for existing code

## Error Handling

### Unknown Types

If backend sends an unknown type, frontend:

1. Falls back to `TextQuestion` component
2. Logs a warning to console
3. Continues working normally

### Missing Options

If a component expects options but doesn't receive them:

1. Provides sensible defaults (e.g., ["Yes", "No"])
2. Component renders successfully
3. User can still interact normally

## Demo Component

Try the `DynamicDemo` component to see all types in action:

```tsx
import {DynamicDemo} from "./components/chat/DynamicDemo";

// Shows all supported component types with live examples
<DynamicDemo />;
```

## Benefits

1. **🚀 Unlimited Flexibility** - Support any UI component type
2. **🔧 Easy Extension** - Add new types without touching core code
3. **🔄 Backward Compatible** - Existing code continues working
4. **🛡️ Type Safe** - Full TypeScript support
5. **🎯 Smart Fallbacks** - Graceful handling of unknown types
6. **📱 Responsive** - All components work on mobile/desktop

## Future Possibilities

With this dynamic system, you can easily add:

- Date pickers
- Color selectors
- File uploads
- Rich text editors
- Custom business components
- Third-party UI libraries
- And anything else you can imagine!

The frontend is now **truly dynamic** and ready for any UI component type the backend sends! 🎉
