import {QuestionResolver} from "./QuestionResolver";
import {ResolverConfig, Question, ComponentResolution} from "./types";

/**
 * Quick setup function for common use cases
 */
export function createResolver(
  componentMap: Record<string, string>,
  options?: {
    enableLogging?: boolean;
    fallbackComponent?: string;
    customShouldHaveOptions?: (type: string) => boolean;
    customDefaultOptions?: (type: string) => string[];
  }
): QuestionResolver {
  const config: ResolverConfig = {
    components: componentMap,
    fallbackComponent: options?.fallbackComponent,
    shouldHaveOptions: options?.customShouldHaveOptions,
    getDefaultOptions: options?.customDefaultOptions
  };

  // Add logging if enabled
  if (options?.enableLogging) {
    config.logger = {
      onResolve: (type, componentKey, questionIndex) => {
        console.log(
          `🎨 Resolved ${type} to ${componentKey} at index ${questionIndex}`
        );
      },
      onFallback: (type, fallbackKey, reason) => {
        console.warn(
          `⚠️ Fallback used for ${type}: ${reason}, using ${fallbackKey}`
        );
      }
    };
  }

  return new QuestionResolver(config);
}

/**
 * Simple function to resolve a single question
 * For one-off usage without creating a resolver instance
 */
export function resolveQuestion(
  question: Question,
  value: string,
  onChange: (value: string) => void,
  componentMap: Record<string, string>,
  questionIndex?: number
): ComponentResolution {
  const resolver = createResolver(componentMap);
  return resolver.resolve(question, value, onChange, questionIndex);
}

/**
 * Batch resolve multiple questions
 */
export function resolveQuestions(
  questions: Question[],
  values: Record<string, string>,
  onChange: (questionText: string, value: string) => void,
  componentMap: Record<string, string>
): ComponentResolution[] {
  const resolver = createResolver(componentMap);

  return questions.map((question, index) =>
    resolver.resolve(
      question,
      values[question.question] || "",
      (value) => onChange(question.question, value),
      index
    )
  );
}

/**
 * Create a component map for common question types
 */
export function createStandardComponentMap(
  customComponents?: Record<string, string>
): Record<string, string> {
  const standard = {
    text: "TextInput",
    textarea: "TextArea",
    radio: "RadioGroup",
    checkbox: "CheckboxGroup",
    select: "Select",
    number: "NumberInput",
    email: "EmailInput",
    password: "PasswordInput",
    date: "DateInput",
    slider: "Slider",
    ...customComponents
  };

  return standard;
}
