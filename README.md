# BleakAI - Transform AI Conversations into Structured Forms

**Stop making users type everything.** BleakAI transforms text-based AI conversations into smart form interactions. Instead of asking users to type responses, AI generates the right form components - date pickers, sliders, dropdowns - to get structured data from the start.

[![npm version](https://badge.fury.io/js/bleakai.svg)](https://badge.fury.io/js/bleakai)
[![CI](https://github.com/bleak-ai/bleak/actions/workflows/ci.yml/badge.svg)](https://github.com/bleak-ai/bleak/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Quick Start

```bash
npm install bleakai
```

```typescript
import {BleakSession} from "bleakai";

// 1. Map your components to AI element types
const elementConfig = {
  text: {
    component: TextInput,
    description: "Text input for detailed responses"
  },
  radio: {component: RadioGroup, description: "Single choice selection"},
  multi_select: {
    component: MultiSelect,
    description: "Multiple choice selection"
  }
};

// 2. Create a BleakAI session
const bleak = new BleakSession({
  apiKey: "your-api-key",
  baseUrl: "http://localhost:8008/bleak",
  elements: elementConfig
});

// 3. Start AI-powered conversations
const result = await bleak.startBleakConversation("Help me plan a vacation");

if (result.needsInput && result.questions) {
  // AI generated smart form questions - render them!
  const components = bleak.getBleakComponents(
    result.questions,
    answers,
    onChange
  );
}
```

**[📖 Get Started →](./docs/getting-started.md)**

---

## ❓ The Problem

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

## ✨ The BleakAI Solution

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

---

## 🎯 When to Use BleakAI

BleakAI is ideal when:

🤖 **The AI doesn't know yet what it needs to know**  
📋 **Forms must be generated on the fly, tailored to the conversation**  
🧩 **The form itself isn't the product, but rather input for another intelligent process**  
🔁 **User input refines a multi-step, dynamic decision or generation process**

---

## 🧩 Core Philosophy: "Bring Your Own Components"

BleakAI provides the **intelligence** to decide what components to use, while you maintain complete **control** over how they look and behave.

### Framework Agnostic

- ✅ **React, Vue, Angular, Vanilla JS**
- ✅ **Material-UI, Ant Design, Chakra UI, Custom Components**
- ✅ **Your existing design system**

### Smart Generation

- 🎯 AI analyzes conversation context
- 🔧 Generates appropriate form components
- 📊 Returns structured data (no parsing!)

---

## 🏗 How It Works

### 1. **Map Your Components**

```typescript
const elementConfig = {
  text: {component: YourTextInput, description: "Text input"},
  radio: {component: YourRadioGroup, description: "Single choice"},
  multi_select: {component: YourMultiSelect, description: "Multiple choice"},
  slider: {component: YourSlider, description: "Number ranges"},
  date: {component: YourDatePicker, description: "Date selection"}
};
```

### 2. **AI Picks the Right Components**

```typescript
// User: "I need help booking a restaurant"
// AI analyzes and generates appropriate form elements

const result = await bleak.startBleakConversation(userMessage);
// AI returns: date picker, time selector, party size, dietary checkboxes
```

### 3. **Get Perfect Structured Data**

Instead of parsing "next Friday around 7pm for 4 people", you get:

```json
{
  "date": "2024-03-15",
  "time": "19:00",
  "partySize": 4,
  "dietary": ["vegetarian"]
}
```

---

## 📱 Framework Examples

### React

```tsx
const components = bleak.getBleakComponents(questions, answers, onChange);
components.map(({Component, props, key}) => <Component key={key} {...props} />);
```

### Vue

```vue
<component
  v-for="resolved in resolvedComponents"
  :key="resolved.key"
  :is="resolved.component"
  v-bind="resolved.props"
/>
```

### Angular

```typescript
// Coming soon - Angular adapter
```

---

## 🎬 Examples

### 🗂 Working Demos

- **[React Example](./examples/react/)** - Complete implementation with custom components
- **[Vue Example](./examples/vue/)** - Coming soon
- **[Angular Example](./examples/angular/)** - Coming soon

### 🎯 Use Cases

- **Travel Planning** - Budget sliders, activity multi-select, date pickers
- **Product Recommendations** - Feature checkboxes, price ranges, category selection
- **Event Planning** - Guest count, venue selection, catering preferences
- **Support Triage** - Issue categories, priority levels, device selection

**[🔍 More Examples →](./docs/examples.md)**

---

## 📚 Documentation

### 📖 **Guides**

- **[Getting Started](./docs/getting-started.md)** - Quick setup and first implementation
- **[Architecture](./docs/architecture.md)** - How BleakAI works under the hood
- **[Examples](./docs/examples.md)** - Real-world implementation examples

### 🔧 **Reference**

- **[API Reference](./docs/api-reference.md)** - Complete API documentation
- **[Contributing](./docs/contributing.md)** - How to contribute to BleakAI
- **[Deployment](./docs/deployment.md)** - Publishing and release guide

---

## 🏗 Project Structure

```
bleak/
├── packages/
│   └── bleakai/           # 📦 Core TypeScript library
├── apps/
│   └── website/           # 🌐 Documentation site
├── examples/
│   └── react/             # ⚛️ React example implementation
└── docs/                  # 📚 Documentation files
```

---

## 🚦 Project Status

- ✅ **Core Library**: Stable and production-ready
- ✅ **React Integration**: Full support with hooks and utilities
- ✅ **TypeScript**: Complete type definitions
- 🔄 **Vue Integration**: Planned for next release
- 🔄 **Angular Integration**: Planned for future release

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/contributing.md) for details.

### 🎯 Areas We Need Help

- **Vue.js example** implementation
- **Angular example** implementation
- **Additional component types** (file upload, rich text, location)
- **Performance optimizations**
- **Documentation** improvements

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🔗 Links

- **[📖 Documentation](./docs/README.md)** - Complete documentation
- **[🎬 React Example](./examples/react/)** - Working demo
- **[🐛 Issues](https://github.com/bleak-ai/bleak/issues)** - Bug reports and feature requests
- **[💬 Discussions](https://github.com/bleak-ai/bleak/discussions)** - Questions and community

---

**Ready to transform your AI conversations?** → **[Get Started](./docs/getting-started.md)**
