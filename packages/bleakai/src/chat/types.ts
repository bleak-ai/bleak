/**
 * TypeScript types for the Bleak class implementation
 *
 * These types mirror the backend Pydantic models to ensure type safety
 * across the API boundary.
 */

// Base types
export interface AnsweredQuestion {
  question: string;
  answer: string;
}

export interface BleakElement {
  name: string;
  description: string;
}

// Unified question interface (matches backend DynamicQuestion)
export interface Question {
  type: string;
  question: string;
  options?: string[];
}

// Legacy alias for backward compatibility
export interface InteractiveQuestion extends Question {}

export interface TaskSpecification {
  output_type?: string; // "linkedin_post", "long_article", "tutorial", "documentation", etc. Default: "article"
  target_length?: string; // "short", "medium", "long". Default: "medium"
  description?: string; // User-defined context. Default: "helpful content based on the user's request"
}

// Chat Request types (mirroring backend Union type)
export interface StartChatRequest {
  type: "start";
  prompt: string;
  bleak_elements?: BleakElement[];
  task_specification?: TaskSpecification;
}

export interface ContinueChatRequest {
  type: "continue";
  thread_id: string;
  answers: AnsweredQuestion[];
  user_choice?: "more_questions" | "final_answer";
}

export interface CompleteChatRequest {
  type: "complete";
  thread_id: string;
  answers: AnsweredQuestion[];
}

export type ChatRequest =
  | StartChatRequest
  | ContinueChatRequest
  | CompleteChatRequest;

// Simplified ChatResponse (removed clarification type)
export interface ChatResponse {
  /** Unique conversation identifier */
  thread_id: string;
  /** Response type determining how to handle the response */
  type: "questions" | "answer";
  /** Main response message - answer text or instructional message */
  message: string;
  /** Interactive questions for the user (only present when type="questions") */
  questions?: Question[];
  /** Whether this conversation has reached completion */
  is_complete: boolean;
}

// SDK Configuration
export interface ChatClientConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
}

// Error types
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

// Type guards for chat responses
export function hasQuestions(
  response: ChatResponse
): response is ChatResponse & {questions: Question[]} {
  return (
    response.type === "questions" &&
    Array.isArray(response.questions) &&
    response.questions.length > 0
  );
}

export function isAnswer(
  response: ChatResponse
): response is ChatResponse & {type: "answer"} {
  return response.type === "answer";
}

export function isComplete(response: ChatResponse): boolean {
  return response.is_complete === true;
}

// Type guards for chat requests
export function isStartRequest(
  request: ChatRequest
): request is StartChatRequest {
  return request.type === "start";
}

export function isContinueRequest(
  request: ChatRequest
): request is ContinueChatRequest {
  return request.type === "continue";
}

export function isCompleteRequest(
  request: ChatRequest
): request is CompleteChatRequest {
  return request.type === "complete";
}

// Utility types for conversation state
export type ConversationState =
  | "starting"
  | "asking"
  | "answering"
  | "completing"
  | "complete";

export interface ConversationContext {
  threadId?: string;
  state: ConversationState;
  questionsAsked: number;
  questionsAnswered: number;
  currentQuestions?: Question[];
  allAnswers: AnsweredQuestion[];
}

// Event types for advanced conversation management
export interface ConversationEvent {
  type: "question" | "answer" | "complete" | "error";
  data: any;
  timestamp: Date;
}

export type ConversationEventHandler = (event: ConversationEvent) => void;
