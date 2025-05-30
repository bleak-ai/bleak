# BleakAI Project Overview

**BleakAI transforms conversational AI by dynamically generating structured UI components based on user interactions.** Instead of static chat responses, BleakAI returns sophisticated form elements—text inputs, radio buttons, sliders, multi-selects—that capture user intent with precision. This framework bridges the gap between natural language processing and structured data collection, enabling developers to build intelligent interfaces that adapt to user needs in real-time.

## Architecture

### Frontend (Demo Interface)

The frontend serves as both a demonstration platform and reference implementation. Built with React and TypeScript, it showcases how developers can integrate BleakAI into their applications. The `QuestionsSection` component dynamically renders UI elements returned by the backend, while the `BleakResolver` from the core library handles component resolution and state management. The frontend communicates with the backend through a clean REST API that manages conversation threads and processes user responses.

### Backend (LangGraph-Powered Intelligence)

The backend leverages **LangGraph** to orchestrate sophisticated conversational flows with human-in-the-loop interactions. The graph architecture consists of specialized nodes that handle different aspects of the conversation:

- **Clarify Node**: Generates contextual questions using LLM analysis
- **Structure Questions Node**: Converts natural language questions into structured UI component specifications
- **Choice Node**: Manages user decisions between requesting more questions or receiving final answers
- **Answer Node**: Produces comprehensive responses based on collected user input

LangGraph's state management and checkpoint system enables persistent conversations across multiple interactions, allowing users to progressively refine their queries through structured input collection.

### Library (@bleakai/core)

The `@bleakai/core` library provides a framework-agnostic component resolution system that maps abstract element types to concrete UI components. The `BleakResolver` class serves as the core engine, accepting element specifications (type, text, options) and returning resolved components with proper props. This design enables developers to:

- **Plug into any React application** with minimal configuration
- **Define custom component mappings** for different UI frameworks
- **Extend element types** beyond the built-in text, radio, multi-select, and slider components
- **Maintain type safety** throughout the resolution process

## Structure

bleak
--frontend
--backend
--library

## Component Interaction Flow

1. **User submits a query** through the frontend interface
2. **Backend processes the query** using LangGraph, generating contextual clarifying questions
3. **Questions are structured** into specific UI element types (radio, text, slider, etc.)
4. **Frontend receives element specifications** and uses the BleakResolver to render appropriate components
5. **User interactions** are collected and sent back to the backend for further processing
6. **Conversation continues** until sufficient information is gathered for a final response

## External Integration

The library's framework-agnostic design makes it highly reusable. Developers can integrate BleakAI by:

- Installing `@bleakai/core` via npm
- Defining their component mappings in a configuration object
- Using the `createResolverFromConfig()` function to instantiate a resolver
- Implementing the REST API endpoints that communicate with the BleakAI backend

The separation of concerns ensures that the core resolution logic remains independent of specific UI frameworks, making it adaptable to React, Vue, Angular, or custom implementations.
