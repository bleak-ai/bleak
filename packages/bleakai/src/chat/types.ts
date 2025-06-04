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

export interface InteractiveQuestion {
  type: string;
  question: string;
  options?: string[];
}

// Chat Request types (mirroring backend Union type)
export interface InitialChatRequest {
  type: "start";
  prompt: string;
  bleak_elements?: BleakElement[];
}

export interface ContinuationChatRequest {
  type: "continue";
  thread_id: string;
  answers: AnsweredQuestion[];
  want_more_questions?: boolean;
}

export interface CompletionChatRequest {
  type: "complete";
  thread_id: string;
  answers: AnsweredQuestion[];
}

export type ChatRequest =
  | InitialChatRequest
  | ContinuationChatRequest
  | CompletionChatRequest;

// Chat Response type (mirroring backend)
export interface ChatResponse {
  thread_id: string;
  type: "questions" | "answer" | "clarification";
  content: string;
  questions?: InteractiveQuestion[];
  actions?: string[];
  is_complete: boolean;
  progress?: {
    questions_asked?: number;
    questions_answered?: number;
    additional_questions?: number;
    phase?:
      | "initial"
      | "clarifying"
      | "follow_up"
      | "completed"
      | "force_completed";
    [key: string]: any;
  };
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
): response is ChatResponse & {questions: InteractiveQuestion[]} {
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

export function isClarification(
  response: ChatResponse
): response is ChatResponse & {type: "clarification"} {
  return response.type === "clarification";
}

export function isComplete(response: ChatResponse): boolean {
  return response.is_complete === true;
}

// Type guards for chat requests
export function isInitialRequest(
  request: ChatRequest
): request is InitialChatRequest {
  return request.type === "start";
}

export function isContinuationRequest(
  request: ChatRequest
): request is ContinuationChatRequest {
  return request.type === "continue";
}

export function isCompletionRequest(
  request: ChatRequest
): request is CompletionChatRequest {
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
  currentQuestions?: InteractiveQuestion[];
  allAnswers: AnsweredQuestion[];
}

// Event types for advanced conversation management
export interface ConversationEvent {
  type: "question" | "answer" | "complete" | "error";
  data: any;
  timestamp: Date;
}

export type ConversationEventHandler = (event: ConversationEvent) => void;
