import axios, {AxiosInstance, AxiosError} from "axios";
import type {
  AnsweredQuestion,
  InteractiveQuestion,
  ChatResponse,
  BleakElement,
  InitialChatRequest,
  ContinuationChatRequest,
  TaskSpecification
} from "./types";
import type {BleakElementConfig} from "../types/core";
import {createResolverFromConfig} from "../core/BleakResolver";
import {ChatError, RateLimitError, AuthenticationError} from "./Bleak";
import type {IBleakSession, SessionState} from "./IBleakSession";

export interface BleakSessionConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  elements?: BleakElementConfig;
  task_specification?: TaskSpecification;
}

/**
 * BleakSession - The unified, all-in-one session for BleakAI
 *
 * This class combines all functionality:
 * - Core API communication (from BleakCoreSession)
 * - UI component resolution (from BleakUISession)
 * - Task specification handling
 * - Element configuration
 *
 * Use this as your single session class for all BleakAI interactions.
 */
export class BleakSession implements IBleakSession {
  protected client: AxiosInstance;
  protected state: SessionState = {
    answers: {},
    isLoading: false,
    isComplete: false
  };
  protected config: Required<
    Omit<BleakSessionConfig, "elements" | "task_specification">
  >;

  // UI and configuration
  private elementConfig?: BleakElementConfig;
  private taskSpecification?: TaskSpecification;
  private resolver?: ReturnType<typeof createResolverFromConfig>;

  constructor(config: BleakSessionConfig) {
    // Set default configuration
    this.config = {
      baseUrl:
        config.baseUrl ||
        process.env.VITE_API_BASE_URL ||
        "https://api.bleak.ai",
      apiKey: config.apiKey || "",
      timeout: config.timeout || 30000,
      retries: config.retries || 3
    };

    // Initialize axios client
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json"
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers["retry-after"];
          const errorData = error.response.data as any;
          throw new RateLimitError(
            errorData?.detail || "Rate limit exceeded",
            retryAfter ? parseInt(retryAfter) : undefined
          );
        } else if (error.response?.status === 401) {
          const errorData = error.response.data as any;
          throw new AuthenticationError(
            errorData?.detail || "Authentication failed"
          );
        } else {
          const errorData = error.response?.data as any;
          throw new ChatError(
            errorData?.detail || error.message,
            error.response?.status,
            error.response?.data
          );
        }
      }
    );

    // Set up elements if provided
    if (config.elements) {
      this.elementConfig = config.elements;
      this.resolver = createResolverFromConfig(config.elements);
    }

    // Set up task specification if provided
    if (config.task_specification) {
      this.taskSpecification = config.task_specification;
    }
  }

  /**
   * Start a new Bleak conversation
   * Returns questions immediately if the AI needs input, or a direct answer
   */
  async startBleakConversation(prompt: string): Promise<{
    questions?: InteractiveQuestion[];
    answer?: string;
    getState: () => SessionState;
  }> {
    this.state.isLoading = true;
    this.state.error = undefined;

    try {
      const bleakElements = this.getBleakElements();
      const taskSpecification = this.getTaskSpecification();
      const response = await this.makeInitialRequest(prompt, {
        bleakElements,
        taskSpecification
      });
      this.updateStateFromResponse(response);

      const hasQuestions = Boolean(
        response.questions && response.questions.length > 0
      );

      return {
        questions: hasQuestions ? this.state.questions : undefined,
        answer: !hasQuestions ? response.content : undefined,
        getState: () => ({...this.state})
      };
    } catch (error) {
      this.state.error = error as Error;
      this.state.isLoading = false;
      throw error;
    } finally {
      this.state.isLoading = false;
    }
  }

  /**
   * Finish a Bleak conversation by submitting user answers
   */
  async finishBleakConversation(
    answers: Record<string, string>
  ): Promise<string> {
    if (!this.state.threadId) {
      throw new Error(
        "No active conversation thread. You must call startBleakConversation() first."
      );
    }

    this.state.answers = {...this.state.answers, ...answers};
    this.state.isLoading = true;

    try {
      const standardAnswers = this.convertAnswers(answers);
      const response = await this.makeContinuationRequest(
        standardAnswers,
        false
      );
      this.updateStateFromResponse(response);

      if (response.is_complete) {
        this.state.result = response.content;
        return response.content;
      } else {
        throw new Error(
          "Conversation not completed - more input may be required"
        );
      }
    } catch (error) {
      this.state.error = error as Error;
      throw error;
    } finally {
      this.state.isLoading = false;
    }
  }

  /**
   * Request more questions after answering the current ones
   * This allows for iterative refinement of the conversation
   */
  async requestMoreBleakQuestions(answers: Record<string, string>): Promise<{
    questions?: InteractiveQuestion[];
    isComplete: boolean;
    getState: () => SessionState;
  }> {
    if (!this.state.threadId) {
      throw new Error(
        "No active conversation thread. You must call startBleakConversation() first."
      );
    }

    this.state.answers = {...this.state.answers, ...answers};
    this.state.isLoading = true;

    try {
      const standardAnswers = this.convertAnswers(answers);
      const response = await this.makeContinuationRequest(
        standardAnswers,
        true
      );
      this.updateStateFromResponse(response);

      return {
        questions:
          response.type === "questions" ? response.questions : undefined,
        isComplete: response.is_complete,
        getState: () => ({...this.state})
      };
    } catch (error) {
      this.state.error = error as Error;
      throw error;
    } finally {
      this.state.isLoading = false;
    }
  }

  /**
   * Get a quick answer without form interaction
   */
  async quickBleakAsk(prompt: string): Promise<string> {
    const result = await this.startBleakConversation(prompt);

    if (result.questions && result.questions.length > 0) {
      // For quick ask, we'll try to complete without questions
      return this.finishBleakConversation({});
    } else {
      return result.answer!;
    }
  }

  /**
   * Get the current Bleak session state
   */
  getBleakState(): SessionState {
    return {...this.state};
  }

  /**
   * Reset the Bleak session
   */
  resetBleakSession(): void {
    this.state = {
      answers: {},
      isLoading: false,
      isComplete: false
    };
  }

  /**
   * Resolve questions to components with static configuration
   * Returns components and their static props, leaving state management to the consumer
   */
  resolveComponents(questions: InteractiveQuestion[]): Array<{
    Component: any;
    staticProps: {
      text: string;
      options?: string[] | null;
      uniqueId: string;
      elementIndex: number;
    };
    question: InteractiveQuestion;
  }> {
    if (!this.resolver) {
      throw new Error(
        "No components configured. Please provide an 'elements' configuration in the BleakSession constructor."
      );
    }

    return questions.map((question, index) => {
      const resolution = this.resolver!.resolve(
        {
          type: question.type,
          text: question.question,
          options: question.options || null
        },
        "", // Empty value - state management is handled by consumer
        () => {}, // Empty onChange - state management is handled by consumer
        index
      );

      const Component = this.elementConfig![resolution.componentKey].component;

      // Extract only static props (no value or onChange)
      const staticProps = {
        text: resolution.props.text,
        options: resolution.props.options,
        uniqueId: resolution.props.uniqueId,
        elementIndex: resolution.props.elementIndex
      };

      return {
        Component,
        staticProps,
        question
      };
    });
  }

  /**
   * Get Bleak components with full props (backward compatibility method)
   * Returns components ready to render with value and onChange handlers
   */
  getBleakComponents(
    questions: InteractiveQuestion[],
    answers: Record<string, string>,
    onAnswerChange: (question: string, value: string) => void
  ): Array<{
    Component: any;
    props: any;
    key: string;
  }> {
    if (!this.resolver) {
      throw new Error(
        "No components configured. Please provide an 'elements' configuration in the BleakSession constructor."
      );
    }

    return questions.map((question, index) => {
      const resolution = this.resolver!.resolve(
        {
          type: question.type,
          text: question.question,
          options: question.options || null
        },
        answers[question.question] || "", // Current value from answers
        (value: string) => onAnswerChange(question.question, value), // onChange handler
        index
      );

      const Component = this.elementConfig![resolution.componentKey].component;

      return {
        Component,
        props: resolution.props,
        key: resolution.props.uniqueId
      };
    });
  }

  /**
   * Get bleak elements configuration for API
   */
  protected getBleakElements(): BleakElement[] | undefined {
    return this.elementConfig
      ? Object.entries(this.elementConfig).map(([name, config]) => ({
          name,
          description: config.description
        }))
      : undefined;
  }

  /**
   * Get task specification for API
   */
  protected getTaskSpecification(): TaskSpecification | undefined {
    return this.taskSpecification;
  }

  protected async makeInitialRequest(
    prompt: string,
    options: {
      bleakElements?: BleakElement[];
      taskSpecification?: TaskSpecification;
    } = {}
  ): Promise<ChatResponse> {
    const request: InitialChatRequest = {
      type: "start",
      prompt,
      bleak_elements: options.bleakElements,
      task_specification: options.taskSpecification
    };

    const response = await this.client.post<ChatResponse>("/chat", request, {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`
      }
    });

    return response.data;
  }

  protected async makeContinuationRequest(
    answers: AnsweredQuestion[],
    wantMoreQuestions: boolean = false
  ): Promise<ChatResponse> {
    if (!this.state.threadId) {
      throw new Error("No active conversation thread");
    }

    const request: ContinuationChatRequest = {
      type: "continue",
      thread_id: this.state.threadId,
      answers,
      want_more_questions: wantMoreQuestions
    };

    const response = await this.client.post<ChatResponse>("/chat", request, {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`
      }
    });

    return response.data;
  }

  protected updateStateFromResponse(response: ChatResponse): void {
    this.state.threadId = response.thread_id;
    this.state.isComplete = response.is_complete;

    if (response.type === "questions" && response.questions) {
      this.state.questions = response.questions;
    } else {
      this.state.questions = undefined;
    }

    if (response.is_complete) {
      this.state.result = response.content;
    }
  }

  protected convertAnswers(
    answers: Record<string, string>
  ): AnsweredQuestion[] {
    return Object.entries(answers).map(([question, answer]) => ({
      question,
      answer
    }));
  }
}

// Re-export types for convenience
export type {SessionState} from "./IBleakSession";
export type {
  TaskSpecification,
  InteractiveQuestion,
  BleakElement
} from "./types";
export type {BleakElementConfig} from "../types/core";
