# BleakAI - Stop Making Users Type Everything

BleakAI transforms text-based AI conversations into smart form interactions. Instead of asking users to type responses, AI generates the right form components - date pickers, sliders, dropdowns - to get structured data from the start.

## The Problem

Traditional AI conversations look like this:

```
🤖 AI: "Please tell me: what date, what time, how many people, any dietary requirements, and your contact information?"

👤 User: "Um, let me think... next Friday, around 7pm, for 4 people. My friend is vegetarian. My number is 555-0123"
```

**Problems:**

- User must remember all details
- Easy to forget information
- AI must parse messy text
- Prone to errors and misunderstanding

## The BleakAI Solution

With BleakAI, the same conversation becomes:

```
🤖 AI: "I need some details for your reservation. Let me create a form:"

✨ Generates:
- Date picker (auto-set to next Friday)
- Time dropdown (7:00 PM, 7:30 PM, 8:00 PM options)
- Number input (party size)
- Checkboxes (Vegetarian ✓, Vegan, Gluten-free)
- Phone input (with validation)
```

**Result: Perfect structured data, no parsing needed.**

## When to Use BleakAI

BleakAI is ideal when:

🤖 **The AI doesn't know yet what it needs to know**  
📋 **Forms must be generated on the fly, tailored to the conversation**  
🧩 **The form itself isn't the product, but rather input for another intelligent process**  
🔁 **User input refines a multi-step, dynamic decision or generation process**

## Core Features

### 🎯 Smart Form Generation

- AI analyzes what information it needs
- Automatically generates appropriate form components
- Gets structured data instead of parsing text

### 🧩 Your Components, AI's Logic

- Works with any UI library (React, Vue, Angular, vanilla JS)
- Use your existing design system
- BleakAI provides the intelligence, you provide the presentation

### ⚡ Dynamic & Context-Aware

- Forms generated based on conversation context
- Can't be predicted beforehand
- Adapts to user needs in real-time

## How It Works

### 1. Map Your Components

Tell BleakAI about your existing UI components:

```typescript
const config = {
  text: {
    component: YourTextInput,
    description: "For text input and messages"
  },
  select: {
    component: YourDropdown,
    description: "For choosing from 2-10 options"
  },
  date: {
    component: YourDatePicker,
    description: "For dates and times"
  },
  slider: {
    component: YourSlider,
    description: "For numbers and ranges"
  }
};
```

### 2. AI Picks the Right Components

When AI needs information, it generates the optimal form:

```typescript
// User: "I need help booking a restaurant"
// AI analyzes and generates appropriate form elements

const form = generateForm(userMessage, config);
// Returns: date picker, time selector, party size, dietary checkboxes
```

### 3. Get Perfect Data

Instead of parsing "next Friday around 7pm for 4 people", you get:

```json
{
  "date": "2024-03-15",
  "time": "19:00",
  "partySize": 4,
  "dietary": ["vegetarian"]
}
```

## Real-World Examples

### Restaurant Reservation

- **Traditional**: "Please tell me date, time, party size, dietary requirements..."
- **BleakAI**: Date picker + time dropdown + number input + dietary checkboxes

### Product Configuration

- **Traditional**: "Tell me your specs, budget, and requirements..."
- **BleakAI**: RAM buttons + storage options + budget slider + feature checkboxes

### Technical Support

- **Traditional**: "Describe your device, when it crashes, and what you were doing..."
- **BleakAI**: Device dropdown + frequency slider + structured reproduction steps

## Framework Agnostic

BleakAI doesn't ship with UI components. It generates component trees that you render with your existing setup:

**React:**

```tsx
const {Component, props} = resolve(element, value, onChange);
return <Component {...props} />;
```

**Vue:**

```vue
<component :is="resolvedComponent" v-bind="props" />
```

**Vanilla JS:**

```javascript
const element = resolve(elementConfig, value, onChange);
document.body.appendChild(element);
```

## Quick Start

### 1. Install

```bash
npm install @bleakai/core
```

### 2. Configure Your Components

```typescript
import {createResolverFromConfig} from "@bleakai/core";

const config = {
  text: {component: MyTextInput, description: "For text input"},
  select: {component: MyDropdown, description: "For selections"}
  // ... map your components
};

const {resolve} = createResolverFromConfig(config);
```

### 3. Generate Forms

```typescript
// When AI needs information
const formElements = generateForm(conversation, config);

// Render each element
formElements.map((element) => {
  const {Component, props} = resolve(element, value, onChange);
  return <Component {...props} />;
});
```

## Architecture

### Core Components

- **Form Generator**: AI logic that determines what information is needed
- **Component Resolver**: Maps form requirements to your UI components
- **Type System**: Ensures type safety across the entire pipeline
- **Framework Adapters**: Render generated forms in any frontend framework

### Backend Integration

```python
# Python backend example
from bleakai import FormGenerator

generator = FormGenerator()
form_spec = generator.analyze_conversation(messages)
# Returns structured form specification for frontend
```

### Frontend Integration

```typescript
// Frontend renders the form
const formElements = await fetchFormSpec(conversationId);
const renderedForm = renderForm(formElements, componentConfig);
```

## The Difference

| Traditional AI                            | BleakAI                               |
| ----------------------------------------- | ------------------------------------- |
| ❌ Overwhelming text questions            | ✅ Smart, focused form components     |
| ❌ Users type unstructured answers        | ✅ Users click, select, and slide     |
| ❌ AI must parse messy text               | ✅ Perfect structured data every time |
| ❌ Information gets lost or misunderstood | ✅ Nothing gets lost in translation   |

## Contributing

BleakAI is open source. We welcome contributions:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

### Adding New Component Types

```typescript
// Define new component type
export interface SliderElement {
  type: "slider";
  min: number;
  max: number;
  step?: number;
  label: string;
}

// Add to configuration
const config = {
  slider: {
    component: YourSliderComponent,
    description: "For numeric ranges and ratings"
  }
};
```

## License

MIT License - see LICENSE file for details

## Get Started

Ready to stop parsing messy text and start getting perfect data?

```bash
npm install @bleakai/core
```

Visit our [documentation](https://bleakai.dev) for detailed guides and examples.
