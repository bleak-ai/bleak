import axios, {AxiosInstance, AxiosError} from "axios";
import {
  StartChatRequest,
  ContinueChatRequest,
  CompleteChatRequest,
  ChatResponse,
  Question,
  hasQuestions,
  isComplete,
  AnsweredQuestion,
  BleakElement
} from "./types";

// Essential configuration
export interface BleakConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  // Component configuration - this is what makes Bleak special
  elements?: Record<
    string,
    {
      component: any;
      description: string;
    }
  >;
}

// Essential conversation state
interface ConversationState {
  threadId?: string;
  isActive: boolean;
  currentQuestions?: Question[];
}

// Custom errors
export class BleakError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "BleakError";
  }
}

/**
 * Bleak - Essential BleakAI functionality
 *
 * Core responsibilities:
 * 1. API communication with /chat endpoint (start, continue, complete)
 * 2. Component matching for questions
 * 3. Basic conversation state management
 */
export class Bleak {
  private client: AxiosInstance;
  private elements?: BleakConfig["elements"];
  private state: ConversationState = {
    isActive: false
  };

  constructor(config: BleakConfig) {
    // Initialize API client
    this.client = axios.create({
      baseURL: config.baseUrl || "https://api.bleak.ai",
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
        ...(config.apiKey && {"X-OpenAI-API-Key": config.apiKey})
      }
    });

    // Store component configuration
    this.elements = config.elements;

    // Error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const status = error.response?.status;
        const message = (error.response?.data as any)?.detail || error.message;
        throw new BleakError(message, status);
      }
    );
  }

  /**
   * ESSENTIAL FUNCTION 1: Start conversation
   * Calls /chat with type="start"
   */
  async start(prompt: string): Promise<{
    questions?: Question[];
    answer?: string;
  }> {
    const request: StartChatRequest = {
      type: "start",
      prompt,
      bleak_elements: this.elements ? this.getBleakElementsForAPI() : undefined
    };

    const response = await this.client.post<ChatResponse>("/chat", request);
    const chatResponse = response.data;

    // Update state
    this.state.threadId = chatResponse.thread_id;
    this.state.isActive = !chatResponse.is_complete;
    this.state.currentQuestions = chatResponse.questions;

    return {
      questions: chatResponse.questions,
      answer: chatResponse.type === "answer" ? chatResponse.message : undefined
    };
  }

  /**
   * ESSENTIAL FUNCTION 2: Continue conversation
   * Calls /chat with type="continue"
   */
  async continue(
    answers: Record<string, string>,
    wantMoreQuestions = false
  ): Promise<{
    questions?: Question[];
    answer?: string;
  }> {
    if (!this.state.threadId) {
      throw new BleakError("No active conversation. Call start() first.");
    }

    const answeredQuestions: AnsweredQuestion[] = Object.entries(answers).map(
      ([question, answer]) => ({
        question,
        answer
      })
    );

    const request: ContinueChatRequest = {
      type: "continue",
      thread_id: this.state.threadId,
      answers: answeredQuestions,
      user_choice: wantMoreQuestions ? "more_questions" : "final_answer"
    };

    const response = await this.client.post<ChatResponse>("/chat", request);
    const chatResponse = response.data;

    // Update state
    this.state.isActive = !chatResponse.is_complete;
    this.state.currentQuestions = chatResponse.questions;

    return {
      questions: chatResponse.questions,
      answer: chatResponse.type === "answer" ? chatResponse.message : undefined
    };
  }

  /**
   * ESSENTIAL FUNCTION 3: Complete conversation
   * Calls /chat with type="complete"
   */
  async complete(answers: Record<string, string> = {}): Promise<string> {
    if (!this.state.threadId) {
      throw new BleakError("No active conversation. Call start() first.");
    }

    const answeredQuestions: AnsweredQuestion[] = Object.entries(answers).map(
      ([question, answer]) => ({
        question,
        answer
      })
    );

    const request: CompleteChatRequest = {
      type: "complete",
      thread_id: this.state.threadId,
      answers: answeredQuestions
    };

    const response = await this.client.post<ChatResponse>("/chat", request);
    const chatResponse = response.data;

    // Reset state - conversation is done
    this.state.isActive = false;
    this.state.currentQuestions = undefined;

    return chatResponse.message;
  }

  /**
   * ESSENTIAL FUNCTION 4: Component matching
   * Matches questions to configured components
   */
  getComponents(questions: Question[]): Array<{
    question: Question;
    Component: any;
    props: {
      text: string;
      options?: string[];
      uniqueId: string;
    };
  }> {
    if (!this.elements) {
      throw new BleakError(
        "No components configured. Pass 'elements' in constructor."
      );
    }

    return questions.map((question, index) => {
      const elementConfig = this.elements![question.type];

      if (!elementConfig) {
        throw new BleakError(
          `No component configured for type: ${question.type}`
        );
      }

      return {
        question,
        Component: elementConfig.component,
        props: {
          text: question.question,
          options: question.options,
          uniqueId: `bleak-${question.type}-${index}`
        }
      };
    });
  }

  /**
   * Get current conversation state
   */
  getState() {
    return {...this.state};
  }

  /**
   * Reset conversation
   */
  reset() {
    this.state = {isActive: false};
  }

  // Helper: Convert elements config to API format
  private getBleakElementsForAPI(): BleakElement[] {
    if (!this.elements) return [];

    return Object.entries(this.elements).map(([name, config]) => ({
      name,
      description: config.description
    }));
  }
}
