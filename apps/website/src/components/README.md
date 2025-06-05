# Components Directory Structure

This directory contains all React components organized by their purpose and functionality.

## Directory Structure

```
components/
├── pages/          # Page-level components
│   ├── Landing.tsx     # Landing page
│   ├── ChatPage.tsx    # Chat page
│   └── index.ts        # Page exports
│
├── layout/         # Layout and navigation components
│   ├── Header.tsx      # App header
│   ├── Footer.tsx      # App footer
│   └── index.ts        # Layout exports
│
├── features/       # Feature-specific components
│   ├── bleak.tsx       # Bleak hero animation
│   ├── Chatbot.tsx     # Main chatbot component
│   └── index.ts        # Feature exports
│
├── chat/          # Chat-related components
│   ├── questions/      # Question type components
│   │   ├── SliderQuestion.tsx
│   │   ├── MultiSelectQuestion.tsx
│   │   ├── RadioQuestion.tsx
│   │   ├── TextQuestion.tsx
│   │   ├── QuestionsSection.tsx
│   │   └── index.ts
│   │
│   ├── interactive/    # Interactive chat components
│   │   ├── SimpleInteractive.tsx
│   │   ├── DynamicDemo.tsx
│   │   └── index.ts
│   │
│   ├── utils/         # Chat utility components
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorDisplay.tsx
│   │   ├── AnswerSection.tsx
│   │   ├── PromptForm.tsx
│   │   └── index.ts
│   │
│   ├── adapters/      # Bleak AI adapters
│   │   └── BleakAdapters.tsx
│   │
│   ├── DynamicQuestionRenderer.tsx
│   └── index.ts       # All chat exports
│
├── demo/          # Demo and test components
│   ├── TestBleakAI.tsx
│   └── index.ts
│
├── ui/            # Reusable UI primitives
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── label.tsx
│   ├── radio-group.tsx
│   ├── separator.tsx
│   └── textarea.tsx
│
└── index.ts       # Main component exports
```

## Import Guidelines

### Recommended Import Patterns

```typescript
// Import from category level
import {Landing, ChatPage} from "@/components/pages";
import {Header, Footer} from "@/components/layout";
import {Bleak, Chatbot} from "@/components/features";

// Import specific chat components
import {SimpleInteractive, DynamicDemo} from "@/components/chat/interactive";
import {SliderQuestion, RadioQuestion} from "@/components/chat/questions";
import {LoadingSpinner, ErrorDisplay} from "@/components/chat/utils";

// Import UI primitives
import {Button, Input, Card} from "@/components/ui";
```

### Main Categories

- **pages/**: Complete page components that represent entire routes
- **layout/**: Components that define the app structure and navigation
- **features/**: Business logic components specific to app features
- **chat/**: All chat-related components, organized by purpose
- **ui/**: Reusable UI primitives and basic components

## Benefits of This Structure

1. **Clear Separation of Concerns**: Each directory has a specific purpose
2. **Easy Navigation**: Components are logically grouped
3. **Scalable**: Easy to add new components in the right category
4. **Maintainable**: Related components are co-located
5. **Import Clarity**: Import paths clearly indicate component purpose
