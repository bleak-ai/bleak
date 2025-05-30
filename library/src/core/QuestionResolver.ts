import type {
  Question,
  QuestionProps,
  ComponentResolution,
  ComponentRegistry,
  ResolverOptions,
  QuestionConfig
} from "../types/core";

export class QuestionResolver {
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
    question: Question,
    value: string,
    onChange: (value: string) => void,
    questionIndex?: number
  ): ComponentResolution {
    // Get the component key for this question type
    const componentKey =
      this.components[question.type] || this.options.fallbackComponent!;

    // Log if we're using fallback
    if (!this.components[question.type] && this.options.logger?.onFallback) {
      this.options.logger.onFallback(
        question.type,
        componentKey,
        `No component found for type "${question.type}"`
      );
    }

    // Log successful resolution
    if (this.options.logger?.onResolve) {
      this.options.logger.onResolve(question.type, componentKey);
    }

    // Determine if this question type should have options
    const shouldHaveOptions = this.options.shouldHaveOptions!(question.type);
    let options = question.options || [];

    // If no options provided but type should have options, use defaults
    if (shouldHaveOptions && (!options || options.length === 0)) {
      options = this.options.getDefaultOptions!(question.type);
    }

    // Build the props
    const props: QuestionProps = {
      question: question.question,
      value,
      onChange,
      questionIndex,
      ...(options.length > 0 && {options})
    };

    return {
      type: question.type,
      componentKey,
      props
    };
  }
}

/**
 * Create a resolver from a QuestionConfig object
 * This is the smooth integration function that works with the user's config
 */
export function createResolverFromConfig<T extends QuestionConfig>(
  config: T,
  options: ResolverOptions = {}
): {
  resolver: QuestionResolver;
  components: Record<string, T[keyof T]["component"]>;
  resolve: (
    question: Question,
    value: string,
    onChange: (value: string) => void,
    questionIndex?: number
  ) => ComponentResolution & {Component: T[keyof T]["component"]};
} {
  // Extract component mapping from config
  const componentRegistry: ComponentRegistry = {};
  const componentMap: Record<string, T[keyof T]["component"]> = {};

  Object.entries(config).forEach(([type, config]) => {
    componentRegistry[type] = type; // Use type as key for resolution
    componentMap[type] = config.component;
  });

  const resolver = new QuestionResolver(componentRegistry, options);

  // Enhanced resolve function that returns both resolution and actual component
  const resolve = (
    question: Question,
    value: string,
    onChange: (value: string) => void,
    questionIndex?: number
  ) => {
    const resolution = resolver.resolve(
      question,
      value,
      onChange,
      questionIndex
    );
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
  return new QuestionResolver(components, options);
}

export function resolveQuestion(
  question: Question,
  value: string,
  onChange: (value: string) => void,
  componentMap: ComponentRegistry,
  questionIndex?: number
): ComponentResolution {
  const resolver = new QuestionResolver(componentMap);
  return resolver.resolve(question, value, onChange, questionIndex);
}

export function resolveQuestions(
  questions: Question[],
  values: Record<string, string>,
  onChange: (question: string, value: string) => void,
  componentMap: ComponentRegistry
): ComponentResolution[] {
  const resolver = new QuestionResolver(componentMap);

  return questions.map((question, index) =>
    resolver.resolve(
      question,
      values[question.question] || "",
      (value) => onChange(question.question, value),
      index
    )
  );
}
