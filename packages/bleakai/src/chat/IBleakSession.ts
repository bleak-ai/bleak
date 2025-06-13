import type {InteractiveQuestion} from "./types";

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
 * Core interface for Bleak session functionality
 * Both BleakCoreSession and BleakSession implement this interface
 */
export interface IBleakSession {
  /**
   * Start a new Bleak conversation
   * Returns questions immediately if the AI needs input, or a direct answer
   */
  startBleakConversation(prompt: string): Promise<{
    questions?: InteractiveQuestion[];
    answer?: string;
    getState: () => SessionState;
  }>;

  /**
   * Finish a Bleak conversation by submitting user answers
   */
  finishBleakConversation(answers: Record<string, string>): Promise<string>;

  /**
   * Request more questions after answering the current ones
   * This allows for iterative refinement of the conversation
   */
  requestMoreBleakQuestions(answers: Record<string, string>): Promise<{
    questions?: InteractiveQuestion[];
    isComplete: boolean;
    getState: () => SessionState;
  }>;

  /**
   * Get a quick answer without form interaction
   */
  quickBleakAsk(prompt: string): Promise<string>;

  /**
   * Get the current Bleak session state
   */
  getBleakState(): SessionState;

  /**
   * Reset the Bleak session
   */
  resetBleakSession(): void;
}
