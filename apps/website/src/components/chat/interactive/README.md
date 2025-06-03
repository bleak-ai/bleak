# Interactive Chat Components

This directory contains the refactored interactive chat components that replace the old monolithic `SimpleInteractive` component.

## Architecture Overview

The old `SimpleInteractive` component has been split into smaller, focused components following the single responsibility principle:

### Components

#### `ConversationContainer.tsx`

- **Main orchestrator component** (replaces `SimpleInteractive`)
- Manages overall conversation flow
- Decides which view to show (welcome vs conversation)
- Uses the `useConversationState` hook for state management

#### `ConversationWelcome.tsx`

- **Welcome screen component**
- Handles initial prompt submission
- Manages API key input and authentication errors
- Shows example prompts and setup instructions

#### `ConversationView.tsx`

- **Active conversation display**
- Shows questions, answers, and final results
- Handles conversation interactions
- Displays loading states and errors

### Hooks

#### `hooks/useConversationState.ts`

- **Custom hook for conversation state management**
- Contains all conversation logic moved from the old component
- Handles mutations, API calls, and state updates
- Includes app-specific configuration (moved from `chatApi.ts`)

## Key Improvements

### 1. **Better Separation of Concerns**

- Each component has a single, clear responsibility
- Logic is separated from UI presentation
- Easier to test and maintain individual parts

### 2. **Reusable Hook**

- Conversation logic can be reused in other components
- State management is testable in isolation
- Clear interface for conversation operations

### 3. **Eliminated Boilerplate**

- Removed `chatApi.ts` - its minimal logic moved to the hook
- All conversation utilities now come from the `bleakai` package
- Cleaner import structure

### 4. **Improved Developer Experience**

- More intuitive component names
- Clearer props interfaces
- Better TypeScript types

## Usage

```typescript
// Simple usage (backward compatible)
import {SimpleInteractive} from "./interactive";

// New component names (recommended)
import {ConversationContainer} from "./interactive";

// Individual components for custom layouts
import {
  ConversationWelcome,
  ConversationView,
  useConversationState
} from "./interactive";
```

## Migration from `SimpleInteractive`

The `SimpleInteractive` component is still exported for backward compatibility, but it now points to `ConversationContainer`. No breaking changes required.

## What Was Removed

- ❌ `chatApi.ts` - functionality moved to `bleakai` package and `useConversationState`
- ❌ Complex type guards (`hasQuestions`, `isAnswer`) - replaced with simple `response.type` checks
- ❌ Preferences system (`thoroughness`, `max_questions`) - removed for simplicity
- ❌ Monolithic 370-line component - split into focused components

## Benefits

1. **Easier to understand** - each file has a clear purpose
2. **Easier to test** - smaller, focused units
3. **Easier to extend** - add new conversation features without touching unrelated code
4. **Better performance** - only re-render what needs to change
5. **Developer friendly** - use the `bleakai` package directly instead of writing boilerplate
