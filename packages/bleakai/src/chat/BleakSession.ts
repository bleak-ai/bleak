import axios, {AxiosInstance, AxiosError} from "axios";
import {
  AnsweredQuestion,
  BleakQuestion,
  ChatResponse,
  BleakElement,
  StartChatRequest,
  ContinueChatRequest,
  CompleteChatRequest,
  OutputFormat
} from "./types";

// Simple configuration
export interface BleakSessionConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  elements?: Record<
    string,
    {
      component: any;
      description: string;
    }
  >;
  outputFormat?: OutputFormat;
}

// Simple state - just what we need
interface SessionState {
  threadId?: string;
  questions?: BleakQuestion[];
}

/**
 *
 * Essential methods:
 * - startBleakConversation()
 * - finishBleakConversation()
 * - requestMoreBleakQuestions()
 * - resolveComponents()
 * - resetBleakSession()
 */
export class BleakSession {
  private client: AxiosInstance;
  private elements?: BleakSessionConfig["elements"];
  private outputFormat?: OutputFormat;
  private state: SessionState = {};

  constructor(config: BleakSessionConfig) {
    // Setup API client
    this.client = axios.create({
      baseURL: config.baseUrl || "https://api.bleak.ai",
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
        ...(config.apiKey && {"X-BleakAI-API-Key": config.apiKey})
      }
    });

    // Store config
    this.elements = config.elements;
    this.outputFormat = config.outputFormat;

    // Simple error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const message = (error.response?.data as any)?.detail || error.message;
        throw new Error(message);
      }
    );
  }

  /**
   * Start conversation - returns questions or direct answer
   */
  async startBleakConversation(topic: string): Promise<{
    questions?: BleakQuestion[];
    answer?: string;
  }> {
    const request: StartChatRequest = {
      type: "start",
      topic,
      bleak_elements: this.getBleakElements(),
      output_format: this.outputFormat
    };

    const response = await this.client.post<ChatResponse>("/chat", request);
    const chatResponse = response.data;

    // Update state
    this.state.threadId = chatResponse.thread_id;
    this.state.questions = chatResponse.questions;

    return {
      questions: chatResponse.questions,
      answer: chatResponse.type === "answer" ? chatResponse.message : undefined
    };
  }

  /**
   * Get final answer by completing conversation
   */
  async finishBleakConversation(
    answers: Record<string, string>
  ): Promise<string> {
    if (!this.state.threadId) {
      throw new Error("No active conversation");
    }

    const request: CompleteChatRequest = {
      type: "complete",
      thread_id: this.state.threadId,
      answers: this.convertAnswers(answers)
    };

    const response = await this.client.post<ChatResponse>("/chat", request);
    const chatResponse = response.data;

    return chatResponse.message;
  }

  /**
   * Request more questions after answering current ones
   */
  async requestMoreBleakQuestions(answers: Record<string, string>): Promise<{
    questions?: BleakQuestion[];
    isComplete: boolean;
  }> {
    if (!this.state.threadId) {
      throw new Error("No active conversation");
    }

    const request: ContinueChatRequest = {
      type: "continue",
      thread_id: this.state.threadId,
      answers: this.convertAnswers(answers),
      user_choice: "more_questions"
    };

    const response = await this.client.post<ChatResponse>("/chat", request);
    const chatResponse = response.data;

    // Update state
    this.state.questions = chatResponse.questions;

    return {
      questions: chatResponse.questions,
      isComplete: chatResponse.is_complete
    };
  }

  /**
   * Resolve questions to components for rendering
   */
  resolveComponents(questions: BleakQuestion[]): Array<{
    Component: any;
    staticProps: {
      text: string;
      options?: string[] | null;
      uniqueId: string;
      elementIndex: number;
    };
    question: BleakQuestion;
  }> {
    if (!this.elements) {
      throw new Error("No elements configured");
    }

    return questions.map((question, index) => {
      const elementConfig = this.elements![question.type];

      if (!elementConfig) {
        throw new Error(`No component configured for type: ${question.type}`);
      }

      return {
        Component: elementConfig.component,
        staticProps: {
          text: question.question,
          options: question.options || null,
          uniqueId: `bleak-${question.type}-${index}`,
          elementIndex: index
        },
        question
      };
    });
  }

  /**
   * Reset session
   */
  resetBleakSession(): void {
    this.state = {};
  }

  // Helper methods
  private getBleakElements(): BleakElement[] | undefined {
    if (!this.elements) return undefined;

    return Object.entries(this.elements).map(([name, config]) => ({
      name,
      description: config.description
    }));
  }

  private convertAnswers(answers: Record<string, string>): AnsweredQuestion[] {
    return Object.entries(answers).map(([question, answer]) => ({
      question,
      answer
    }));
  }
}
