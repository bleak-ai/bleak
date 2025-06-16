/**
 * BleakAI - Transform AI conversations into structured forms
 *
 * Core Philosophy: Bring Your Own Components
 * BleakAI provides the intelligence to decide what components to use,
 * while you maintain complete control over how they look and behave.
 */

// === Primary Bleak API ===
// Main classes
export {Bleak} from "./chat/Bleak";
export {BleakSession} from "./chat/BleakSession";

// Configuration interfaces
export type {BleakConfig} from "./chat/Bleak";
export type {BleakSessionConfig} from "./chat/BleakSession";

// === Advanced/Legacy APIs ===
// Core-only session (backend/CLI usage, no UI components)
export {BleakCoreSession} from "./chat/BleakCoreSession";
export type {BleakCoreSessionConfig} from "./chat/BleakCoreSession";

// Interface and shared types
export type {IBleakSession, SessionState} from "./chat/IBleakSession";

// === Component System ===
// Framework-agnostic component resolution
export {createResolverFromConfig} from "./core/BleakResolver";
export type {
  BleakElementConfig,
  BleakComponentProps,
  BleakInputProps,
  BleakChoiceProps
} from "./types/core";

// === Built-in Components ===
// Ready-to-use components that work out of the box
export {
  BleakText,
  BleakRadio,
  defaultComponents,
  DEFAULT_BLEAK_ELEMENTS
} from "./components";

// === Conversation Types ===
// Types for handling conversations and questions
export type {
  AnsweredQuestion,
  Question,
  InteractiveQuestion,
  TaskSpecification,
  ChatResponse,
  ChatRequest,
  StartChatRequest,
  ContinueChatRequest,
  CompleteChatRequest,
  BleakElement
} from "./chat/types";

// === Error Types ===
// Error classes for proper error handling
export {BleakError} from "./chat/Bleak";

// === React Integration ===
export {useBleakInstance} from "./react/useBleakInstance";

/**
 * Quick Start (RECOMMENDED):
 *
 * ```typescript
 * import {BleakSession} from "bleakai";
 *
 * // One unified session for everything
 * const bleak = new BleakSession({
 *   apiKey: "your-key",
 *   elements: {
 *     text: {component: YourTextInput, description: "For text input"},
 *     radio: {component: YourRadioGroup, description: "For single choice"}
 *   },
 *   task_specification: {
 *     output_type: "travel_plan",
 *     target_length: "detailed",
 *     description: "A comprehensive travel itinerary"
 *   }
 * });
 *
 * // Start a conversation
 * const result = await bleak.startBleakConversation("Help me plan a trip");
 *
 * if (result.questions && result.questions.length > 0) {
 *   // Convert questions to your components
 *   const components = bleak.resolveComponents(result.questions);
 *   // ... render components
 * }
 * ```
 *
 * For backend/CLI usage without UI:
 *
 * ```typescript
 * import {BleakCoreSession} from "bleakai";
 *
 * // For backend/CLI - no UI dependencies
 * const bleak = new BleakCoreSession({
 *   apiKey: "your-key"
 * });
 *
 * const answer = await bleak.quickBleakAsk("What's the weather like?");
 * ```
 */
