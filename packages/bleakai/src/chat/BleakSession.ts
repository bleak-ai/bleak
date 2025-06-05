import axios, {AxiosInstance, AxiosError} from "axios";
import type {
  AnsweredQuestion,
  InteractiveQuestion,
  ChatResponse,
  BleakElement as ChatBleakElement,
  InitialChatRequest,
  ContinuationChatRequest,
  CompletionChatRequest,
  ConversationContext
} from "./types";
import type {BleakElementConfig} from "../types/core";
import {createResolverFromConfig} from "../core/BleakResolver";
import {ChatError, RateLimitError, AuthenticationError} from "./Bleak";

export interface BleakSessionConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  elements?: BleakElementConfig;
}

export interface SessionState {
  threadId?: string;
  questions?: InteractiveQuestion[];
  answers: Record<string, string>;
  isLoading: boolean;
  error?: Error;
  isComplete: boolean;
  result?: string;
}

/**
 * BleakSession provides a clean async/await API for managing AI conversations
 * with automatic state management and destructuring capabilities
 */
export class BleakSession {
  private client: AxiosInstance;
  private elementConfig?: BleakElementConfig;
  private resolver?: ReturnType<typeof createResolverFromConfig>;
  private state: SessionState = {
    answers: {},
    isLoading: false,
    isComplete: false
  };
  private config: Required<Omit<BleakSessionConfig, "elements">>;

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
  }

  /**
   * Create a new conversation session
   */
  async createSession(prompt: string): Promise<{
    hasQuestions: boolean;
    getQuestions: () => Promise<InteractiveQuestion[]>;
    submitAnswers: (answers: Record<string, string>) => Promise<string>;
    getResult: () => Promise<string>;
    getState: () => SessionState;
  }> {
    this.state.isLoading = true;
    this.state.error = undefined;

    try {
      // Start conversation
      const bleakElements: ChatBleakElement[] | undefined = this.elementConfig
        ? Object.entries(this.elementConfig).map(([name, config]) => ({
            name,
            description: config.description
          }))
        : undefined;

      const response = await this.makeInitialRequest(prompt, {bleakElements});
      this.updateStateFromResponse(response);

      const hasQuestions = Boolean(
        !response.is_complete &&
          response.type === "questions" &&
          response.questions &&
          response.questions.length > 0
      );

      return {
        hasQuestions,
        getQuestions: async () => {
          if (!this.state.questions) {
            throw new Error("No questions available");
          }
          return this.state.questions;
        },
        submitAnswers: async (answers: Record<string, string>) => {
          this.state.answers = {...this.state.answers, ...answers};
          this.state.isLoading = true;

          try {
            const standardAnswers = this.convertAnswers(answers);
            const response = await this.makeContinuationRequest(
              standardAnswers
            );
            this.updateStateFromResponse(response);

            if (response.is_complete) {
              this.state.result = response.content;
              return response.content;
            } else {
              // If more questions, throw error for now
              throw new Error("Additional questions required");
            }
          } finally {
            this.state.isLoading = false;
          }
        },
        getResult: async () => {
          if (this.state.result) {
            return this.state.result;
          }

          const response = await this.makeCompletionRequest([]);
          this.updateStateFromResponse(response);
          this.state.result = response.content;
          return response.content;
        },
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
   * Simple one-shot question for quick interactions
   */
  async quickAsk(prompt: string): Promise<string> {
    const session = await this.createSession(prompt);

    if (session.hasQuestions) {
      // For quickAsk, we'll try to complete without questions
      return session.getResult();
    } else {
      return session.getResult();
    }
  }

  /**
   * Get current session state
   */
  getState(): SessionState {
    return {...this.state};
  }

  /**
   * Reset session state
   */
  reset(): void {
    this.state = {
      answers: {},
      isLoading: false,
      isComplete: false
    };
  }

  /**
   * Render questions using configured components
   */
  renderQuestions(questions: InteractiveQuestion[]): Array<{
    question: InteractiveQuestion;
    Component: any;
    props: any;
  }> {
    if (!this.resolver) {
      throw new Error(
        "No element configuration provided. Either configure elements in constructor or use the renderQuestions method only after setting up elements."
      );
    }

    return questions.map((question, index) => {
      const resolution = this.resolver!.resolve(
        {
          type: question.type,
          text: question.question,
          options: question.options || null
        },
        "", // Default empty value - will be managed by the component
        () => {}, // No-op onChange - will be overridden by the component
        index
      );
      const Component = this.elementConfig![resolution.componentKey].component;
      return {
        question,
        Component,
        props: resolution.props
      };
    });
  }

  private async makeInitialRequest(
    prompt: string,
    options: {bleakElements?: ChatBleakElement[]} = {}
  ): Promise<ChatResponse> {
    const request: InitialChatRequest = {
      type: "start",
      prompt,
      bleak_elements: options.bleakElements
    };

    const response = await this.client.post<ChatResponse>("/chat", request, {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`
      }
    });

    return response.data;
  }

  private async makeContinuationRequest(
    answers: AnsweredQuestion[]
  ): Promise<ChatResponse> {
    if (!this.state.threadId) {
      throw new Error("No active conversation thread");
    }

    const request: ContinuationChatRequest = {
      type: "continue",
      thread_id: this.state.threadId,
      answers,
      want_more_questions: false
    };

    const response = await this.client.post<ChatResponse>("/chat", request, {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`
      }
    });

    return response.data;
  }

  private async makeCompletionRequest(
    finalAnswers: AnsweredQuestion[] = []
  ): Promise<ChatResponse> {
    if (!this.state.threadId) {
      throw new Error("No active conversation thread");
    }

    const request: CompletionChatRequest = {
      type: "complete",
      thread_id: this.state.threadId,
      answers: finalAnswers
    };

    const response = await this.client.post<ChatResponse>("/chat", request, {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`
      }
    });

    return response.data;
  }

  private updateStateFromResponse(response: ChatResponse): void {
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

  private convertAnswers(answers: Record<string, string>): AnsweredQuestion[] {
    return Object.entries(answers).map(([question, answer]) => ({
      question,
      answer
    }));
  }
}
