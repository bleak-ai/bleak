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
import {DynamicQuestionRenderer} from "bleakai";

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

  return (
    <div>
      {questions.map((question, index) => (
        <div key={index}>
          <DynamicQuestionRenderer
            config={rendererConfig}
            question={{
              type: question.type,
              question: question.question,
              options: question.options || undefined
            }}
            value={answers[question.question] || ""}
            onChange={(value) => onAnswerChange(question.question, value)}
            questionIndex={index}
          />
        </div>
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

### Development Workflow

1. Make changes to the library
2. Run `npm run dev` to watch and rebuild
3. Test changes immediately in your linked project
