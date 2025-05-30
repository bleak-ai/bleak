# @bleakai/core - Framework-Agnostic Question Component Resolver

A truly framework-agnostic library that handles the **logic** of determining which component to use for dynamic questions. No rendering, no framework dependencies - just pure component resolution logic.

## 🌟 Features

- **Zero Framework Dependencies**: Works with React, Vue, Angular, Svelte, plain JS, anything
- **Pure Logic**: Only handles component selection - you handle rendering
- **Type Safe**: Full TypeScript support
- **Tiny**: Minimal bundle size with no framework bloat
- **Intuitive**: Simple API that's easy to understand and use

## 📦 Installation

```bash
npm install @bleakai/core
```

## 🚀 Quick Start

### The Core Concept

1. **Define your config** following the library's type structure (single source of truth)
2. **Use the library's helper** to create a resolver from your config
3. **Get components and props** directly - no manual mapping needed!

```typescript
import {createResolverFromConfig, type QuestionConfig} from "@bleakai/core";
import {TextInput, RadioGroup, TextArea} from "./my-components";

// 1. Define your config - enforced by library types!
const QUESTION_CONFIG = {
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
} satisfies QuestionConfig;

// 2. Create resolver from config (super smooth!)
const {resolve} = createResolverFromConfig(QUESTION_CONFIG);

// 3. Use it - get Component and props directly!
function DynamicQuestion({question, value, onChange}) {
  const {Component, props} = resolve(question, value, onChange);
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
import {createResolver} from "@bleakai/core";
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

function DynamicQuestion({question, value, onChange}) {
  const resolver = createResolver(componentMap);
  const {componentKey, props} = resolver.resolve(question, value, onChange);

  // Get the actual component from your registry
  const Component = components[componentKey];

  return <Component {...props} />;
}

// Usage
function App() {
  const [value, setValue] = useState("");
  const question = {type: "text", question: "Enter your name:"};

  return (
    <DynamicQuestion question={question} value={value} onChange={setValue} />
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
import {createResolver} from "@bleakai/core";
import TextInput from "./TextInput.vue";
import RadioGroup from "./RadioGroup.vue";

const props = defineProps(["question", "value", "onChange"]);

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
  resolver.resolve(props.question, props.value, props.onChange)
);

const resolvedComponent = computed(
  () => components[resolved.value.componentKey]
);
const resolvedProps = computed(() => resolved.value.props);
</script>
```

### Vanilla JavaScript

```javascript
import {createResolver} from "@bleakai/core";

// Your component factory functions
const components = {
  TextInput: (props) => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = props.value;
    input.placeholder = props.question;
    input.addEventListener("input", (e) => props.onChange(e.target.value));
    return input;
  },

  RadioGroup: (props) => {
    const container = document.createElement("div");
    container.innerHTML = `<label>${props.question}</label>`;

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
function renderQuestion(targetElement, question, value, onChange) {
  const resolver = createResolver(componentMap);
  const {componentKey, props} = resolver.resolve(question, value, onChange);

  // Get the factory function and create the element
  const factory = components[componentKey];
  const element = factory(props);

  targetElement.innerHTML = "";
  targetElement.appendChild(element);
}

// Example usage
const targetEl = document.getElementById("question-container");
const question = {type: "text", question: "Enter your email:"};
renderQuestion(targetEl, question, "", (value) => console.log("Value:", value));
```

## 🎨 Advanced Usage

### Batch Processing

```typescript
import {resolveQuestions} from "@bleakai/core";

const questions = [
  {type: "text", question: "Name?"},
  {type: "radio", question: "Experience?", options: ["Beginner", "Expert"]}
];

const values = {"Name?": "John", "Experience?": "Expert"};

const resolved = resolveQuestions(
  questions,
  values,
  (questionText, value) => console.log(questionText, "=", value),
  {text: "TextInput", radio: "RadioGroup"}
);

// Now render each resolved component in your framework
resolved.forEach(({componentKey, props}, index) => {
  // Your rendering logic here
});
```

### Custom Resolver with Options

```typescript
import {QuestionResolver} from "@bleakai/core";

const resolver = new QuestionResolver({
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

const result = resolver.resolve(
  {type: "unknown", question: "Test?"},
  "",
  () => {}
);
// Will use fallback component
```

## 🔧 API Reference

### Types

```typescript
interface Question {
  type: string;
  question: string;
  options?: string[] | null;
}

interface QuestionProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
  questionIndex?: number;
  options?: string[];
}

interface ComponentResolution {
  type: string;
  componentKey: string;
  props: QuestionProps;
}
```

### Functions

- `createResolver(componentMap, options?)` - Quick resolver setup
- `resolveQuestion(question, value, onChange, componentMap)` - One-off resolution
- `resolveQuestions(questions, values, onChange, componentMap)` - Batch resolution
- `createStandardComponentMap(customComponents?)` - Helper for common component types

### Classes

- `QuestionResolver` - Main resolver class with full configuration options

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
   npm link @bleakai/core
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
npm unlink @bleakai/core

# In the library
npm unlink

# Then reinstall the published version
cd your-project
npm install @bleakai/core
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
