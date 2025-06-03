# BleakAI Documentation Plan

## Overview

This document outlines the complete plan for creating comprehensive documentation for the BleakAI library. The documentation will be hosted at `/docs` route and will include installation guides, usage examples, and complete API reference.

## Documentation Tool Recommendation

After researching current documentation tools in 2024, I recommend **Docusaurus v3** for the following reasons:

### Why Docusaurus?

1. **React/TypeScript Native**: Perfect fit for our existing React/TypeScript stack
2. **MDX Support**: Allows embedding React components in documentation
3. **Built-in Features**: Search, versioning, i18n, dark mode, SEO optimization
4. **Zero Config**: Works out of the box with minimal setup
5. **Large Community**: Well-maintained by Meta with active community
6. **Performance**: Static site generation with fast client-side navigation
7. **Customizable**: Easy to theme and extend with React components

### Alternative Options Considered:

- **Nextra**: Great but less feature-rich than Docusaurus
- **GitBook**: Paid tiers for advanced features
- **Custom React App**: Too much development overhead
- **MkDocs**: Python-based, doesn't fit our tech stack

## Documentation Structure

### 1. Getting Started

- **Installation**: `npm install bleakai`
- **API Key Setup**: Instructions for obtaining and configuring API keys
- **Quick Start**: 5-minute tutorial to get up and running

### 2. Build Your First Chatbot (React)

- **Configuration Setup**: How to create and configure `bleakConfig.ts`
- **Basic Implementation**: Complete working example
- **Element Types**: Understanding text, radio, multi_select, slider elements
- **API Integration**: Setting up chat client and handling responses

### 3. Library SDK Documentation

- **Core Types**: BleakElement, BleakElementConfig, ChatResponse, etc.
- **Chat Client**: BleakChat class and methods
- **Conversation Management**: BleakConversation and utilities
- **Element Resolver**: Component resolution and rendering
- **Error Handling**: ChatError, RateLimitError, AuthenticationError
- **Utilities**: High-level convenience functions

### 4. API Reference

- **Chat Endpoints**: Complete API documentation
- **Request/Response Types**: Detailed type definitions
- **Error Codes**: All possible error scenarios

### 5. Examples

- **Basic Chat**: Simple question-answer implementation
- **Advanced Chat**: Multi-turn conversations with custom elements
- **Event-Driven**: Using event handlers for complex flows
- **Generator Pattern**: Step-by-step conversation control

## Implementation Steps

### Phase 1: Documentation Infrastructure

1. **Install Docusaurus** in the website app
2. **Configure Docusaurus** with custom theme matching BleakAI design
3. **Set up routing** to integrate with existing App.tsx
4. **Create base structure** with navigation and layout

### Phase 2: Content Creation

1. **Getting Started Guide**

   - Installation instructions
   - API key setup (placeholder)
   - Quick start tutorial

2. **First Chatbot Tutorial**

   - bleakConfig.ts explanation and examples
   - React component implementation
   - Complete working example with all element types
   - API integration patterns

3. **SDK Documentation**
   - Extract and document all exported types and functions
   - Code examples for each major class/function
   - Usage patterns and best practices

### Phase 3: Advanced Features

1. **Interactive Examples**: Embed working code sandboxes
2. **API Playground**: Live API testing interface
3. **Search Integration**: Full-text search across all docs
4. **Version Management**: Support for multiple library versions

## Content Sources and Research

### Current Codebase Analysis

- **Core Library**: `/packages/bleakai/src/` - Main SDK implementation
- **React Components**: `/apps/website/src/components/chat/` - Usage examples
- **Configuration**: `/apps/website/src/config/bleakConfig.ts` - Element configuration
- **Types**: `/packages/bleakai/src/types/` - TypeScript definitions

### Key Files to Document:

1. `/packages/bleakai/src/index.ts` - Main exports
2. `/packages/bleakai/src/chat/BleakChat.ts` - Primary chat client
3. `/packages/bleakai/src/chat/utilities.ts` - Helper functions
4. `/packages/bleakai/src/core/BleakResolver.ts` - Element resolution
5. `/packages/bleakai/src/types/core.ts` - Core types

### Usage Patterns Found:

1. **Configuration-based setup** using `BLEAK_ELEMENT_CONFIG`
2. **Chat client initialization** with API keys and base URLs
3. **Element rendering** through resolver pattern
4. **Error handling** with custom error types
5. **Conversation management** with state tracking

## Technical Implementation

### Integration with Existing App

- **Route Setup**: `/docs` route in App.tsx (✅ Done)
- **Component Structure**: Modular documentation components
- **Styling**: Consistent with existing design system
- **Navigation**: Integration with existing header/footer

### Docusaurus Setup

```bash
# Install Docusaurus in website app
cd apps/website
npm install --save @docusaurus/core @docusaurus/preset-classic

# Create docs configuration
# Integrate with existing React app
# Set up custom theme
```

### Content Organization

```
docs/
├── getting-started/
│   ├── installation.md
│   ├── api-key-setup.md
│   └── quick-start.md
├── tutorials/
│   ├── first-chatbot.md
│   ├── element-configuration.md
│   └── advanced-patterns.md
├── api-reference/
│   ├── chat-client.md
│   ├── conversation.md
│   ├── elements.md
│   └── types.md
└── examples/
    ├── basic-chat.md
    ├── custom-elements.md
    └── error-handling.md
```

## Success Metrics

1. **Completeness**: All exported functions/types documented
2. **Usability**: New developers can follow tutorials successfully
3. **Maintainability**: Easy to update as library evolves
4. **Performance**: Fast loading and search
5. **Accessibility**: Meets WCAG guidelines

## Next Steps

1. ✅ Create this documentation plan
2. 🔄 Set up Docusaurus infrastructure
3. 📝 Create Getting Started content
4. 📝 Build First Chatbot tutorial
5. 📝 Document SDK API reference
6. 🎨 Polish design and UX
7. 🧪 Test with real users
8. 🚀 Deploy and launch

---

_This plan serves as the blueprint for creating comprehensive, user-friendly documentation for the BleakAI library._
