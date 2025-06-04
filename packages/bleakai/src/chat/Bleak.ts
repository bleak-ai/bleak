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
import type {
  BleakElementConfig,
  BleakElement as CoreBleakElement
} from "../types/core";
import {createResolverFromConfig} from "../core/BleakResolver";

// Client configuration interface
export interface ChatClientConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
}

export interface BleakConfig extends ChatClientConfig {
  elements?: BleakElementConfig;
}

export interface BleakAskOptions {
  onQuestions?: (
    questions: InteractiveQuestion[]
  ) => Promise<AnsweredQuestion[] | Record<string, string>>;
  onStream?: (chunk: string) => void;
  onComplete?: (answer: string) => void;
  onError?: (error: Error) => void;
}

// Error classes
export class ChatError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = "ChatError";
  }
}

export class RateLimitError extends ChatError {
  constructor(message: string, public retryAfter?: number) {
    super(message, 429);
    this.name = "RateLimitError";
  }
}

export class AuthenticationError extends ChatError {
  constructor(message: string) {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

export class Bleak {
  private client: AxiosInstance;
  private elementConfig?: BleakElementConfig;
  private resolver?: ReturnType<typeof createResolverFromConfig>;
  private context: ConversationContext = {
    threadId: undefined,
    state: "starting",
    questionsAsked: 0,
    questionsAnswered: 0,
    currentQuestions: undefined,
    allAnswers: []
  };
  private config: Required<ChatClientConfig>;

  constructor(config: BleakConfig) {
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
   * Ask a question and handle the complete conversation flow
   */
  async ask(prompt: string, options: BleakAskOptions = {}): Promise<string> {
    try {
      // Reset context for new conversation
      this.resetContext();
      this.context.state = "starting";

      // Start conversation
      const bleakElements: ChatBleakElement[] | undefined = this.elementConfig
        ? Object.entries(this.elementConfig).map(([name, config]) => ({
            name,
            description: config.description
          }))
        : undefined;

      let response = await this.makeInitialRequest(prompt, {bleakElements});

      // Handle conversation flow
      while (!response.is_complete) {
        if (
          response.type === "questions" &&
          response.questions &&
          options.onQuestions
        ) {
          // Get answers from user
          const answers = await options.onQuestions(response.questions);

          // Convert to standard format if needed
          const standardAnswers = this.normalizeAnswers(
            answers,
            response.questions
          );

          // Continue conversation
          response = await this.makeContinuationRequest(standardAnswers);
        } else {
          // Try to finish if no questions handler
          response = await this.makeCompletionRequest([]);
        }
      }

      const finalAnswer = response.content;

      if (options.onComplete) {
        options.onComplete(finalAnswer);
      }

      return finalAnswer;
    } catch (error) {
      if (options.onError) {
        options.onError(error as Error);
      }
      throw error;
    }
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
      throw new Error("No elements configured. Pass elements in constructor.");
    }

    return questions.map((question, index) => {
      const element: CoreBleakElement = {
        type: question.type,
        text: question.question,
        options: question.options
      };

      const resolution = this.resolver!.resolve(element, "", () => {}, index);

      return {
        question,
        Component: resolution.Component,
        props: resolution.props
      };
    });
  }

  /**
   * Continue conversation with specific answers
   */
  async continue(
    answers: AnsweredQuestion[] | Record<string, string>
  ): Promise<ChatResponse> {
    const standardAnswers = this.normalizeAnswers(answers, []);
    return await this.makeContinuationRequest(standardAnswers);
  }

  /**
   * Finish conversation and get final answer
   */
  async finish(finalAnswers: AnsweredQuestion[] = []): Promise<string> {
    const response = await this.makeCompletionRequest(finalAnswers);
    return response.content;
  }

  /**
   * Get current conversation context
   */
  getContext() {
    return {...this.context};
  }

  /**
   * Reset conversation
   */
  reset(): void {
    this.resetContext();
  }

  // Private methods

  private resetContext(): void {
    this.context = {
      threadId: undefined,
      state: "starting",
      questionsAsked: 0,
      questionsAnswered: 0,
      currentQuestions: undefined,
      allAnswers: []
    };
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

    const response = await this.client.post("/bleak/chat", request);
    const chatResponse: ChatResponse = response.data;
    this.updateContextFromResponse(chatResponse);
    return chatResponse;
  }

  private async makeContinuationRequest(
    answers: AnsweredQuestion[]
  ): Promise<ChatResponse> {
    if (!this.context.threadId) {
      throw new ChatError("No active conversation. Call ask() first.");
    }

    this.context.state = "answering";
    this.context.allAnswers.push(...answers);
    this.context.questionsAnswered += answers.length;

    const request: ContinuationChatRequest = {
      type: "continue",
      thread_id: this.context.threadId,
      answers: this.context.allAnswers
    };

    const response = await this.client.post("/bleak/chat", request);
    const chatResponse: ChatResponse = response.data;
    this.updateContextFromResponse(chatResponse);
    return chatResponse;
  }

  private async makeCompletionRequest(
    finalAnswers: AnsweredQuestion[] = []
  ): Promise<ChatResponse> {
    if (!this.context.threadId) {
      throw new ChatError("No active conversation. Call ask() first.");
    }

    this.context.state = "completing";

    if (finalAnswers.length > 0) {
      this.context.allAnswers.push(...finalAnswers);
      this.context.questionsAnswered += finalAnswers.length;
    }

    const request: CompletionChatRequest = {
      type: "complete",
      thread_id: this.context.threadId,
      answers: this.context.allAnswers
    };

    const response = await this.client.post("/bleak/chat", request);
    const chatResponse: ChatResponse = response.data;
    this.updateContextFromResponse(chatResponse);
    return chatResponse;
  }

  private updateContextFromResponse(response: ChatResponse): void {
    // Update thread ID
    this.context.threadId = response.thread_id;

    // Update state based on response
    if (response.is_complete) {
      this.context.state = "complete";
    } else if (response.type === "questions" && response.questions) {
      this.context.state = "asking";
      this.context.currentQuestions = response.questions;
      this.context.questionsAsked += response.questions.length;
    }
  }

  private normalizeAnswers(
    answers: AnsweredQuestion[] | Record<string, string>,
    questions: InteractiveQuestion[]
  ): AnsweredQuestion[] {
    if (Array.isArray(answers)) {
      return answers;
    }

    // Convert object to AnsweredQuestion array
    return Object.entries(answers).map(([questionText, answer]) => ({
      question: questionText,
      answer
    }));
  }
}
