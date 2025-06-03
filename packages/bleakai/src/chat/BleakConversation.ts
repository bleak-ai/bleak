/**
 * BleakConversation - Advanced conversation management with generator-based flow
 *
 * This class provides a more advanced way to handle conversations using async generators,
 * allowing for natural conversational patterns and event-driven architecture.
 */

// Simple browser-compatible EventEmitter implementation
class SimpleEventEmitter {
  private events: {[key: string]: Array<(...args: any[]) => void>} = {};

  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: (...args: any[]) => void): void {
    if (!this.events[event]) return;
    const index = this.events[event].indexOf(listener);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach((listener) => {
      try {
        listener(...args);
      } catch (error) {
        console.error("EventEmitter error:", error);
      }
    });
  }
}

import {BleakChat, createChatClient} from "./BleakChat";
import {
  ChatResponse,
  AnsweredQuestion,
  BleakElement,
  InteractiveQuestion,
  ChatClientConfig,
  ConversationEvent,
  ConversationEventHandler,
  hasQuestions,
  isAnswer,
  isComplete,
  ChatError
} from "./types";

export class BleakConversation extends SimpleEventEmitter {
  private chatClient: BleakChat;
  private isActive: boolean = false;

  constructor(config?: ChatClientConfig) {
    super();
    this.chatClient = createChatClient(config);
  }

  /**
   * Start a conversational session using async generator pattern
   *
   * @param prompt Initial prompt to start the conversation
   * @param options Configuration options for the conversation
   * @returns AsyncGenerator that yields questions and returns final answer
   */
  async *chat(
    prompt: string,
    options: {
      bleakElements?: BleakElement[];
      maxRounds?: number;
    } = {}
  ): AsyncGenerator<InteractiveQuestion[], string, AnsweredQuestion[]> {
    this.isActive = true;
    const maxRounds = options.maxRounds || 10;
    let round = 0;

    try {
      this.emit("conversation:start", {prompt, options});

      // Start the conversation
      let response = await this.chatClient.ask(prompt, {
        bleakElements: options.bleakElements
      });

      this.emitEvent("question", response);

      // Continue conversation until complete or max rounds reached
      while (!isComplete(response) && round < maxRounds && this.isActive) {
        if (hasQuestions(response)) {
          // Yield questions and wait for answers
          const answers: AnsweredQuestion[] = yield response.questions;
          this.emitEvent("answer", {answers, round});

          // Continue with answers
          response = await this.chatClient.answer(answers);
          this.emitEvent("question", response);
        } else {
          // No questions but not complete - try to finish
          response = await this.chatClient.finish();
          this.emitEvent("question", response);
        }
        round++;
      }

      // Final answer
      const finalAnswer = isAnswer(response)
        ? response.content
        : "Conversation completed without final answer";
      this.emitEvent("complete", {answer: finalAnswer, rounds: round});
      this.emit("conversation:end", {answer: finalAnswer, rounds: round});

      return finalAnswer;
    } catch (error) {
      this.emitEvent("error", error);
      this.emit("conversation:error", error);
      throw error;
    } finally {
      this.isActive = false;
    }
  }

  /**
   * Alternative conversation pattern - event-driven
   */
  async startEventDrivenConversation(
    prompt: string,
    handlers: {
      onQuestion?: (
        questions: InteractiveQuestion[]
      ) => Promise<AnsweredQuestion[]>;
      onAnswer?: (response: ChatResponse) => void;
      onComplete?: (answer: string) => void;
      onError?: (error: Error) => void;
    },
    options: {
      bleakElements?: BleakElement[];
      maxRounds?: number;
    } = {}
  ): Promise<string> {
    const maxRounds = options.maxRounds || 10;
    let round = 0;

    try {
      this.isActive = true;
      this.emit("conversation:start", {prompt, options});

      let response = await this.chatClient.ask(prompt, {
        bleakElements: options.bleakElements
      });

      while (!isComplete(response) && round < maxRounds && this.isActive) {
        if (hasQuestions(response) && handlers.onQuestion) {
          const answers = await handlers.onQuestion(response.questions);
          response = await this.chatClient.answer(answers);
          if (handlers.onAnswer) {
            handlers.onAnswer(response);
          }
        } else {
          response = await this.chatClient.finish();
        }
        round++;
      }

      const finalAnswer = isAnswer(response)
        ? response.content
        : "Conversation completed";

      if (handlers.onComplete) {
        handlers.onComplete(finalAnswer);
      }

      this.emit("conversation:end", {answer: finalAnswer, rounds: round});
      return finalAnswer;
    } catch (error) {
      if (handlers.onError) {
        handlers.onError(error as Error);
      }
      this.emit("conversation:error", error);
      throw error;
    } finally {
      this.isActive = false;
    }
  }

  /**
   * Stop the active conversation
   */
  stop(): void {
    this.isActive = false;
    this.emit("conversation:stop");
  }

  /**
   * Check if conversation is currently active
   */
  isConversationActive(): boolean {
    return this.isActive;
  }

  /**
   * Get the underlying chat client for advanced operations
   */
  getChatClient(): BleakChat {
    return this.chatClient;
  }

  /**
   * Register event handlers
   */
  onConversationEvent(handler: ConversationEventHandler): void {
    this.on("conversation:event", handler);
  }

  /**
   * Remove event handlers
   */
  offConversationEvent(handler: ConversationEventHandler): void {
    this.off("conversation:event", handler);
  }

  // Private methods

  private emitEvent(type: ConversationEvent["type"], data: any): void {
    const event: ConversationEvent = {
      type,
      data,
      timestamp: new Date()
    };
    this.emit("conversation:event", event);
  }
}

/**
 * Convenience function to create a new conversation
 */
export function createConversation(
  config?: ChatClientConfig
): BleakConversation {
  return new BleakConversation(config);
}

/**
 * Simple conversation helper using the generator pattern
 */
export async function simpleConversation(
  prompt: string,
  questionHandler: (
    questions: InteractiveQuestion[]
  ) => Promise<AnsweredQuestion[]>,
  config?: ChatClientConfig & {maxRounds?: number}
): Promise<string> {
  const conversation = createConversation(config);
  const generator = conversation.chat(prompt, {maxRounds: config?.maxRounds});

  try {
    let result = await generator.next();

    while (!result.done) {
      const questions = result.value;
      const answers = await questionHandler(questions);
      result = await generator.next(answers);
    }

    return result.value;
  } catch (error) {
    await generator.throw(error);
    throw error;
  }
}

/**
 * Batch conversation helper - run multiple conversations in parallel
 */
export async function batchConversations(
  conversations: Array<{
    prompt: string;
    questionHandler: (
      questions: InteractiveQuestion[]
    ) => Promise<AnsweredQuestion[]>;
  }>,
  config?: ChatClientConfig & {maxConcurrent?: number}
): Promise<string[]> {
  const maxConcurrent = config?.maxConcurrent || 3;
  const results: string[] = [];

  // Process conversations in batches
  for (let i = 0; i < conversations.length; i += maxConcurrent) {
    const batch = conversations.slice(i, i + maxConcurrent);

    const batchPromises = batch.map(({prompt, questionHandler}) =>
      simpleConversation(prompt, questionHandler, config)
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}
