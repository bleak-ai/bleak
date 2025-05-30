// Core framework-agnostic types for dynamic question resolution

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

// Component resolver result - framework agnostic
export interface ComponentResolution {
  type: string;
  props: QuestionProps;
  componentKey: string;
}

// Component registry - users define their own components
export interface ComponentRegistry {
  [type: string]: string; // Maps question type to component identifier/key
}

// Resolver configuration
export interface ResolverConfig {
  // Component type mappings
  components: ComponentRegistry;

  // Optional: Function to determine if a question type should have options
  shouldHaveOptions?: (type: string) => boolean;

  // Optional: Default options for types that require them but don't have any
  getDefaultOptions?: (type: string) => string[];

  // Optional: Fallback component key for unsupported types
  fallbackComponent?: string;

  // Optional: Logging
  logger?: {
    onResolve?: (
      type: string,
      componentKey: string,
      questionIndex?: number
    ) => void;
    onFallback?: (type: string, fallbackKey: string, reason: string) => void;
  };
}
