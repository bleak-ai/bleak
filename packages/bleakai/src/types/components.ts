/**
 * Clean, intuitive types for BleakAI component integration
 * Focused on simplicity and developer experience
 */

/**
 * A single form question that BleakAI generates
 */
export interface FormQuestion {
  /** The question text to display to the user */
  question: string;
  /** The type of input needed (text, radio, multi_select, etc.) */
  type: BleakElementType;
  /** Available options for choice-based questions */
  options?: string[];
}

/**
 * Built-in element types that BleakAI understands
 * You can extend this by adding your own types
 */
export type BleakElementType =
  | "text" // Free-form text input
  | "radio" // Single choice from options
  | "multi_select" // Multiple choice from options
  | "date" // Date picker
  | "slider" // Numeric slider
  | "checkbox" // Single yes/no checkbox
  | string; // Your custom types

/**
 * Configuration for a single component type
 * This is what you provide for each element type you want to support
 */
export interface ComponentConfig<TComponent = any> {
  /** Your component (React component, Vue component, etc.) */
  component: TComponent;
  /** Description to help AI decide when to use this component */
  description: string;
}

/**
 * The mapping of element types to your components
 * This is the main configuration you provide to BleakAI
 */
export interface ComponentMapping<TComponent = any> {
  [elementType: string]: ComponentConfig<TComponent>;
}

/**
 * Standard props that BleakAI will pass to your components
 * Your components should accept these props
 */
export interface ComponentProps {
  /** The question text */
  question: string;
  /** Current value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Available options (for choice components) */
  options?: string[];
  /** Unique identifier for this question */
  id?: string;
}

/**
 * Result of resolving a question to a component
 */
export interface ResolvedComponent<TComponent = any> {
  /** The component to render */
  Component: TComponent;
  /** Props to pass to the component */
  props: ComponentProps;
  /** Original question data */
  question: FormQuestion;
}
