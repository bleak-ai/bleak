/**
 * Core types for the framework-agnostic bleak element resolver
 */

export interface BleakElement {
  type: string;
  text: string;
  options?: string[] | null;
}

/**
 * Base props that all Bleak components should accept
 * This provides type safety for the fundamental properties
 */
export interface BleakComponentProps {
  /** The question text to display to the user */
  text: string;
  /** Current value of the input */
  value: string;
  /** Callback function when the value changes */
  onChange: (value: string) => void;
  /** Optional unique identifier for the component instance */
  uniqueId?: string;
  /** Optional index of this element in a list */
  elementIndex?: number;
}

/**
 * Props for Bleak components that don't require options (like text inputs)
 */
export interface BleakInputProps extends BleakComponentProps {
  // No additional props needed for basic input components
}

/**
 * Props for Bleak components that work with predefined options (like radio groups, multi-select)
 */
export interface BleakChoiceProps extends BleakComponentProps {
  /** Array of available options for the user to choose from */
  options: string[];
}

// Keep BleakElementProps for backward compatibility but mark as deprecated
/**
 * @deprecated Use BleakComponentProps, BleakInputProps, or BleakChoiceProps instead. UI components should be framework-agnostic.
 */
export interface BleakElementProps {
  text: string;
  value: string;
  onChange: (value: string) => void;
  elementIndex?: number;
  options?: string[];
}

export interface ComponentResolution {
  type: string;
  componentKey: string;
  props: Record<string, any>;
}

export interface ComponentRegistry {
  [elementType: string]: string;
}

export interface ResolverOptions {
  fallbackComponent?: string;
  shouldHaveOptions?: (type: string) => boolean;
  getDefaultOptions?: (type: string) => string[];
  logger?: {
    onResolve?: (type: string, componentKey: string) => void;
    onFallback?: (type: string, fallback: string, reason: string) => void;
  };
}

/**
 * Type for a single bleak element type configuration
 * This enforces the structure that users must follow
 */
export interface BleakElementTypeConfig<TComponent = any> {
  component: TComponent;
  description: string;
}

/**
 * Type for the complete bleak element configuration object
 * This is what users must implement - single source of truth
 */
export interface BleakElementConfig<TComponent = any> {
  [elementType: string]: BleakElementTypeConfig<TComponent>;
}

/**
 * Utility type to extract the element types from a config
 */
export type BleakElementType<T extends BleakElementConfig> = keyof T;

/**
 * Utility type to extract the component type from a config
 */
export type ComponentType<T extends BleakElementConfig> =
  T[keyof T]["component"];
