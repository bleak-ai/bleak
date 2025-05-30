# Question Configuration Editor

A beautiful, interactive UI component that allows users to customize how AI generates questions for their interactive chat experience.

## Features

### 🎨 **Card-Based Question Type Editor**

- **Visual Card Layout**: Each question type displayed in an intuitive card format
- **Modal Editing**: Click any enabled card to open a detailed editing modal
- **Enable/Disable**: Toggle question types on/off with visual feedback
- **Rose Theme**: Beautiful rose-colored design matching the project theme
- **Collapsible Interface**: Minimize when not needed to focus on chat

### 🔧 **Customization Options**

- **Question Type Names**: Customize how each type is labeled
- **AI Instructions**: Modify descriptions to guide AI behavior
- **Selective Enabling**: Choose which question types the AI can use
- **Reset & Restore**: Easy reset to original configuration

## How It Works

### 1. **Configuration Interface**

The `BleakElementConfigEditor` component appears above the chat interface with:

- **Card Grid**: Four question types displayed as interactive cards
- **Visual Status**: Enabled/disabled states clearly indicated
- **Modal Editing**: Click enabled cards to open editing modal
- **Collapsible Design**: Can be minimized to save space

### 2. **API Integration**

When a user starts a chat session:

- Custom configuration is converted to API format
- Only enabled question types are sent to the backend
- AI uses the custom descriptions to generate appropriate questions
- Questions rendered use the same components but follow custom guidance

### 3. **Dynamic Rendering**

- Questions display custom type names in the UI
- Active question types are shown in the questions section
- User can see which customizations are being applied

## Usage

### Basic Integration

```tsx
import {
  BleakElementConfigEditor,
  type CustomBleakElementConfig
} from "./components/chat/config";

function MyApp() {
  const [customConfig, setCustomConfig] =
    useState<CustomBleakElementConfig | null>(null);

  return (
    <div>
      <BleakElementConfigEditor
        onConfigChange={setCustomConfig}
        isCollapsed={false}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <SimpleInteractive customConfig={customConfig} />
    </div>
  );
}
```

## Question Types

### 📝 **Text**

- **Purpose**: Open-ended responses requiring detailed input
- **Best for**: Names, descriptions, explanations, custom feedback
- **API behavior**: Never includes options array

### ⚪ **Radio**

- **Purpose**: Single-choice selection from predefined options
- **Best for**: Yes/no questions, preferences, categorical choices
- **API behavior**: Always includes 2-5 options

### ☑️ **Multi-select**

- **Purpose**: Multiple selection from a list of options
- **Best for**: Skills, features, interests, tags
- **API behavior**: Always includes 3+ options

### 🎚️ **Slider**

- **Purpose**: Numeric input, ratings, ranges
- **Best for**: Satisfaction ratings, budgets, scales
- **API behavior**: Includes min/max values or scale labels

## Design Features

### 🎨 **Visual Design**

- **Rose Color Scheme**: Consistent with project theme (rose-500 primary)
- **Card Layout**: 4-column responsive grid on desktop, stacks on mobile
- **Modal Interface**: Clean, focused editing experience
- **Status Indicators**: Clear enabled/disabled visual states

### 🖱️ **Interactions**

- **Click to Edit**: Click any enabled card to open editing modal
- **Toggle Enable**: Quick enable/disable without opening modal
- **Hover Effects**: Subtle visual feedback on interactions
- **Responsive**: Works beautifully on all screen sizes

## Customization Examples

### Enable Only Text Questions

```typescript
const textOnlyConfig: CustomBleakElementConfig = {
  text: {
    name: "Open Question",
    description:
      "Use for all types of questions where you want maximum flexibility",
    enabled: true
  },
  radio: {enabled: false},
  multi_select: {enabled: false},
  slider: {enabled: false}
};
```

### Custom Survey Setup

```typescript
const surveyConfig: CustomBleakElementConfig = {
  text: {
    name: "Feedback",
    description: "Use for detailed explanations and qualitative insights",
    enabled: true
  },
  radio: {
    name: "Choice",
    description: "Use for satisfaction levels and preferences",
    enabled: true
  },
  multi_select: {enabled: false},
  slider: {enabled: false}
};
```

## Architecture

### Components

- **`BleakElementConfigEditor`**: Main card-based configuration interface
- **`SimpleInteractive`**: Updated to accept custom config
- **`QuestionsSection`**: Shows active question types
- **Modal Dialog**: Shadcn dialog for editing experience

### Data Flow

1. User interacts with question type cards
2. Modal opens for detailed editing of enabled types
3. Configuration passed to `SimpleInteractive`
4. Converted to API format and sent with chat requests
5. AI generates questions following custom guidelines
6. Questions rendered with custom type names and behaviors

### API Integration

- Custom configuration sent as `bleak_elements` in API calls
- Only enabled question types included
- Descriptions guide AI question generation behavior
- Maintains compatibility with existing question components
