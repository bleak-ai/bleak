import {ComponentType} from "react";

// Core question interface that all questions must implement
export interface BleakQuestion {
  type: string;
  question: string;
  options?: string[];
}

// Props that every question component will receive
export interface QuestionComponentProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
  questionIndex?: number;
  options?: string[];
  // Allow additional custom props
  [key: string]: any;
}

// Type for component registry
export type ComponentRegistry = Record<
  string,
  ComponentType<QuestionComponentProps>
>;

// Configuration for the renderer
export interface BleakRendererConfig {
  // Component registry mapping type names to React components
  components: ComponentRegistry;

  // Optional: Function to determine if a question type should have options
  shouldHaveOptions?: (type: string) => boolean;

  // Optional: Default options for types that require them but don't have any
  getDefaultOptions?: (type: string) => string[];

  // Optional: Fallback component for unsupported types
  fallbackComponent?: ComponentType<QuestionComponentProps>;

  // Optional: Logger functions
  logger?: {
    onComponentRender?: (
      type: string,
      componentName: string,
      questionIndex?: number
    ) => void;
    onFallback?: (type: string, fallbackName: string, reason: string) => void;
    onRegistration?: (type: string, componentName: string) => void;
  };
}

// Props for the main renderer component
export interface DynamicQuestionRendererProps {
  question: BleakQuestion;
  value: string;
  onChange: (value: string) => void;
  questionIndex?: number;
  config?: Partial<BleakRendererConfig>;
}

// Utility types
export type QuestionType = string;

// Element type for describing available question types (for AI/backend guidance)
export interface BleakElementType {
  name: string;
  description: string;
}
