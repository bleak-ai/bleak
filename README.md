# Bleak - AI Chatbot with Time Travel

A modern AI chatbot application built with FastAPI backend and React frontend, featuring LangGraph-powered conversation management, time travel capabilities, and dynamic bleak element rendering.

## Features

### 🚀 Core Features

- **AI-Powered Conversations**: Intelligent chatbot using LangGraph for conversation flow
- **Real-time Chat Interface**: Modern, responsive chat UI with message history
- **Persistent Conversations**: Conversation state is maintained across sessions
- **Dynamic Bleak Elements**: Framework-agnostic component resolution for interactive elements

### ⏰ Time Travel Features

- **Conversation History**: View complete conversation history with all checkpoints
- **Message Editing**: Edit any previous user message and see how the conversation would have evolved differently
- **Checkpoint Resume**: Jump back to any point in the conversation and continue from there
- **Visual Timeline**: See all conversation states with timestamps and navigation controls

### 🎯 Bleak Element System

- **Framework-Agnostic**: Component resolution logic works with any UI framework
- **Type-Safe**: Full TypeScript support for element configuration
- **Extensible**: Easy to add new element types and components
- **Intelligent Fallbacks**: Graceful handling of unsupported element types

## Time Travel Usage

### Viewing History

1. Start a conversation with the AI
2. Click the "Show History" button in the chat header
3. Browse through all conversation checkpoints with timestamps

### Editing Messages

1. In the history view, hover over any user message
2. Click the "Edit" button that appears
3. Modify the message and press Enter or click "Save"
4. The conversation will continue from that point with the new message

### Resuming from Checkpoints

1. In the history view, find the checkpoint you want to resume from
2. Click the "Resume Here" button
3. The conversation will continue from that exact state

### Keyboard Shortcuts

- **Enter**: Save edited message
- **Escape**: Cancel editing
- **Shift+Enter**: New line in edit mode

## Bleak Element System

The application includes a sophisticated element resolution system powered by the `bleakai` library:

### Supported Element Types

- **Text Elements**: Open-ended text input fields
- **Radio Elements**: Single-choice selection with predefined options
- **Multi-select Elements**: Multiple choice selections with checkboxes
- **Slider Elements**: Numeric ratings and range selections

### Configuration

Elements are configured through a type-safe configuration system:

```typescript
const BLEAK_ELEMENT_CONFIG = {
  text: {
    component: TextBleakElement,
    description: "Use for open-ended text input"
  },
  radio: {
    component: RadioBleakElement,
    description: "Use for single-choice questions"
  }
  // ... more configurations
} satisfies BleakElementConfig;
```

### Dynamic Resolution

The system automatically resolves element types to appropriate UI components:

```typescript
const {Component, props} = resolve(element, value, onChange);
return <Component {...props} />;
```

## Technical Implementation

### Backend (FastAPI + LangGraph)

- **Checkpoint System**: Uses LangGraph's MemorySaver for state persistence
- **Time Travel API**: RESTful endpoints for history management
- **State Management**: Conversation states are stored with unique checkpoint IDs
- **Element Generation**: AI-powered generation of appropriate bleak elements

### Frontend (React + TypeScript)

- **Real-time Updates**: React Query for efficient data fetching and caching
- **Responsive Design**: Modern UI with Tailwind CSS
- **Interactive History**: Intuitive interface for browsing and editing conversation history
- **Component Resolution**: Framework-agnostic element rendering system

### Bleak Core Library

- **Framework Agnostic**: Pure TypeScript logic without UI dependencies
- **Type Safety**: Comprehensive TypeScript definitions and validation
- **Extensible**: Easy to add new element types and behaviors
- **Lightweight**: Minimal bundle size with zero framework dependencies

## API Endpoints

### Chat Endpoints

- `POST /chat` - Send a message to the chatbot
- `GET /chat/{conversation_id}/history` - Get conversation history with checkpoints
- `POST /chat/resume-from-checkpoint` - Resume conversation from a specific checkpoint
- `POST /chat/edit-message` - Edit a message at a specific checkpoint

### Health & Debug

- `GET /health` - Health check endpoint
- `GET /debug` - Debug information and available endpoints

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn src.main:app --host 0.0.0.0 --port 8008 --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Library Development

```bash
cd library
npm install
npm run build
npm link  # For local development
```

### Environment Variables

Create a `.env` file in the backend directory:

```
OPENAI_API_KEY=your_openai_api_key_here
# or other LLM provider keys as needed
```

## Architecture

The application follows modern patterns with separation of concerns:

### LangGraph Time Travel

- **State Persistence**: Every conversation step is checkpointed
- **Immutable History**: Previous states are preserved when editing
- **Branching Conversations**: Edits create new conversation branches
- **Efficient Storage**: Only state differences are stored between checkpoints

### Bleak Element System

- **Component Resolution**: Framework-agnostic logic determines UI components
- **Type Safety**: Strict TypeScript validation prevents runtime errors
- **Extensibility**: Plugin-like architecture for adding new element types
- **Fallback Handling**: Graceful degradation for unsupported elements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Adding New Element Types

1. Define the element configuration in the library
2. Create the UI component in the frontend
3. Register the component in the element registry
4. Update type definitions and documentation

## License

MIT License - see LICENSE file for details
