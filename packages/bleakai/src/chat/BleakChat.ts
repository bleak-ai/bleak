/**
 * BleakChat - Simple conversational interface for Bleak AI
 *
 * This class provides an intuitive way to interact with the Bleak conversational API,
 * automatically managing conversation state and providing simple methods for common actions.
 */

import axios, {AxiosInstance, AxiosError} from "axios";
import {
  ChatRequest,
  ChatResponse,
  InitialChatRequest,
  ContinuationChatRequest,
  CompletionChatRequest,
  AnsweredQuestion,
  BleakElement,
  InteractiveQuestion,
  ChatClientConfig,
  ChatError,
  RateLimitError,
  AuthenticationError,
  hasQuestions,
  isAnswer,
  isComplete,
  ConversationContext
} from "./types";

export class BleakChat {
  private client: AxiosInstance;
  private context: ConversationContext;
  private config: Required<ChatClientConfig>;

  constructor(config: ChatClientConfig = {}) {
    // Initialize conversation context first
    this.context = {
      threadId: undefined,
      state: "starting",
      questionsAsked: 0,
      questionsAnswered: 0,
      currentQuestions: undefined,
      allAnswers: []
    };

    // Set default configuration
    this.config = {
      baseUrl:
        config.baseUrl ||
        process.env.VITE_API_BASE_URL ||
        "http://localhost:8000",
      apiKey: config.apiKey || "",
      timeout: config.timeout || 30000,
      retries: config.retries || 3
    };

    // Initialize axios client
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        ...(this.config.apiKey && {"X-OpenAI-API-Key": this.config.apiKey})
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

    // Final initialization
    this.resetContext();
  }

  /**
   * Start a new conversation with the given prompt
   */
  async ask(
    prompt: string,
    options: {
      bleakElements?: BleakElement[];
    } = {}
  ): Promise<ChatResponse> {
    // Reset context for new conversation
    this.resetContext();
    this.context.state = "starting";

    const request: InitialChatRequest = {
      type: "start",
      prompt,
      bleak_elements: options.bleakElements
    };

    try {
      const response = await this.makeRequest(request);
      this.updateContextFromResponse(response);
      return response;
    } catch (error) {
      this.context.state = "complete";
      throw error;
    }
  }

  /**
   * Continue the conversation by providing answers to questions
   */
  async answer(
    answers: AnsweredQuestion[],
    wantMoreQuestions?: boolean
  ): Promise<ChatResponse> {
    if (!this.context.threadId) {
      throw new ChatError("No active conversation. Call ask() first.");
    }

    this.context.state = "answering";

    // Add new answers to context
    this.context.allAnswers.push(...answers);
    this.context.questionsAnswered += answers.length;

    const request: ContinuationChatRequest = {
      type: "continue",
      thread_id: this.context.threadId,
      answers: this.context.allAnswers,
      want_more_questions: wantMoreQuestions
    };

    try {
      const response = await this.makeRequest(request);
      this.updateContextFromResponse(response);
      return response;
    } catch (error) {
      this.context.state = "complete";
      throw error;
    }
  }

  /**
   * Request more questions from the AI
   */
  async more(): Promise<ChatResponse> {
    return this.answer([], true);
  }

  /**
   * Complete the conversation and get the final answer
   */
  async finish(finalAnswers: AnsweredQuestion[] = []): Promise<ChatResponse> {
    if (!this.context.threadId) {
      throw new ChatError("No active conversation. Call ask() first.");
    }

    this.context.state = "completing";

    // Add any final answers
    if (finalAnswers.length > 0) {
      this.context.allAnswers.push(...finalAnswers);
      this.context.questionsAnswered += finalAnswers.length;
    }

    const request: CompletionChatRequest = {
      type: "complete",
      thread_id: this.context.threadId,
      answers: this.context.allAnswers
    };

    try {
      const response = await this.makeRequest(request);
      this.updateContextFromResponse(response);
      return response;
    } catch (error) {
      this.context.state = "complete";
      throw error;
    }
  }

  /**
   * Get the current conversation context
   */
  getContext(): Readonly<ConversationContext> {
    return {...this.context};
  }

  /**
   * Check if there's an active conversation
   */
  hasActiveConversation(): boolean {
    return !!this.context.threadId && this.context.state !== "complete";
  }

  /**
   * Reset the conversation context
   */
  reset(): void {
    this.resetContext();
  }

  /**
   * Update API key for subsequent requests
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.client.defaults.headers["X-OpenAI-API-Key"] = apiKey;
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

  private async makeRequest(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.client.post("/bleak/chat", request);
    return response.data;
  }

  private updateContextFromResponse(response: ChatResponse): void {
    // Update thread ID
    this.context.threadId = response.thread_id;

    // Update state based on response
    if (isComplete(response)) {
      this.context.state = "complete";
    } else if (hasQuestions(response)) {
      this.context.state = "asking";
      this.context.currentQuestions = response.questions;
      this.context.questionsAsked += response.questions.length;
    } else {
      this.context.state = "asking"; // Clarification needed
    }
  }
}

/**
 * Convenience function to create a new BleakChat instance
 */
export function createChatClient(config?: ChatClientConfig): BleakChat {
  return new BleakChat(config);
}

/**
 * Ultra-simple function to solve a problem with automatic question handling
 */
export async function solve(
  prompt: string,
  questionHandler: (
    questions: InteractiveQuestion[]
  ) => Promise<AnsweredQuestion[]>,
  config?: ChatClientConfig & {
    maxRounds?: number;
    bleakElements?: BleakElement[];
  }
): Promise<string> {
  const client = new BleakChat(config);
  const maxRounds = config?.maxRounds || 5;
  let round = 0;

  try {
    // Start conversation
    let response = await client.ask(prompt, {
      bleakElements: config?.bleakElements
    });

    // Handle conversation rounds
    while (!isComplete(response) && round < maxRounds) {
      if (hasQuestions(response)) {
        const answers = await questionHandler(response.questions);
        response = await client.answer(answers);
      } else {
        // If no questions but not complete, try to finish
        response = await client.finish();
      }
      round++;
    }

    // Return final answer
    if (isAnswer(response)) {
      return response.content;
    } else {
      throw new ChatError(
        "Failed to get final answer after " + maxRounds + " rounds"
      );
    }
  } catch (error) {
    if (error instanceof ChatError) {
      throw error;
    }
    throw new ChatError(
      "Unexpected error during conversation: " + (error as Error).message
    );
  }
}
