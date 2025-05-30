import {
  Question,
  QuestionProps,
  ComponentResolution,
  ResolverConfig,
  ComponentRegistry
} from "./types";

/**
 * Framework-agnostic question resolver
 *
 * This class handles the logic of determining which component should be used
 * for a given question, but doesn't handle actual rendering. Users get back
 * a component key and props, then render it however they want in their framework.
 */
export class QuestionResolver {
  private config: ResolverConfig;

  constructor(config: ResolverConfig) {
    this.config = config;
    this.logRegistration();
  }

  /**
   * Log the component registry on construction
   */
  private logRegistration(): void {
    if (this.config.logger?.onResolve) {
      Object.entries(this.config.components).forEach(([type, componentKey]) => {
        console.log(`📝 Registered ${type} → ${componentKey}`);
      });
    }
  }

  /**
   * Register a new component type mapping
   */
  registerComponent(type: string, componentKey: string): void {
    this.config.components[type] = componentKey;

    if (this.config.logger?.onResolve) {
      console.log(`📝 Registered ${type} → ${componentKey}`);
    }
  }

  /**
   * Check if a type is supported
   */
  isSupportedType(type: string): boolean {
    return type.toLowerCase() in this.config.components;
  }

  /**
   * Get list of supported types
   */
  getSupportedTypes(): string[] {
    return Object.keys(this.config.components);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ResolverConfig>): void {
    this.config = {...this.config, ...newConfig};
  }

  /**
   * Resolve a question to component key and props
   * This is the main method - it returns what component to use and the props for it
   */
  resolve(
    question: Question,
    value: string,
    onChange: (value: string) => void,
    questionIndex?: number
  ): ComponentResolution {
    const {type, options} = question;
    const normalizedType = type.toLowerCase();

    // Normalize null options to undefined for better compatibility
    const normalizedOptions = options === null ? undefined : options;

    // Get the component key for this type
    const componentKey = this.config.components[normalizedType];

    // Handle logging
    if (componentKey && this.config.logger?.onResolve) {
      this.config.logger.onResolve(type, componentKey, questionIndex);
    } else if (
      !componentKey &&
      this.config.logger?.onFallback &&
      this.config.fallbackComponent
    ) {
      this.config.logger.onFallback(
        type,
        this.config.fallbackComponent,
        "Type not found in registry"
      );
    }

    // Use fallback component if no component found
    const finalComponentKey = componentKey || this.config.fallbackComponent;

    if (!finalComponentKey) {
      throw new Error(
        `No component found for type "${type}" and no fallback component provided`
      );
    }

    // Determine if this component expects options
    const expectsOptions = this.shouldHaveOptions(type);

    // For components that expect options but don't have them, provide defaults
    let finalOptions = normalizedOptions;
    if (expectsOptions && !normalizedOptions && this.config.getDefaultOptions) {
      finalOptions = this.config.getDefaultOptions(type);
    }

    // Build component props
    const componentProps: QuestionProps = {
      question: question.question,
      value,
      onChange,
      questionIndex,
      ...(finalOptions && {options: finalOptions})
    };

    return {
      type: normalizedType,
      componentKey: finalComponentKey,
      props: componentProps
    };
  }

  /**
   * Determine if a question type should have options
   */
  private shouldHaveOptions(type: string): boolean {
    if (this.config.shouldHaveOptions) {
      return this.config.shouldHaveOptions(type);
    }

    // Default implementation: types that typically need options
    const optionBasedTypes = [
      "radio",
      "multiselect",
      "slider",
      "select",
      "dropdown"
    ];
    return optionBasedTypes.includes(type.toLowerCase());
  }
}
