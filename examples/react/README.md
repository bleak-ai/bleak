# BleakAI React Example

Simple demo showing BleakAI component resolver functionality.

## Quick Start

```bash
npm install
npm run dev
```

## What it does

1. Ask a question (try "help me plan a vacation")
2. AI generates dynamic form questions
3. Answer the questions using custom components
4. Get AI response

## Implementation

- Uses `createResolverFromConfig` from BleakAI
- Maps question types to React components
- Hardcoded API keys for demo
- Minimal styling for clarity

Based on BleakAI documentation patterns.

## Overview

This example showcases the key features of BleakAI:

- **Dynamic Form Generation**: AI generates appropriate questions based on user input
- **Custom Component Mapping**: Use your own React components for different question types
- **Type Safety**: Complete TypeScript support throughout
- **Framework Agnostic**: BleakAI component resolver works with any UI framework

## Features Demonstrated

### 1. Component Resolver

- Maps question types (`text`, `radio`, `multiSelect`, `slider`) to custom React components
- Maintains full control over styling and behavior
- Type-safe component resolution

### 2. Custom Components

- **TextInput**: Simple text input fields
- **RadioGroup**: Single-choice selection with styled radio buttons
- **MultiSelect**: Multiple-choice selection with checkboxes
- **SliderInput**: Numeric range selection with custom slider

### 3. Conversation Flow

- Initial prompt handling
- Dynamic question generation based on context
- Answer collection and submission
- Final AI response display

### 4. Mock Chat Client

This example includes a mock chat client that simulates the BleakAI backend for demonstration purposes. In a real implementation, you would use the actual BleakAI backend with your API keys.

## Installation

```bash
npm install
```

## Running the Application

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

## Usage

1. **Start Demo**: Click "Start Demo" to begin
2. **Choose Example**: Try one of the pre-filled examples or enter your own request
3. **Answer Questions**: The AI will generate relevant questions using your custom components
4. **View Response**: Get a personalized response based on your answers

## Example Scenarios

### Vacation Planning

- Budget selection (Radio buttons)
- Travel duration (Text input)
- Activity preferences (Multi-select)

### Laptop Selection

- Primary use case (Radio buttons)
- Budget range (Slider)
- Important features (Multi-select)

### Party Planning

- Guest count (Text input)
- Party type (Radio buttons)
- Planning areas (Multi-select)

## Code Structure

```
src/
├── App.tsx                 # Main application component
├── App.css                 # Styling for the application
├── components/
│   ├── TextInput.tsx       # Text input component
│   ├── RadioGroup.tsx      # Radio button group component
│   ├── MultiSelect.tsx     # Multi-select checkbox component
│   └── SliderInput.tsx     # Slider input component
└── main.tsx               # Application entry point
```

## Key Implementation Details

### Component Configuration

```typescript
const componentConfig = {
  text: {component: TextInput, description: "Text input field"},
  radio: {component: RadioGroup, description: "Single choice selection"},
  multiSelect: {
    component: MultiSelect,
    description: "Multiple choice selection"
  },
  slider: {component: SliderInput, description: "Numeric range selection"}
};

const resolver = createResolverFromConfig(componentConfig);
```

### Dynamic Component Rendering

```typescript
const bleakElement: BleakElement = {
  text: question.text,
  type: question.type,
  options: question.options || undefined
};

const resolution = resolver.resolve(bleakElement, currentValue, handleChange);
const Component = resolution.Component;
```

### Component Interface

All components follow a consistent interface:

```typescript
interface ComponentProps {
  text: string; // Question text
  options?: string[] | null; // Options for choice-based components
  value?: string | string[]; // Current value
  onChange: (value: string | string[]) => void; // Change handler
  required?: boolean; // Whether the field is required
}
```

## Real Implementation

To use this with the actual BleakAI backend:

1. Replace the `MockChatClient` with the real BleakAI client
2. Install the full BleakAI SDK (when available)
3. Configure your API keys
4. Connect to the BleakAI backend URL

```typescript
import {createSimpleChatClient} from "bleakai-full"; // Hypothetical full SDK

const client = createSimpleChatClient({
  baseUrl: "https://api.bleakai.com",
  apiKey: "your-bleakai-api-key",
  openaiKey: "your-openai-api-key"
});
```

## Styling

The application includes a modern, responsive design with:

- Gradient background
- Card-based layout
- Smooth animations and transitions
- Focus states and hover effects
- Mobile-responsive design
- Custom component styling

## Technologies Used

- **React 18** with TypeScript
- **Vite** for fast development and building
- **BleakAI** component resolver
- **CSS3** with modern features (Grid, Flexbox, Custom Properties)

## License

This example is provided under the MIT License.

## Support

For questions about BleakAI integration or this example:

1. Check the [BleakAI Documentation](http://localhost:5173/docs)
2. Review the component resolver patterns
3. Examine the mock implementation for reference

---

**Note**: This example uses a mock chat client for demonstration. In production, you would connect to the actual BleakAI backend service.
