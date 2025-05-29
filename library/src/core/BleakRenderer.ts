import {ComponentType} from "react";
import {
  BleakQuestion,
  BleakRendererConfig,
  QuestionComponentProps,
  ComponentRegistry
} from "../types";

/**
 * Core renderer class that handles the logic for dynamic question rendering
 */
export class BleakRenderer {
  private config: BleakRendererConfig;

  constructor(config: BleakRendererConfig) {
    this.config = config;
    this.logRegistration();
  }

  /**
   * Update the renderer configuration
   */
  updateConfig(newConfig: Partial<BleakRendererConfig>): void {
    this.config = {...this.config, ...newConfig};
    this.logRegistration();
  }

  /**
   * Register a new component type
   */
  registerComponent(
    type: string,
    component: ComponentType<QuestionComponentProps>
  ): void {
    this.config.components[type.toLowerCase()] = component;

    if (this.config.logger?.onRegistration) {
      this.config.logger.onRegistration(type, component.name || "Anonymous");
    }
  }

  /**
   * Check if a type is supported
   */
  isSupportedType(type: string): boolean {
    return type.toLowerCase() in this.config.components;
  }

  /**
   * Get all supported types
   */
  getSupportedTypes(): string[] {
    return Object.keys(this.config.components);
  }

  /**
   * Get the component for a given question type
   */
  getComponent(
    question: BleakQuestion,
    value: string,
    onChange: (value: string) => void,
    questionIndex?: number
  ): {
    Component: ComponentType<QuestionComponentProps>;
    props: QuestionComponentProps;
  } {
    const {type, options} = question;
    const normalizedType = type.toLowerCase();

    // Get the component for this type
    const Component = this.config.components[normalizedType];
    const componentName = Component?.name || "Unknown";

    // Handle logging
    if (Component && this.config.logger?.onComponentRender) {
      this.config.logger.onComponentRender(type, componentName, questionIndex);
    } else if (
      !Component &&
      this.config.logger?.onFallback &&
      this.config.fallbackComponent
    ) {
      this.config.logger.onFallback(
        type,
        this.config.fallbackComponent.name || "Fallback",
        "Type not found in registry"
      );
    }

    // Use fallback component if no component found
    const FinalComponent = Component || this.config.fallbackComponent;

    if (!FinalComponent) {
      throw new Error(
        `No component found for type "${type}" and no fallback component provided`
      );
    }

    // Determine if this component expects options
    const expectsOptions = this.shouldHaveOptions(type);

    // For components that expect options but don't have them, provide defaults
    let finalOptions = options;
    if (expectsOptions && !options && this.config.getDefaultOptions) {
      finalOptions = this.config.getDefaultOptions(type);
    }

    // Build component props
    const componentProps: QuestionComponentProps = {
      question: question.question,
      value,
      onChange,
      questionIndex,
      ...(finalOptions && {options: finalOptions})
    };

    return {
      Component: FinalComponent,
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

  /**
   * Log component registry (for debugging)
   */
  private logRegistration(): void {
    if (this.config.logger?.onRegistration) {
      const entries = Object.keys(this.config.components).map((key) => [
        key,
        this.config.components[key]
      ]);
      for (const [type, component] of entries) {
        this.config.logger.onRegistration(
          type as string,
          (component as ComponentType<QuestionComponentProps>).name ||
            "Anonymous"
        );
      }
    }
  }
}
