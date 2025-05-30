/**
 * Core types for the framework-agnostic question resolver
 */

export interface Question {
  type: string;
  question: string;
  options?: string[] | null;
}

export interface QuestionProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
  questionIndex?: number;
  options?: string[];
}

export interface ComponentResolution {
  type: string;
  componentKey: string;
  props: QuestionProps;
}

export interface ComponentRegistry {
  [questionType: string]: string;
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
 * Type for a single question type configuration
 * This enforces the structure that users must follow
 */
export interface QuestionTypeConfig<TComponent = any> {
  component: TComponent;
  description: string;
}

/**
 * Type for the complete question configuration object
 * This is what users must implement - single source of truth
 */
export interface QuestionConfig<TComponent = any> {
  [questionType: string]: QuestionTypeConfig<TComponent>;
}

/**
 * Utility type to extract the question types from a config
 */
export type QuestionType<T extends QuestionConfig> = keyof T;

/**
 * Utility type to extract the component type from a config
 */
export type ComponentType<T extends QuestionConfig> = T[keyof T]["component"];
