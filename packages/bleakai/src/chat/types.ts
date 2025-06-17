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
export interface BleakQuestion {
  type: string;
  question: string;
  options?: string[];
}

// Output format specification for content generation
export interface OutputFormat {
  content_type?: string; // tweet, article, linkedin_post, email, etc.
  length?: string; // short, medium, long
  tone?: string; // professional, casual, friendly, formal, etc.
  format_requirements?: string; // any specific formatting needs
}

// Chat Request types (mirroring backend Union type)
export interface StartChatRequest {
  type: "start";
  topic: string;
  bleak_elements?: BleakElement[];
  output_format?: OutputFormat;
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
  questions?: BleakQuestion[];
  /** Whether this conversation has reached completion */
  is_complete: boolean;
}

// === COMPONENT PROP TYPES ===
// These define the props that BleakAI will pass to your React components

/**
 * Props for text input components (no predefined options)
 * Used for: text areas, input fields, sliders, etc.
 */
export interface BleakComponentProps {
  text: string; // The question text to display
  value: string; // Current answer value
  onChange: (value: string) => void; // Function to call when value changes
  uniqueId?: string; // Optional unique identifier
  elementIndex?: number; // Optional position in question list
}

/**
 * Props for choice-based components (with predefined options)
 * Used for: radio buttons, checkboxes, dropdowns, etc.
 */
export interface BleakChoiceProps extends BleakComponentProps {
  options: string[]; // Array of available choices
}
