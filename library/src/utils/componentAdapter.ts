import React from "react";
import type {QuestionComponentProps, BleakRendererConfig} from "../types";

/**
 * Automatically adapts a component to the BleakAI interface
 * This function makes it easier to integrate existing components without manual adapters
 */
export function adaptComponent(Component: any): any {
  return (props: QuestionComponentProps) => {
    const {
      question,
      value,
      onChange,
      questionIndex = 0,
      options = [],
      ...rest
    } = props;

    // Build props that match the original component's interface
    const adaptedProps = {
      question,
      value,
      onChange,
      questionIndex,
      options,
      ...rest
    };

    return React.createElement(Component, adaptedProps);
  };
}

/**
 * Creates a registry with automatic component adaptation
 * This makes it easier to register existing components without creating manual adapters
 */
export function createAdaptedRegistry() {
  const registry: Record<string, any> = {};

  return {
    add(type: string, component: any) {
      registry[type] = adaptComponent(component);
      return this;
    },

    addMany(components: Record<string, any>) {
      Object.entries(components).forEach(([type, component]) => {
        this.add(type, component);
      });
      return this;
    },

    build() {
      return registry;
    }
  };
}

/**
 * Quick setup function for common use cases
 * This provides a one-liner setup for typical integrations
 */
export function quickSetup(
  components: Record<string, any>,
  options?: {
    enableLogging?: boolean;
    fallbackComponent?: any;
  }
): {registry: Record<string, any>; config: BleakRendererConfig} {
  const registry = createAdaptedRegistry().addMany(components).build();

  const config: BleakRendererConfig = {
    components: registry,
    logger: options?.enableLogging
      ? {
          onFallback: (type: string, fallback: string, reason: string) =>
            console.warn(
              `[BleakAI] Using fallback ${fallback} for ${type}: ${reason}`
            ),
          onRegistration: (type: string, name: string) =>
            console.log(`[BleakAI] Registered ${type} -> ${name}`)
        }
      : undefined,
    fallbackComponent: options?.fallbackComponent
      ? adaptComponent(options.fallbackComponent)
      : undefined
  };

  return {
    registry,
    config
  };
}
