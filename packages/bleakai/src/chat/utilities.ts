/**
 * Chat Utilities - High-level convenience functions for the Bleak Chat SDK
 *
 * These utilities provide common patterns and helper functions to make
 * implementing the Bleak Chat SDK easier for developers.
 */

import {BleakChat, createChatClient} from "./BleakChat";
import {BleakConversation, createConversation} from "./BleakConversation";
import {
  ChatError,
  RateLimitError,
  AuthenticationError,
  type ChatResponse,
  type AnsweredQuestion,
  type InteractiveQuestion,
  type BleakElement,
  type ChatClientConfig
} from "./types";

/**
 * Create a new chat client with simplified configuration
 */
export function createSimpleChatClient(
  config: ChatClientConfig & {
    baseUrl?: string;
  }
): BleakChat {
  return createChatClient({
    baseUrl: config.baseUrl || "http://localhost:8000",
    apiKey: config.apiKey,
    timeout: config.timeout || 30000,
    retries: config.retries
  });
}

/**
 * Create a new conversation client with simplified configuration
 */
export function createSimpleConversation(
  config: ChatClientConfig & {
    baseUrl?: string;
  }
): BleakConversation {
  return createConversation({
    baseUrl: config.baseUrl || "http://localhost:8000",
    apiKey: config.apiKey,
    timeout: config.timeout || 30000,
    retries: config.retries
  });
}

/**
 * Start a new conversation with the AI
 *
 * @param prompt - The initial question or prompt
 * @param config - Configuration for the chat client
 * @param options - Optional configuration including client to use
 * @returns Promise resolving to the response and client
 */
export async function startConversation(
  prompt: string,
  config: ChatClientConfig & {
    baseUrl?: string;
  },
  options: {
    client?: BleakChat;
    bleakElements?: BleakElement[];
  } = {}
): Promise<{response: ChatResponse; client: BleakChat}> {
  const client = options.client || createSimpleChatClient(config);

  try {
    const response = await client.ask(prompt, {
      bleakElements: options.bleakElements
    });

    return {response, client};
  } catch (error) {
    console.error("Error starting conversation:", error);
    throw error;
  }
}

/**
 * Continue an existing conversation with answers
 *
 * @param client - The chat client instance
 * @param answers - Answers to the previous questions
 * @param wantMoreQuestions - Optional hint about wanting more questions
 * @returns Promise resolving to the chat response
 */
export async function continueConversation(
  client: BleakChat,
  answers: AnsweredQuestion[],
  wantMoreQuestions?: boolean
): Promise<ChatResponse> {
  try {
    return await client.answer(answers, wantMoreQuestions);
  } catch (error) {
    console.error("Error continuing conversation:", error);
    throw error;
  }
}

/**
 * Request more questions from the AI
 *
 * @param client - The chat client instance
 * @returns Promise resolving to the chat response with more questions
 */
export async function requestMoreQuestions(
  client: BleakChat
): Promise<ChatResponse> {
  try {
    return await client.more();
  } catch (error) {
    console.error("Error requesting more questions:", error);
    throw error;
  }
}

/**
 * Complete the conversation and get the final answer
 *
 * @param client - The chat client instance
 * @param finalAnswers - Optional final answers to include
 * @returns Promise resolving to the final answer
 */
export async function finishConversation(
  client: BleakChat,
  finalAnswers: AnsweredQuestion[] = []
): Promise<ChatResponse> {
  try {
    return await client.finish(finalAnswers);
  } catch (error) {
    console.error("Error finishing conversation:", error);
    throw error;
  }
}

/**
 * Ultra-simple conversation solver - handles the entire conversation automatically
 *
 * @param prompt - The initial question
 * @param questionHandler - Function to handle questions and return answers
 * @param config - Configuration for the chat client
 * @param options - Optional configuration
 * @returns Promise resolving to the final answer string
 */
export async function solveWithConversation(
  prompt: string,
  questionHandler: (
    questions: InteractiveQuestion[]
  ) => Promise<AnsweredQuestion[]>,
  config: ChatClientConfig & {
    baseUrl?: string;
  },
  options: {
    maxRounds?: number;
    bleakElements?: BleakElement[];
  } = {}
): Promise<string> {
  const conversation = createSimpleConversation(config);

  try {
    const generator = conversation.chat(prompt, {
      maxRounds: options.maxRounds,
      bleakElements: options.bleakElements
    });

    let result = await generator.next();

    while (!result.done) {
      const questions = result.value;
      const answers = await questionHandler(questions);
      result = await generator.next(answers);
    }

    return result.value;
  } catch (error) {
    console.error("Error in conversation solver:", error);
    throw error;
  }
}

/**
 * Generator-based conversation for advanced control
 *
 * @param prompt - The initial question
 * @param config - Configuration for the chat client
 * @param options - Optional configuration
 * @returns AsyncGenerator for step-by-step conversation control
 */
export async function* conversationGenerator(
  prompt: string,
  config: ChatClientConfig & {
    baseUrl?: string;
  },
  options: {
    maxRounds?: number;
    bleakElements?: BleakElement[];
  } = {}
): AsyncGenerator<InteractiveQuestion[], string, AnsweredQuestion[]> {
  const conversation = createSimpleConversation(config);

  try {
    const generator = conversation.chat(prompt, {
      maxRounds: options.maxRounds,
      bleakElements: options.bleakElements
    });

    let result = await generator.next();

    while (!result.done) {
      const questions = result.value;
      const answers: AnsweredQuestion[] = yield questions;
      result = await generator.next(answers);
    }

    return result.value;
  } catch (error) {
    console.error("Error in conversation generator:", error);
    throw error;
  }
}

/**
 * Event-driven conversation with custom handlers
 *
 * @param prompt - The initial question
 * @param handlers - Event handlers for different conversation events
 * @param config - Configuration for the chat client
 * @param options - Optional configuration
 * @returns Promise resolving to the final answer
 */
export async function eventDrivenConversation(
  prompt: string,
  handlers: {
    onQuestion?: (
      questions: InteractiveQuestion[]
    ) => Promise<AnsweredQuestion[]>;
    onAnswer?: (response: ChatResponse) => void;
    onComplete?: (answer: string) => void;
    onError?: (error: Error) => void;
  },
  config: ChatClientConfig & {
    baseUrl?: string;
  },
  options: {
    maxRounds?: number;
    bleakElements?: BleakElement[];
  } = {}
): Promise<string> {
  const conversation = createSimpleConversation(config);

  try {
    return await conversation.startEventDrivenConversation(prompt, handlers, {
      maxRounds: options.maxRounds,
      bleakElements: options.bleakElements
    });
  } catch (error) {
    console.error("Error in event-driven conversation:", error);
    throw error;
  }
}

/**
 * Type guard to check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

/**
 * Type guard to check if error is an authentication error
 */
export function isAuthenticationError(
  error: unknown
): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * Type guard to check if error is a chat error
 */
export function isChatError(error: unknown): error is ChatError {
  return error instanceof ChatError;
}

/**
 * Get a user-friendly error message from any chat error
 */
export function getChatErrorMessage(error: unknown): string {
  if (isRateLimitError(error)) {
    const retryAfter = error.retryAfter
      ? ` Try again in ${error.retryAfter} seconds.`
      : "";
    return `Rate limit exceeded.${retryAfter}`;
  } else if (isAuthenticationError(error)) {
    return "API key is invalid or missing. Please check your OpenAI API key.";
  } else if (isChatError(error)) {
    return error.message;
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return "An unexpected error occurred.";
  }
}
