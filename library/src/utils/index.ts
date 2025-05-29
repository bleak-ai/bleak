import {ComponentType} from "react";
import {
  BleakRendererConfig,
  QuestionComponentProps,
  BleakElementType
} from "../types";

// Re-export from componentAdapter

/**
 * Create a default renderer configuration
 */
export const createDefaultConfig = (
  components: Record<string, ComponentType<QuestionComponentProps>>,
  options?: {
    enableLogging?: boolean;
    fallbackComponent?: ComponentType<QuestionComponentProps>;
    customShouldHaveOptions?: (type: string) => boolean;
    customDefaultOptions?: (type: string) => string[];
  }
): BleakRendererConfig => {
  const config: BleakRendererConfig = {
    components,
    fallbackComponent: options?.fallbackComponent,
    shouldHaveOptions: options?.customShouldHaveOptions,
    getDefaultOptions: options?.customDefaultOptions
  };

  // Add logging if enabled
  if (options?.enableLogging) {
    config.logger = {
      onComponentRender: (type, componentName, questionIndex) => {
        console.log(
          `🎨 Rendered ${type} with ${componentName} at index ${questionIndex}`
        );
      },
      onFallback: (type, fallbackName, reason) => {
        console.warn(
          `⚠️ Fallback used for ${type}: ${reason}, using ${fallbackName}`
        );
      },
      onRegistration: (type, componentName) => {
        console.log(`📝 Registered ${type} → ${componentName}`);
      }
    };
  }

  return config;
};

/**
 * Helper to create question type constants similar to the original
 */
export const createQuestionTypes = <T extends Record<string, string>>(
  types: T
): {readonly [K in keyof T]: T[K]} => {
  return Object.freeze(types);
};

/**
 * Helper to validate if a string is a valid question type
 */
export const createTypeValidator = (availableTypes: string[]) => {
  return (type: string): boolean => {
    return availableTypes.includes(type.toLowerCase());
  };
};

/**
 * Helper to create element definitions for AI guidance (similar to BLEAK_ELEMENTS)
 */
export const createElementDefinitions = (
  elements: Array<{name: string; description: string}>
): BleakElementType[] => {
  return elements.map(({name, description}) => ({
    name,
    description
  }));
};

/**
 * Component registry builder for easier setup
 */
export class ComponentRegistryBuilder {
  private components: Record<string, ComponentType<QuestionComponentProps>> =
    {};

  add(type: string, component: ComponentType<QuestionComponentProps>): this {
    this.components[type.toLowerCase()] = component;
    return this;
  }

  addMany(
    componentMap: Record<string, ComponentType<QuestionComponentProps>>
  ): this {
    Object.entries(componentMap).forEach(([type, component]) => {
      this.add(type, component);
    });
    return this;
  }

  build(): Record<string, ComponentType<QuestionComponentProps>> {
    return {...this.components};
  }
}

/**
 * Easy way to create a component registry
 */
export const createComponentRegistry = () => new ComponentRegistryBuilder();
