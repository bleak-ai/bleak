# BleakAI - Dynamic Question Renderer Library

A simple, straightforward React library for rendering dynamic question components. Define your question types once and use them directly in both React frontend and API backend.

## Features

- 🎯 **Simple**: Just define your components and descriptions - no complex setup
- 🔄 **Dynamic Rendering**: Automatically render the right component based on question type
- 🌍 **Framework Agnostic**: Works with any React components
- 🚀 **Backend Ready**: Use descriptions directly in your API/AI prompting
- 📝 **TypeScript Support**: Full type safety and IntelliSense
- 🪝 **React Hooks**: Easy-to-use hooks for state management

## Installation

```bash
npm install bleakai
```

## Quick Start

### 1. Define Your Question Configuration

```tsx
import React from "react";
import {type QuestionConfig} from "bleakai";

// Your custom components (use any React components!)
const MyTextInput = ({question, value, onChange}) => (
  <div>
    <label>{question}</label>
    <input value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const MyRadioGroup = ({question, options, value, onChange}) => (
  <div>
    <label>{question}</label>
    {options?.map((option, index) => (
      <label key={index}>
        <input
          type="radio"
          value={option}
          checked={value === option}
          onChange={(e) => onChange(e.target.value)}
        />
        {option}
      </label>
    ))}
  </div>
);

// Simple configuration - define once, use everywhere
export const QUESTION_CONFIG = {
  text: {
    component: MyTextInput,
    description:
      "Use for text input fields where users type free-form responses"
  },
  radio: {
    component: MyRadioGroup,
    description: "Use for single-choice questions with predefined options"
  }
} satisfies QuestionConfig;
```

### 2. Use in React (Frontend)

```tsx
// Extract components directly from your config
export const QUESTION_COMPONENTS = {
  text: QUESTION_CONFIG.text.component,
  radio: QUESTION_CONFIG.radio.component
};

function App() {
  const [answers, setAnswers] = useState({});

  const questions = [
    {type: "text", question: "What is your name?"},
    {
      type: "radio",
      question: "What is your experience level?",
      options: ["Beginner", "Intermediate", "Advanced"]
    }
  ];

  const renderQuestion = (question, index) => {
    const Component = QUESTION_COMPONENTS[question.type];

    if (!Component) {
      // Fallback
      const FallbackComponent = QUESTION_COMPONENTS.radio;
      return (
        <FallbackComponent
          question={question.question}
          value={answers[question.question] || ""}
          onChange={(value) =>
            setAnswers((prev) => ({...prev, [question.question]: value}))
          }
          options={question.options || ["Yes", "No"]}
        />
      );
    }

    return (
      <Component
        question={question.question}
        value={answers[question.question] || ""}
        onChange={(value) =>
          setAnswers((prev) => ({...prev, [question.question]: value}))
        }
        options={question.options}
      />
    );
  };

  return (
    <div>
      {questions.map((question, index) => (
        <div key={index}>{renderQuestion(question, index)}</div>
      ))}
    </div>
  );
}
```

### 3. Use with Backend/API

```tsx
// Extract descriptions directly from your config
export const BLEAK_ELEMENTS = [
  {name: "text", description: QUESTION_CONFIG.text.description},
  {name: "radio", description: QUESTION_CONFIG.radio.description}
];

// Send to your backend for AI prompting
const startAISession = async (prompt: string) => {
  const response = await fetch("/api/start-session", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      prompt,
      questionTypes: BLEAK_ELEMENTS // AI knows about your question types!
    })
  });

  return response.json();
};

// The AI will generate questions using your exact question types:
// { "type": "text", "question": "What's your name?" }
// { "type": "radio", "question": "Experience?", "options": ["Beginner", "Expert"] }
```

## Why This Approach?

- **No Magic**: Everything is explicit and clear
- **No Functions**: No complex conversion functions to learn
- **Direct Access**: Use `.component` and `.description` directly from your config
- **Simple**: Define once, extract what you need where you need it
- **Framework Agnostic**: No forced dependencies

## Component Props Interface

All your components should accept these props:

```tsx
interface QuestionComponentProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
  options?: string[]; // Only for components that need options
  [key: string]: any; // Additional custom props
}
```

## Examples

### Custom Question Types

```tsx
const ADVANCED_CONFIG = {
  datepicker: {
    component: MyDatePicker,
    description: "Use for date selection questions"
  },
  fileupload: {
    component: MyFileUpload,
    description: "Use for file attachment questions"
  },
  slider: {
    component: MySlider,
    description: "Use for numeric ranges and ratings"
  }
} satisfies QuestionConfig;

// Use directly:
const components = {
  datepicker: ADVANCED_CONFIG.datepicker.component,
  fileupload: ADVANCED_CONFIG.fileupload.component,
  slider: ADVANCED_CONFIG.slider.component
};

const descriptions = [
  {name: "datepicker", description: ADVANCED_CONFIG.datepicker.description},
  {name: "fileupload", description: ADVANCED_CONFIG.fileupload.description},
  {name: "slider", description: ADVANCED_CONFIG.slider.description}
];
```

### Framework Integration

Works with any React component library:

```tsx
// Material-UI
import {TextField, RadioGroup} from "@mui/material";

// Chakra UI
import {Input, Radio} from "@chakra-ui/react";

// Ant Design
import {Input, Radio} from "antd";

// Your custom design system
import {MyInput, MyRadio} from "./design-system";
```

## TypeScript Support

```tsx
// Define your config type
interface MyQuestionConfig extends QuestionConfig {
  text: {component: typeof MyTextInput; description: string};
  radio: {component: typeof MyRadioGroup; description: string};
}

// Get type-safe question types
type MyQuestionType = keyof MyQuestionConfig; // "text" | "radio"
```

## Legacy API (Advanced Usage)

For more complex setups, the library still provides advanced utilities:

```tsx
import {
  BleakProvider,
  createDefaultConfig,
  createComponentRegistry
} from "bleakai";

// Advanced setup with providers and configurations
const components = createComponentRegistry()
  .add("text", MyTextInput)
  .add("radio", MyRadioGroup)
  .build();

const config = createDefaultConfig(components, {
  enableLogging: true
});
```

## API Reference

### Types

#### `QuestionConfig`

```tsx
interface QuestionConfig {
  [questionType: string]: {
    component: React.ComponentType<any>;
    description: string;
  };
}
```

## Real Example

Check your current configuration - this is exactly how it should work:

```tsx
export const QUESTION_CONFIG = {
  text: {
    component: TextQuestion,
    description: "Use text for open-ended questions..."
  },
  radio: {
    component: RadioQuestion,
    description: "Use radio for single-choice questions..."
  }
} satisfies QuestionConfig;

// For React
export const QUESTION_COMPONENTS = {
  text: QUESTION_CONFIG.text.component,
  radio: QUESTION_CONFIG.radio.component
};

// For API
export const BLEAK_ELEMENTS = [
  {name: "text", description: QUESTION_CONFIG.text.description},
  {name: "radio", description: QUESTION_CONFIG.radio.description}
];
```

Simple, clear, and no magic!

## License

MIT

## Local Development & Testing

### Building the Library

```bash
npm run build
```

### Linking for Local Testing

To test this library in another project locally before publishing:

#### 1. Link the library globally (from this directory):

```bash
npm link
```

#### 2. In your test project, link to the library:

```bash
npm link bleakai
```

#### 3. Build and watch for changes:

```bash
npm run dev  # This will watch and rebuild on changes
```

### Alternative Method: Using npm pack

You can also create a tarball and install it directly:

#### 1. Create a package tarball:

```bash
npm pack
```

#### 2. In your test project, install the tarball:

```bash
npm install /path/to/bleakai-1.0.0.tgz
```

### Testing with Vite Projects

If you're testing with a Vite project and encounter issues with React duplicates, add this to your test project's `vite.config.js`:

```js
export default defineConfig({
  // ... other config
  resolve: {
    dedupe: ["react", "react-dom"]
  }
});
```

### Unlinking

To unlink when you're done testing:

#### 1. In your test project:

```bash
npm unlink bleakai
npm install  # Reinstall from npm registry
```

#### 2. In this library directory:

```bash
npm unlink
```

### Development Workflow

1. Make changes to the library
2. Run `npm run dev` to watch and rebuild
3. Test changes immediately in your linked project
4. When ready, run `npm run build` for a production build
5. Publish with `npm publish` when ready
