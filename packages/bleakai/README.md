# BleakAI

**Transform AI conversations into structured forms with your own components.**

Instead of parsing messy text responses, BleakAI generates proper form elements (text inputs, dropdowns, sliders) when the AI needs more information. You bring your own UI components, BleakAI provides the intelligence.

## Core Philosophy: Bring Your Own Components

BleakAI doesn't come with a specific UI framework. It works with **your existing components** - React, Vue, Angular, or plain JavaScript. You map your components to form types, and BleakAI decides which ones to use based on the conversation.

## Quick Start

```bash
npm install bleakai
```

```typescript
import {BleakSession} from "bleakai";

// 1. Map your components to form types
const componentConfig = {
  text: {
    component: YourTextInput,
    description: "For text input and messages"
  },
  radio: {
    component: YourRadioGroup,
    description: "For single choice from options"
  },
  date: {
    component: YourDatePicker,
    description: "For dates and times"
  }
};

// 2. Create a BleakAI session
const bleak = new BleakSession({
  apiKey: "your-api-key",
  elements: componentConfig
});

// 3. Start a conversation (single call!)
const result = await bleak.startBleakConversation(
  "Help me plan a trip to Japan"
);

if (result.needsInput && result.questions) {
  // AI wants form input - questions are immediately available

  // 4. Convert questions to your components
  const components = bleak.getBleakComponents(
    result.questions,
    answers,
    onAnswerChange
  );

  components.forEach(({Component, props, key}) => {
    render(<Component key={key} {...props} />);
  });

  // 5. Finish the conversation when done
  const finalAnswer = await bleak.finishBleakConversation(answers);
} else if (result.answer) {
  // Direct answer - no form needed
  console.log(result.answer);
}
```

## How It Works

### 1. **Component Mapping**

Tell BleakAI about your components:

```typescript
const config = {
  text: {
    component: MyTextInput,
    description: "Use for names, descriptions, open-ended responses"
  },
  radio: {
    component: MyRadioButtons,
    description: "Use for single choice between 2-5 options"
  },
  multi_select: {
    component: MyCheckboxGroup,
    description: "Use when users can select multiple options"
  },
  date: {
    component: MyDatePicker,
    description: "Use for dates, times, and deadlines"
  },
  slider: {
    component: MySlider,
    description: "Use for numeric ranges and ratings"
  }
};
```

### 2. **AI Decision Making**

BleakAI analyzes the conversation and automatically chooses the right component types:

- **"When do you want to travel?"** → Date picker
- **"What's your budget range?"** → Slider
- **"Which cities interest you?"** → Multi-select checkboxes
- **"Any special requirements?"** → Text input

### 3. **Framework Agnostic**

Your components receive standard props:

```typescript
// Your components get these props automatically
interface ComponentProps {
  text: string; // The question text (note: 'text', not 'question')
  value: string; // Current value
  onChange: (value: string) => void; // Update callback
  options?: string[]; // For choice components
  id?: string; // Unique identifier
}
```

## React Example

```tsx
import React, {useState} from "react";
import {BleakSession} from "bleakai";

// Your existing components
const TextInput = ({text, value, onChange}) => (
  <div>
    <label>{text}</label>
    <input value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const RadioGroup = ({text, options, value, onChange}) => (
  <div>
    <label>{text}</label>
    {options.map((option) => (
      <label key={option}>
        <input
          type="radio"
          checked={value === option}
          onChange={() => onChange(option)}
        />
        {option}
      </label>
    ))}
  </div>
);

function App() {
  const [answers, setAnswers] = useState({});

  const bleak = new BleakSession({
    apiKey: "your-key",
    elements: {
      text: {component: TextInput, description: "For text input"},
      radio: {component: RadioGroup, description: "For single choice"}
    }
  });

  const handleStartConversation = async (prompt) => {
    // Single call - clean and simple!
    const result = await bleak.startBleakConversation(prompt);

    if (result.needsInput && result.questions) {
      // Questions are immediately available
      const components = bleak.getBleakComponents(
        result.questions,
        answers,
        (question, value) =>
          setAnswers((prev) => ({...prev, [question]: value}))
      );

      // Render your components
      return components.map(({Component, props, key}) => (
        <Component key={key} {...props} />
      ));
    } else if (result.answer) {
      // Direct answer available
      return <div>{result.answer}</div>;
    }
  };

  const handleFinishConversation = async () => {
    const finalAnswer = await bleak.finishBleakConversation(answers);
    return finalAnswer;
  };

  // ... rest of your component
}
```

## API Reference

### BleakSession

The main class for managing AI conversations.

#### Constructor

```typescript
const bleak = new BleakSession({
  apiKey: string;              // Your BleakAI API key
  baseUrl?: string;            // API endpoint (optional)
  timeout?: number;            // Request timeout in ms
  elements: ComponentMapping;  // Your component configuration
});
```

#### Methods

##### `startBleakConversation(prompt: string)`

Start a new conversation. Returns questions immediately if needed, or a direct answer.

```typescript
const result = await bleak.startBleakConversation("Help me plan an event");

if (result.needsInput && result.questions) {
  // AI needs form input - questions are immediately available
  const components = bleak.getBleakComponents(
    result.questions,
    answers,
    onChange
  );
  // ... render form
} else if (result.answer) {
  // Direct answer available
  console.log(result.answer);
}
```

##### `getBleakComponents(questions, answers?, onChange?)`

Convert AI questions into your renderable components.

```typescript
const components = bleak.getBleakComponents(
  result.questions, // Questions from startBleakConversation
  answers, // Current answer values
  onChange // Callback for value changes
);

// Each component has: { Component, props, question, key }
components.forEach(({Component, props, key}) => {
  render(<Component key={key} {...props} />);
});
```

##### `finishBleakConversation(answers: Record<string, string>)`

Finish the conversation by submitting user answers.

```typescript
const finalAnswer = await bleak.finishBleakConversation(answers);
```

##### `quickBleakAsk(prompt: string)`

Get a quick answer without form interaction.

```typescript
const answer = await bleak.quickBleakAsk("What's the weather like?");
```

##### `getBleakState()` and `resetBleakSession()`

Manage session state.

```typescript
const state = bleak.getBleakState();
bleak.resetBleakSession(); // Start fresh
```

## Component Configuration

Your component configuration tells BleakAI:

1. **What component to use** for each form type
2. **When to use it** (via description)

```typescript
const elements = {
  // Element type -> Your component + description
  text: {
    component: YourTextComponent,
    description: "Use for open-ended text input like names, descriptions"
  },
  radio: {
    component: YourRadioComponent,
    description: "Use for single choice between 2-5 options"
  },
  multi_select: {
    component: YourCheckboxComponent,
    description: "Use when users can select multiple options"
  }
};
```

### Built-in Types

BleakAI understands these element types out of the box:

- **`text`** - Free-form text input
- **`radio`** - Single choice from options
- **`multi_select`** - Multiple choice from options
- **`date`** - Date/time picker
- **`slider`** - Numeric range selector
- **`checkbox`** - Single yes/no option

You can also add **custom types** by including them in your configuration.

## Error Handling

```typescript
try {
  const result = await bleak.startBleakConversation(prompt);
  // ... handle conversation
} catch (error) {
  if (error instanceof RateLimitError) {
    // Handle rate limiting
  } else if (error instanceof AuthenticationError) {
    // Handle auth issues
  } else {
    // General error
  }
}
```

## TypeScript Support

Full TypeScript support with proper types:

```typescript
import {
  BleakSession,
  type InteractiveQuestion,
  type BleakElementConfig
} from "bleakai";
```

## Examples

- **React**: [React Example](./examples/react)
- **Vue**: [Vue Example](./examples/vue)
- **Angular**: [Angular Example](./examples/angular)
- **Vanilla JS**: [Plain JavaScript Example](./examples/vanilla)

## Key Features

### ✅ **Single Call API**

No more confusing double awaits. Start a conversation and get everything you need immediately.

### ✅ **Bleak-Oriented Naming**

All methods clearly indicate they're Bleak functions: `startBleakConversation`, `getBleakComponents`, `finishBleakConversation`.

### ✅ **Component Mapping**

Map your existing components to form types. BleakAI picks the right one based on context.

### ✅ **Framework Agnostic**

Works with React, Vue, Angular, Svelte, or vanilla JavaScript.

### ✅ **TypeScript Ready**

Full type safety with comprehensive TypeScript definitions.

### ✅ **Clean State Management**

Simple session state management with `getBleakState()` and `resetBleakSession()`.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.
