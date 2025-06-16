import axios, {AxiosInstance, AxiosError} from "axios";
import {
  AnsweredQuestion,
  Question,
  ChatResponse,
  StartChatRequest,
  ContinueChatRequest,
  BleakElement,
  TaskSpecification,
  hasQuestions,
  isAnswer,
  isComplete,
  ChatClientConfig,
  ChatError,
  RateLimitError,
  AuthenticationError
} from "./types";
import type {IBleakSession, SessionState} from "./IBleakSession";

export interface BleakCoreSessionConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
}

/**
 * BleakCoreSession provides core API communication and state management
 * without UI-specific functionality
 */
export class BleakCoreSession implements IBleakSession {
  protected client: AxiosInstance;
  protected state: SessionState = {
    answers: {},
    isLoading: false,
    isComplete: false
  };
  protected config: Required<BleakCoreSessionConfig>;

  constructor(config: BleakCoreSessionConfig) {
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
  }

  /**
   * Start a new Bleak conversation
   * Returns questions immediately if the AI needs input, or a direct answer
   */
  async startBleakConversation(prompt: string): Promise<{
    questions?: Question[];
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
        answer: !hasQuestions ? response.message : undefined,
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
        this.state.result = response.message;
        return response.message;
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
    questions?: Question[];
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
   * Override this method in subclasses to provide element configuration
   * Returns undefined in base class (no UI components)
   */
  protected getBleakElements(): BleakElement[] | undefined {
    return undefined;
  }

  protected getTaskSpecification(): TaskSpecification | undefined {
    return undefined;
  }

  protected async makeInitialRequest(
    prompt: string,
    options: {
      bleakElements?: BleakElement[];
      taskSpecification?: TaskSpecification;
    } = {}
  ): Promise<ChatResponse> {
    const request: StartChatRequest = {
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

    const request: ContinueChatRequest = {
      type: "continue",
      thread_id: this.state.threadId,
      answers,
      user_choice: wantMoreQuestions ? "more_questions" : "final_answer"
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
      this.state.result = response.message;
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
