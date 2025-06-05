/**
 * Clean conversation interface for BleakAI
 * This is exported from createBleak, but we need the type for imports
 */

import type {FormQuestion, ResolvedComponent} from "../types/components";

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
