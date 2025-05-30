# Dynamic Frontend Components

The frontend now supports **specific** UI element types for interactive bleak elements with strict type validation.

## Overview

The frontend has been refactored to handle only the supported UI component types through:

1. **Restricted Element Schema** - Accepts only supported `type` values
2. **Component Registry** - Maps supported types to React components
3. **Dynamic Renderer** - Automatically selects the right component
4. **Available Components** - `radio`, `input`, `multiselect`, and `slider` types
5. **Type Safety** - Strict validation ensures only supported types are used

## Supported Components

### 1. RadioBleakElement (type: "radio")

For single-choice elements with predefined options.

```typescript
{
  type: "radio",
  text: "What's your experience level?",
  options: ["Beginner", "Intermediate", "Advanced", "Expert"]
}
```

### 2. Input (type: "input")

For single-choice elements where users select from a dropdown or list of options (maps to RadioBleakElement).

```typescript
{
  type: "input",
  text: "What's your preferred development environment?",
  options: ["VS Code", "IntelliJ", "Vim", "Sublime Text"]
}
```

### 3. SliderBleakElement (type: "slider")

For numeric ratings, scales, and ranges.

```typescript
{
  type: "slider",
  text: "Rate your experience from 1 to 10",
  options: ["1", "10", "1"] // [min, max, step]
}
```

**Features:**

- Native HTML range input
- Configurable min/max/step via options
- Real-time value display
- Responsive design

### 4. MultiSelectBleakElement (type: "multiselect")

For multiple choice selections with checkboxes.

```typescript
{
  type: "multiselect",
  text: "Which programming languages do you know?",
  options: ["JavaScript", "Python", "TypeScript", "Java"]
}
```

**Features:**

- Multiple checkbox selection
- "Other" option with text input
- Selected items summary
- Comma-separated value output

## Component Registry

The `DynamicBleakElementRenderer` uses a registry system to map types to components:

```typescript
const ComponentRegistry: Record<string, React.ComponentType<any>> = {
  radio: RadioBleakElement,
  input: RadioBleakElement, // Maps to radio for choice-based input
  multiselect: MultiSelectBleakElement,
  slider: SliderBleakElement
};
```

## Usage Examples

### Backend Sends Supported Types

```json
{
  "questions": [
    {
      "type": "slider",
      "text": "How satisfied are you?",
      "options": ["1", "5"]
    },
    {
      "type": "multiselect",
      "text": "Select your interests",
      "options": ["Tech", "Sports", "Music"]
    },
    {
      "type": "radio",
      "text": "What's your experience level?",
      "options": ["Beginner", "Intermediate", "Advanced"]
    }
  ]
}
```

### Frontend Automatically Renders

```tsx
// Automatically selects the right component based on type
<DynamicBleakElementRenderer
  element={element}
  value={value}
  onChange={onChange}
  elementIndex={index}
/>
```

## Adding New Component Types

### Step 1: Update Available Types

```typescript
// In interactiveApi.ts
export type AvailableElements =
  | "radio"
  | "input"
  | "multiselect"
  | "slider"
  | "yournewtype";

// Update the schema
const InteractiveElementSchema = z.object({
  text: z.string(),
  type: z.enum(["radio", "input", "multiselect", "slider", "yournewtype"]),
  options: z.array(z.string()).optional()
});

// Update BleakElements
const BleakElements: BleakElementType[] = [
  // ... existing elements
  {
    name: "yournewtype",
    description: "Description of when to use your new type"
  }
];
```

### Step 2: Create the Component

```tsx
// components/chat/elements/YourNewBleakElement.tsx
export const YourNewBleakElement = ({text, options, value, onChange}) => {
  return (
    <div>
      <Label>{text}</Label>
      {/* Your custom UI here */}
    </div>
  );
};
```

### Step 3: Register the Component

```tsx
// In DynamicBleakElementRenderer.tsx
import {YourNewBleakElement} from "./elements/YourNewBleakElement";

const ComponentRegistry: Record<string, React.ComponentType<any>> = {
  radio: RadioBleakElement,
  input: RadioBleakElement,
  multiselect: MultiSelectBleakElement,
  slider: SliderBleakElement,
  yournewtype: YourNewBleakElement
};
```

## API Changes

### Current (Type-Safe)

```typescript
// Restricted schema - only supported types
const InteractiveElementSchema = z.object({
  text: z.string(),
  type: z.enum(["radio", "input", "multiselect", "slider"]), // Restricted to available elements only
  options: z.array(z.string()).optional()
});
```

## Available Elements Configuration

```typescript
const BleakElements: BleakElementType[] = [
  {
    name: "radio",
    description:
      "Use radio for single-choice questions with predefined options (yes/no, multiple choice, etc.)"
  },
  {
    name: "input",
    description:
      "Use input for single-choice questions where users select from a dropdown or list of options"
  },
  {
    name: "multiselect",
    description:
      "Use multiselect for questions where users can select multiple options from a list"
  },
  {
    name: "slider",
    description:
      "Use slider for numeric ratings, scales, or range selections (1-10, percentages, etc.)"
  }
];
```

## Type Safety

✅ **Fully type-safe!**

- Only supported types are accepted
- Frontend and backend schemas are aligned
- TypeScript provides compile-time validation
- Runtime validation through Zod schemas

## Error Handling

### Unknown Types

If backend sends an unsupported type, the system:

1. Falls back to `RadioBleakElement` component
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
