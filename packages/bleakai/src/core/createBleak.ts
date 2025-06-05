/**
 * Main BleakAI API - Simple and intuitive
 *
 * This is the primary way to use BleakAI in your application.
 * Just map your components to element types and start generating forms.
 */

import type {
  ComponentMapping,
  FormQuestion,
  ResolvedComponent,
  ComponentProps
} from "../types/components";

export interface BleakConfig {
  /** Your API key for BleakAI */
  apiKey?: string;
  /** Base URL for the BleakAI API */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Your component mapping */
  components: ComponentMapping;
}

export interface BleakConversation {
  /** Ask a question and get either a direct answer or form questions */
  ask(prompt: string): Promise<BleakResponse>;
  /** Submit answers to form questions */
  submit(answers: Record<string, string>): Promise<string>;
  /** Get the current conversation state */
  getState(): ConversationState;
  /** Reset the conversation */
  reset(): void;
}

export interface BleakResponse {
  /** Whether this response contains form questions */
  hasQuestions: boolean;
  /** The form questions (if any) */
  questions?: ResolvedComponent[];
  /** Direct answer (if no questions) */
  answer?: string;
}

export interface ConversationState {
  /** Whether a conversation is in progress */
  isActive: boolean;
  /** Whether we're waiting for user input */
  awaitingInput: boolean;
  /** Current form questions */
  questions?: FormQuestion[];
  /** User's answers so far */
  answers: Record<string, string>;
  /** Any error that occurred */
  error?: string;
}

/**
 * Create a BleakAI instance with your component configuration
 *
 * @example
 * ```typescript
 * // Map your components to BleakAI element types
 * const bleak = createBleak({
 *   apiKey: "your-api-key",
 *   components: {
 *     text: {
 *       component: YourTextInput,
 *       description: "For text input and messages"
 *     },
 *     radio: {
 *       component: YourRadioGroup,
 *       description: "For single choice from options"
 *     }
 *   }
 * });
 *
 * // Start a conversation
 * const conversation = bleak.startConversation();
 * const response = await conversation.ask("Help me plan a trip");
 *
 * if (response.hasQuestions) {
 *   // Render the form questions
 *   response.questions?.forEach(({Component, props}) => {
 *     render(<Component {...props} />);
 *   });
 * }
 * ```
 */
export function createBleak(config: BleakConfig): {
  /** Start a new conversation */
  startConversation(): BleakConversation;
  /** Quick one-shot question (no form interaction) */
  quickAsk(prompt: string): Promise<string>;
  /** Resolve questions to components manually */
  resolveQuestions(
    questions: FormQuestion[],
    answers: Record<string, string>
  ): ResolvedComponent[];
} {
  // Component resolver
  const resolveComponent = (
    question: FormQuestion,
    value: string,
    onChange: (value: string) => void
  ): ResolvedComponent => {
    const componentConfig = config.components[question.type];

    if (!componentConfig) {
      throw new Error(`No component configured for type: ${question.type}`);
    }

    const props: ComponentProps = {
      question: question.question,
      value,
      onChange,
      options: question.options,
      id: `bleak-${question.type}-${Date.now()}`
    };

    return {
      Component: componentConfig.component,
      props,
      question
    };
  };

  return {
    startConversation(): BleakConversation {
      // Implementation will use the existing BleakSession but with cleaner API
      const state: ConversationState = {
        isActive: false,
        awaitingInput: false,
        answers: {}
      };

      return {
        async ask(prompt: string): Promise<BleakResponse> {
          // This will integrate with the existing backend API
          // For now, return a placeholder
          state.isActive = true;

          // TODO: Integrate with existing BleakSession
          throw new Error(
            "Implementation in progress - use legacy BleakSession for now"
          );
        },

        async submit(answers: Record<string, string>): Promise<string> {
          state.answers = {...state.answers, ...answers};

          // TODO: Integrate with existing backend
          throw new Error(
            "Implementation in progress - use legacy BleakSession for now"
          );
        },

        getState(): ConversationState {
          return {...state};
        },

        reset(): void {
          state.isActive = false;
          state.awaitingInput = false;
          state.answers = {};
          state.questions = undefined;
          state.error = undefined;
        }
      };
    },

    async quickAsk(prompt: string): Promise<string> {
      // TODO: Implement quick ask functionality
      throw new Error(
        "Implementation in progress - use legacy BleakSession for now"
      );
    },

    resolveQuestions(
      questions: FormQuestion[],
      answers: Record<string, string>
    ): ResolvedComponent[] {
      return questions.map((question) => {
        const value = answers[question.question] || "";
        const onChange = (newValue: string) => {
          answers[question.question] = newValue;
        };

        return resolveComponent(question, value, onChange);
      });
    }
  };
}
