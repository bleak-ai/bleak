# bleakai - Framework-Agnostic Bleak Element Component Resolver

A truly framework-agnostic library that handles the **logic** of determining which component to use for dynamic bleak elements. No rendering, no framework dependencies - just pure component resolution logic.

## 🌟 Features

- **Zero Framework Dependencies**: Works with React, Vue, Angular, Svelte, plain JS, anything
- **Pure Logic**: Only handles component selection - you handle rendering
- **Type Safe**: Full TypeScript support
- **Tiny**: Minimal bundle size with no framework bloat
- **Intuitive**: Simple API that's easy to understand and use

## 📦 Installation

```bash
npm install bleakai
```

## 🚀 Quick Start

### The Core Concept

1. **Define your config** following the library's type structure (single source of truth)
2. **Use the library's helper** to create a resolver from your config
3. **Get components and props** directly - no manual mapping needed!

```typescript
import {createResolverFromConfig, type BleakElementConfig} from "bleakai";
import {TextInput, RadioGroup, TextArea} from "./my-components";

// 1. Define your config - enforced by library types!
const BLEAK_CONFIG = {
  text: {
    component: TextInput,
    description: "Use for open-ended text input"
  },
  radio: {
    component: RadioGroup,
    description: "Use for single choice from options"
  },
  textarea: {
    component: TextArea,
    description: "Use for longer text input"
  }
} satisfies BleakElementConfig;

// 2. Create resolver from config (super smooth!)
const {resolve} = createResolverFromConfig(BLEAK_CONFIG);

// 3. Use it - get Component and props directly!
function DynamicBleakElement({element, value, onChange}) {
  const {Component, props} = resolve(element, value, onChange);
  return <Component {...props} />;
}
```

### Why This Approach Rocks

✅ **Single source of truth** - your config defines everything  
✅ **Type enforced** - library ensures you follow the right structure  
✅ **No manual mapping** - library handles component resolution  
✅ **Framework agnostic** - same pattern works everywhere

## 🎯 Framework Examples

### React

```tsx
import {createResolver} from "bleakai";
import {TextInput, RadioGroup, TextArea} from "./my-components";

// Your component registry
const components = {
  TextInput,
  RadioGroup,
  TextArea
};

// Component map for the resolver
const componentMap = {
  text: "TextInput",
  radio: "RadioGroup",
  textarea: "TextArea"
};

function DynamicBleakElement({element, value, onChange}) {
  const resolver = createResolver(componentMap);
  const {componentKey, props} = resolver.resolve(element, value, onChange);

  // Get the actual component from your registry
  const Component = components[componentKey];

  return <Component {...props} />;
}

// Usage
function App() {
  const [value, setValue] = useState("");
  const element = {type: "text", text: "Enter your name:"};

  return (
    <DynamicBleakElement element={element} value={value} onChange={setValue} />
  );
}
```

### Vue

```vue
<template>
  <component :is="resolvedComponent" v-bind="resolvedProps" />
</template>

<script setup>
import {computed} from "vue";
import {createResolver} from "bleakai";
import TextInput from "./TextInput.vue";
import RadioGroup from "./RadioGroup.vue";

const props = defineProps(["element", "value", "onChange"]);

// Your component registry
const components = {
  TextInput,
  RadioGroup
};

// Component map
const componentMap = {
  text: "TextInput",
  radio: "RadioGroup"
};

const resolver = createResolver(componentMap);

const resolved = computed(() =>
  resolver.resolve(props.element, props.value, props.onChange)
);

const resolvedComponent = computed(
  () => components[resolved.value.componentKey]
);
const resolvedProps = computed(() => resolved.value.props);
</script>
```

### Vanilla JavaScript

```javascript
import {createResolver} from "bleakai";

// Your component factory functions
const components = {
  TextInput: (props) => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = props.value;
    input.placeholder = props.text;
    input.addEventListener("input", (e) => props.onChange(e.target.value));
    return input;
  },

  RadioGroup: (props) => {
    const container = document.createElement("div");
    container.innerHTML = `<label>${props.text}</label>`;

    props.options?.forEach((option) => {
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.value = option;
      radio.checked = props.value === option;
      radio.addEventListener("change", () => props.onChange(option));

      label.appendChild(radio);
      label.appendChild(document.createTextNode(option));
      container.appendChild(label);
    });

    return container;
  }
};

// Component map
const componentMap = {
  text: "TextInput",
  radio: "RadioGroup"
};

// Usage
function renderBleakElement(targetElement, element, value, onChange) {
  const resolver = createResolver(componentMap);
  const {componentKey, props} = resolver.resolve(element, value, onChange);

  // Get the factory function and create the element
  const factory = components[componentKey];
  const domElement = factory(props);

  targetElement.innerHTML = "";
  targetElement.appendChild(domElement);
}

// Example usage
const targetEl = document.getElementById("element-container");
const element = {type: "text", text: "Enter your email:"};
renderBleakElement(targetEl, element, "", (value) =>
  console.log("Value:", value)
);
```

## 🎨 Advanced Usage

### Batch Processing

```typescript
import {resolveElements} from "bleakai";

const elements = [
  {type: "text", text: "Name?"},
  {type: "radio", text: "Experience?", options: ["Beginner", "Expert"]}
];

const values = {"Name?": "John", "Experience?": "Expert"};

const resolved = resolveElements(
  elements,
  values,
  (elementText, value) => console.log(elementText, "=", value),
  {text: "TextInput", radio: "RadioGroup"}
);

// Now render each resolved component in your framework
resolved.forEach(({componentKey, props}, index) => {
  // Your rendering logic here
});
```

### Custom Resolver with Options

```typescript
import {BleakResolver} from "bleakai";

const resolver = new BleakResolver({
  components: {
    text: "TextInput",
    radio: "RadioGroup",
    slider: "SliderInput"
  },
  fallbackComponent: "TextInput",
  shouldHaveOptions: (type) => ["radio", "select"].includes(type),
  getDefaultOptions: (type) => (type === "radio" ? ["Yes", "No"] : []),
  logger: {
    onResolve: (type, componentKey) =>
      console.log(`Resolved ${type} to ${componentKey}`),
    onFallback: (type, fallback, reason) =>
      console.warn(`Fallback for ${type}: ${reason}`)
  }
});

const result = resolver.resolve({type: "unknown", text: "Test?"}, "", () => {});
// Will use fallback component
```

## 🔧 API Reference

### Types

```typescript
interface BleakElement {
  type: string;
  text: string;
  options?: string[] | null;
}

interface BleakElementProps {
  text: string;
  value: string;
  onChange: (value: string) => void;
  elementIndex?: number;
  options?: string[];
}

interface ComponentResolution {
  type: string;
  componentKey: string;
  props: BleakElementProps;
}
```

### Functions

- `createResolver(componentMap, options?)` - Quick resolver setup
- `resolveElement(element, value, onChange, componentMap)` - One-off resolution
- `resolveElements(elements, values, onChange, componentMap)` - Batch resolution
- `createStandardComponentMap(customComponents?)` - Helper for common component types

### Classes

- `BleakResolver` - Main resolver class with full configuration options

## 🛠️ Local Development & Testing

### Building and Linking Locally

If you want to test local changes to this library in your project:

1. **Build the library:**

   ```bash
   cd library
   npm run build
   ```

2. **Create a local npm link:**

   ```bash
   npm link
   ```

3. **In your project, link to the local version:**

   ```bash
   cd your-project
   npm link bleakai
   ```

4. **After making changes, rebuild and test:**
   ```bash
   cd library
   npm run build
   # Changes will be automatically available in your linked project
   ```

### Testing the Build

To test that the library builds correctly and all exports work:

```bash
cd library
npm run build
npm run test  # If you have tests set up
```

### Unlinking

When you're done with local development:

```bash
# In your project
npm unlink bleakai

# In the library
npm unlink

# Then reinstall the published version
cd your-project
npm install bleakai
```

### Development Workflow

1. Make changes to the library code
2. Run `npm run build` in the library directory
3. Test in your linked project
4. Repeat until satisfied
5. Commit and publish when ready

### Common Issues

- **Changes not reflecting**: Make sure to rebuild (`npm run build`) after code changes
- **Type errors**: Ensure TypeScript is generating declaration files correctly
- **Import errors**: Check that the `package.json` exports are configured properly

## 💡 Why This Approach?

1. **True Framework Agnostic**: No framework dependencies at all
2. **Separation of Concerns**: Logic vs. rendering are completely separate
3. **Lightweight**: Tiny bundle size
4. **Flexible**: Use any component library, any rendering approach
5. **Type Safe**: Full TypeScript support
6. **Intuitive**: Easy to understand and debug

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## Quick Start with High-Level Utilities

The `bleakai` package now includes high-level utilities that make it incredibly easy to implement conversational AI in any application:

### Simple Conversation Flow

```typescript
import {
  startConversation,
  continueConversation,
  finishConversation,
  getChatErrorMessage
} from "bleakai";

// Configure your app
const config = {
  baseUrl: "https://your-api.com",
  apiKey: "your-api-key",
  timeout: 30000
};

// Start a conversation
const {response, client} = await startConversation(
  "Help me plan a vacation",
  config
);

// Handle the response based on type - much cleaner!
switch (response.type) {
  case "questions":
    // Show questions to user and collect answers
    const answers = await collectAnswersFromUser(response.questions);
    const nextResponse = await continueConversation(client, answers);
    break;

  case "answer":
    // Display the final answer
    console.log("Final answer:", response.content);
    break;

  case "clarification":
    // Handle clarification requests
    const clarificationAnswers = await handleClarification(response.questions);
    const clarifiedResponse = await continueConversation(
      client,
      clarificationAnswers
    );
    break;
}
```

### Error Handling Made Simple

```typescript
try {
  const result = await startConversation(prompt, config);
  // Handle result...
} catch (error) {
  const userFriendlyMessage = getChatErrorMessage(error);
  console.error("Chat error:", userFriendlyMessage);
}
```

### Before vs After

**Before (complex):**

```typescript
// Had to write all this boilerplate in every app
const client = createChatClient({baseUrl: API_URL, apiKey});
const response = await client.ask(prompt);

if (hasQuestions(response)) {
  // handle questions
} else if (isAnswer(response)) {
  // handle answer
} else if (isComplete(response)) {
  // handle completion
}
```

**After (simple):**

```typescript
// Just import and use - no boilerplate!
const {response, client} = await startConversation(prompt, config);

switch (response.type) {
  case "questions" /* handle */:
    break;
  case "answer" /* handle */:
    break;
  case "clarification" /* handle */:
    break;
}
```

The package now handles all the complexity internally, so you can focus on your application logic!
