# BleakAI Project Overview

**BleakAI transforms conversational AI by dynamically generating structured UI components based on user interactions.** Instead of static chat responses, BleakAI returns sophisticated form elements that developers can map to their own custom components. This framework bridges the gap between natural language processing and structured data collection, enabling developers to build intelligent interfaces using their existing design systems and component libraries.

## Core Philosophy

**Bring Your Own Components.** BleakAI doesn't impose a specific UI framework or component library. Instead, it provides the intelligence layer that determines what type of input is needed, while developers maintain complete control over how those components look and behave in their applications.

## Architecture

### Frontend (Demo Interface)

The frontend serves as both a demonstration platform and reference implementation. Built with React and TypeScript, it showcases how developers can integrate BleakAI into their applications using any component library. The `QuestionsSection` component dynamically renders UI elements returned by the backend, while the `BleakResolver` from the core library handles component resolution and state management. The frontend communicates with the backend through a clean REST API that manages conversation threads and processes user responses.

### Backend (LangGraph-Powered Intelligence)

The backend leverages **LangGraph** to orchestrate sophisticated conversational flows with human-in-the-loop interactions. The graph architecture consists of specialized nodes that handle different aspects of the conversation:

- **Clarify Node**: Generates contextual questions using LLM analysis
- **Structure Questions Node**: Converts natural language questions into structured UI component specifications
- **Choice Node**: Manages user decisions between requesting more questions or receiving final answers
- **Answer Node**: Produces comprehensive responses based on collected user input

LangGraph's state management and checkpoint system enables persistent conversations across multiple interactions, allowing users to progressively refine their queries through structured input collection.

### Library (bleakai)

The `bleakai` library provides a framework-agnostic component resolution system that maps abstract element types to your own UI components. The `BleakResolver` class serves as the core engine, accepting element specifications (type, text, options) and returning resolved components with proper props. This design enables developers to:

- **Use any UI framework or component library** - React, Vue, Angular, or custom implementations
- **Map BleakAI element types to existing components** in your design system
- **Maintain complete design control** - BleakAI provides the logic, you provide the presentation
- **Extend with custom element types** beyond the built-in text, radio, multi-select, and slider components
- **Preserve type safety** throughout the resolution process

## Structure

bleak
--frontend (demo)
--backend (intelligence)
--library (framework-agnostic core)

## Developer Integration

The true power of BleakAI lies in its flexibility. Developers can integrate BleakAI by:

- Installing `bleakai` via npm
- **Mapping BleakAI element types to their existing components** - use Material-UI, Ant Design, Chakra UI, or custom components
- Using the `createResolverFromConfig()` function with their component configuration
- Implementing the REST API endpoints that communicate with the BleakAI backend

**Example Integration:**

```typescript
// Use your existing components
const config = {
  text: {component: YourTextInput, description: "Text input"},
  radio: {component: YourRadioGroup, description: "Single choice"},
  slider: {component: YourSlider, description: "Numeric range"}
};

// BleakAI handles the logic, your components handle the presentation
const {resolve} = createResolverFromConfig(config);
```

The separation of concerns ensures that BleakAI provides the conversational intelligence while developers maintain complete control over their user interface, making it adaptable to any design system or component library.
