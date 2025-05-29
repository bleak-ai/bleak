# BleakAI - Dynamic Question Renderer Library

A powerful, flexible React library for rendering dynamic question components. BleakAI allows you to register custom UI components and dynamically render them based on question types, making it perfect for surveys, forms, chatbots, and interactive questionnaires.

## Features

- 🎨 **Component Registry**: Register any React component for specific question types
- 🔄 **Dynamic Rendering**: Automatically select and render the right component based on question type
- 🪝 **React Hooks**: Easy-to-use hooks for state management
- 🌍 **Context Provider**: Share renderer configuration across your app
- 📝 **TypeScript Support**: Full type safety and IntelliSense
- 🔧 **Configurable**: Customize behavior with options, fallbacks, and logging
- 🚀 **Lightweight**: Minimal dependencies, tree-shakeable

## Installation

```bash
npm install bleakai
```

## Basic Usage

### 1. Register Your Components

```tsx
import React from "react";
import {
  BleakProvider,
  ContextualDynamicQuestionRenderer,
  createDefaultConfig,
  createComponentRegistry
} from "bleakai";

// Your custom components
const TextInput = ({question, value, onChange}) => (
  <div>
    <label>{question}</label>
    <input value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const RadioGroup = ({question, options, value, onChange}) => (
  <div>
    <label>{question}</label>
    {options?.map((option, index) => (
      <label key={index}>
        <input
          type="radio"
          value={option}
          checked={value === option}
          onChange={(e) => onChange(e.target.value)}
        />
        {option}
      </label>
    ))}
  </div>
);

// Create component registry
const components = createComponentRegistry()
  .add("text", TextInput)
  .add("radio", RadioGroup)
  .build();

// Create configuration
const config = createDefaultConfig(components, {
  enableLogging: true
});

function App() {
  return (
    <BleakProvider config={config}>
      <MyForm />
    </BleakProvider>
  );
}
```

### 2. Render Dynamic Questions

```tsx
const MyForm = () => {
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      type: "text",
      question: "What is your name?"
    },
    {
      type: "radio",
      question: "What is your experience level?",
      options: ["Beginner", "Intermediate", "Advanced"]
    }
  ];

  return (
    <div>
      {questions.map((question, index) => (
        <ContextualDynamicQuestionRenderer
          key={index}
          question={question}
          value={answers[question.question] || ""}
          onChange={(value) =>
            setAnswers((prev) => ({
              ...prev,
              [question.question]: value
            }))
          }
          questionIndex={index}
        />
      ))}
    </div>
  );
};
```

## Advanced Usage

### Using the Hook API

```tsx
import {useBleakRenderer, DynamicQuestionRenderer} from "bleakai";

const MyComponent = () => {
  const {renderer, registerComponent} = useBleakRenderer({
    components: {
      text: TextInput,
      radio: RadioGroup
    }
  });

  // Register a new component dynamically
  const addSliderSupport = () => {
    registerComponent("slider", SliderComponent);
  };

  return (
    <div>
      <button onClick={addSliderSupport}>Add Slider Support</button>

      <DynamicQuestionRenderer
        question={{type: "text", question: "Enter your email"}}
        value=""
        onChange={console.log}
        config={{components: renderer.config.components}}
      />
    </div>
  );
};
```

### Custom Configuration

```tsx
const advancedConfig = createDefaultConfig(components, {
  enableLogging: true,
  fallbackComponent: DefaultQuestionComponent,
  customShouldHaveOptions: (type) =>
    ["radio", "select", "multiselect"].includes(type),
  customDefaultOptions: (type) => {
    if (type === "radio") return ["Yes", "No"];
    if (type === "rating") return ["1", "2", "3", "4", "5"];
    return [];
  }
});
```

## API Reference

### Types

#### `QuestionComponentProps`

```tsx
interface QuestionComponentProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
  questionIndex?: number;
  options?: string[];
  [key: string]: any; // Additional custom props
}
```

#### `BleakQuestion`

```tsx
interface BleakQuestion {
  type: string;
  question: string;
  options?: string[];
}
```

### Components

#### `BleakProvider`

Provides renderer configuration to child components.

```tsx
<BleakProvider config={rendererConfig}>{children}</BleakProvider>
```

#### `DynamicQuestionRenderer`

Renders a question component based on its type.

```tsx
<DynamicQuestionRenderer
  question={question}
  value={value}
  onChange={onChange}
  questionIndex={0}
  config={config}
/>
```

### Hooks

#### `useBleakRenderer(config)`

Returns a managed renderer instance with helper methods.

#### `useBleakContext()`

Access the renderer from BleakProvider context.

### Utilities

#### `createDefaultConfig(components, options)`

Creates a renderer configuration with sensible defaults.

#### `createComponentRegistry()`

Fluent builder for component registries.

```tsx
const registry = createComponentRegistry()
  .add("text", TextComponent)
  .add("radio", RadioComponent)
  .addMany({
    slider: SliderComponent,
    multiselect: MultiSelectComponent
  })
  .build();
```

## Migration from Existing Code

If you're migrating from an existing dynamic renderer, the process is straightforward:

1. **Extract your components**: Move your question components to separate files
2. **Update prop interfaces**: Ensure they match `QuestionComponentProps`
3. **Replace the registry**: Use BleakAI's component registry
4. **Update imports**: Replace your old renderer with BleakAI components

## Examples

Check out the `/examples` directory for complete working examples:

- Basic form with text and radio inputs
- Advanced survey with multiple question types
- Custom component integration
- Dynamic component registration

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Local Development & Testing

### Building the Library

```bash
npm run build
```

### Linking for Local Testing

To test this library in another project locally before publishing:

#### 1. Link the library globally (from this directory):

```bash
npm link
```

#### 2. In your test project, link to the library:

```bash
npm link bleakai
```

#### 3. Build and watch for changes:

```bash
npm run dev  # This will watch and rebuild on changes
```

### Alternative Method: Using npm pack

You can also create a tarball and install it directly:

#### 1. Create a package tarball:

```bash
npm pack
```

#### 2. In your test project, install the tarball:

```bash
npm install /path/to/bleakai-1.0.0.tgz
```

### Testing with Vite Projects

If you're testing with a Vite project and encounter issues with React duplicates, add this to your test project's `vite.config.js`:

```js
export default defineConfig({
  // ... other config
  resolve: {
    dedupe: ["react", "react-dom"]
  }
});
```

### Unlinking

To unlink when you're done testing:

#### 1. In your test project:

```bash
npm unlink bleakai
npm install  # Reinstall from npm registry
```

#### 2. In this library directory:

```bash
npm unlink
```

### Development Workflow

1. Make changes to the library
2. Run `npm run dev` to watch and rebuild
3. Test changes immediately in your linked project
4. When ready, run `npm run build` for a production build
5. Publish with `npm publish` when ready
