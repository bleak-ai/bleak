import type {
  BleakElement,
  ComponentResolution,
  ComponentRegistry,
  ResolverOptions,
  BleakElementConfig
} from "../types/core";
import type {
  ComponentMapping,
  FormQuestion,
  ResolvedComponent,
  ComponentProps
} from "../types/components";

// Internal counter for generating unique IDs
let globalElementCounter = 0;

// Generate a unique ID for an element
function generateUniqueId(type: string, elementIndex?: number): string {
  const timestamp = Date.now();
  const counter = ++globalElementCounter;
  const index = elementIndex ?? counter;
  return `bleak-${type}-${index}-${timestamp}-${counter}`;
}

export class BleakResolver {
  private components: ComponentRegistry;
  private options: ResolverOptions;

  constructor(components: ComponentRegistry, options: ResolverOptions = {}) {
    this.components = components;
    this.options = {
      fallbackComponent: "text",
      shouldHaveOptions: (type) =>
        ["radio", "multi_select", "slider"].includes(type),
      getDefaultOptions: (type) => (type === "radio" ? ["Yes", "No"] : []),
      ...options
    };
  }

  resolve(
    element: BleakElement,
    value: string,
    onChange: (value: string) => void,
    elementIndex?: number
  ): ComponentResolution {
    // Get the component key for this element type
    const componentKey =
      this.components[element.type] || this.options.fallbackComponent!;

    // Log if we're using fallback
    if (!this.components[element.type] && this.options.logger?.onFallback) {
      this.options.logger.onFallback(
        element.type,
        componentKey,
        `No component found for type "${element.type}"`
      );
    }

    // Log successful resolution
    if (this.options.logger?.onResolve) {
      this.options.logger.onResolve(element.type, componentKey);
    }

    // Determine if this element type should have options
    const shouldHaveOptions = this.options.shouldHaveOptions!(element.type);
    let options = element.options || [];

    // If no options provided but type should have options, use defaults
    if (shouldHaveOptions && (!options || options.length === 0)) {
      options = this.options.getDefaultOptions!(element.type);
    }

    // Generate unique ID for this element
    const uniqueId = generateUniqueId(element.type, elementIndex);

    // Build the props - completely framework agnostic
    const props: Record<string, any> = {
      text: element.text,
      value,
      onChange,
      uniqueId,
      elementIndex,
      ...(options.length > 0 && {options})
    };

    return {
      type: element.type,
      componentKey,
      props
    };
  }
}

/**
 * Create a resolver from a BleakElementConfig object
 * This is the smooth integration function that works with the user's config
 */
export function createResolverFromConfig<T extends BleakElementConfig>(
  config: T,
  options: ResolverOptions = {}
): {
  resolver: BleakResolver;
  components: Record<string, T[keyof T]["component"]>;
  resolve: (
    element: BleakElement,
    value: string,
    onChange: (value: string) => void,
    elementIndex?: number
  ) => ComponentResolution & {Component: any};
} {
  // Extract component mapping from config
  const componentRegistry: ComponentRegistry = {};
  const componentMap: Record<string, T[keyof T]["component"]> = {};

  Object.entries(config).forEach(([type, config]) => {
    componentRegistry[type] = type; // Use type as key for resolution
    componentMap[type] = config.component;
  });

  const resolver = new BleakResolver(componentRegistry, options);

  // Enhanced resolve function that returns both resolution and actual component
  const resolve = (
    element: BleakElement,
    value: string,
    onChange: (value: string) => void,
    elementIndex?: number
  ) => {
    const resolution = resolver.resolve(element, value, onChange, elementIndex);
    const Component = componentMap[resolution.componentKey];

    return {
      ...resolution,
      Component
    };
  };

  return {
    resolver,
    components: componentMap,
    resolve
  };
}

// Keep existing simple functions for backwards compatibility
export function createResolver(
  components: ComponentRegistry,
  options: ResolverOptions = {}
) {
  return new BleakResolver(components, options);
}

export function resolveElement(
  element: BleakElement,
  value: string,
  onChange: (value: string) => void,
  componentMap: ComponentRegistry,
  elementIndex?: number
): ComponentResolution {
  const resolver = new BleakResolver(componentMap);
  return resolver.resolve(element, value, onChange, elementIndex);
}

export function resolveElements(
  elements: BleakElement[],
  values: Record<string, string>,
  onChange: (elementText: string, value: string) => void,
  componentMap: ComponentRegistry
): ComponentResolution[] {
  const resolver = new BleakResolver(componentMap);

  return elements.map((element, index) =>
    resolver.resolve(
      element,
      values[element.text] || "",
      (value) => onChange(element.text, value),
      index
    )
  );
}

/**
 * Create a simple, intuitive component resolver from your component mapping
 * This is the new, preferred way to resolve components
 *
 * @example
 * ```typescript
 * const resolver = createComponentResolver({
 *   text: { component: MyTextInput, description: "For text input" },
 *   radio: { component: MyRadioGroup, description: "For single choice" }
 * });
 *
 * const resolved = resolver.resolve(question, value, onChange);
 * // resolved.Component is your actual component
 * // resolved.props contains the props to pass
 * ```
 */
export function createComponentResolver<TComponent = any>(
  componentMapping: ComponentMapping<TComponent>
): {
  /** Resolve a single question to a component */
  resolve(
    question: FormQuestion,
    value: string,
    onChange: (value: string) => void
  ): ResolvedComponent<TComponent>;
  /** Resolve multiple questions to components */
  resolveAll(
    questions: FormQuestion[],
    answers: Record<string, string>
  ): ResolvedComponent<TComponent>[];
  /** Get the component for a specific type */
  getComponent(type: string): TComponent | undefined;
} {
  return {
    resolve(
      question: FormQuestion,
      value: string,
      onChange: (value: string) => void
    ): ResolvedComponent<TComponent> {
      const config = componentMapping[question.type];

      if (!config) {
        throw new Error(
          `No component configured for type: ${
            question.type
          }. Available types: ${Object.keys(componentMapping).join(", ")}`
        );
      }

      const props: ComponentProps = {
        question: question.question,
        value,
        onChange,
        options: question.options,
        id: `bleak-${question.type}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`
      };

      return {
        Component: config.component,
        props,
        question
      };
    },

    resolveAll(
      questions: FormQuestion[],
      answers: Record<string, string>
    ): ResolvedComponent<TComponent>[] {
      return questions.map((question) => {
        const value = answers[question.question] || "";
        const onChange = (newValue: string) => {
          answers[question.question] = newValue;
        };

        return this.resolve(question, value, onChange);
      });
    },

    getComponent(type: string): TComponent | undefined {
      return componentMapping[type]?.component;
    }
  };
}
