/**
 * bleakai - Framework-Agnostic Bleak Element Component Resolver
 *
 * A library that handles the logic of determining which component to use for dynamic bleak elements.
 * No rendering, no framework dependencies - just pure component resolution logic.
 */

export const FRAMEWORK_AGNOSTIC = true;

// Main exports - resolver functions and classes
export {
  BleakResolver,
  createResolver,
  createResolverFromConfig,
  resolveElement,
  resolveElements
} from "./core/BleakResolver";

// Type exports - all the types users need
export type {
  BleakElement,
  ComponentResolution,
  ComponentRegistry,
  ResolverOptions,
  BleakElementConfig,
  BleakElementTypeConfig,
  BleakElementType,
  ComponentType
} from "./types/core";

// Legacy export for backward compatibility - marked as deprecated
export type {BleakElementProps} from "./types/core";

// === NEW CONVERSATIONAL CHAT SDK (Strategy 2) ===

// Chat SDK exports
export {BleakChat, createChatClient, solve} from "./chat/BleakChat";

export {
  BleakConversation,
  createConversation,
  simpleConversation,
  batchConversations
} from "./chat/BleakConversation";

// Chat utility exports (type guards and error classes)
export {
  // Response type guards
  hasQuestions,
  isAnswer,
  isClarification,
  isComplete,

  // Request type guards
  isInitialRequest,
  isContinuationRequest,
  isCompletionRequest,

  // Error classes
  ChatError,
  RateLimitError,
  AuthenticationError
} from "./chat/types";

// High-level convenience utilities - NEW!
export {
  // Simple client creation
  createSimpleChatClient,
  createSimpleConversation,

  // Conversation flow helpers
  startConversation,
  continueConversation,
  requestMoreQuestions,
  finishConversation,

  // Advanced conversation patterns
  solveWithConversation,
  conversationGenerator,
  eventDrivenConversation,

  // Error handling utilities
  isRateLimitError,
  isAuthenticationError,
  isChatError,
  getChatErrorMessage
} from "./chat/utilities";

// Chat type exports
export type {
  // Request/Response types
  ChatRequest,
  ChatResponse,
  InitialChatRequest,
  ContinuationChatRequest,
  CompletionChatRequest,

  // Base types
  AnsweredQuestion,
  InteractiveQuestion,
  BleakElement as ChatBleakElement, // Rename to avoid conflict with core BleakElement

  // Configuration
  ChatClientConfig,

  // Context and events
  ConversationContext,
  ConversationEvent,
  ConversationEventHandler,
  ConversationState
} from "./chat/types";
