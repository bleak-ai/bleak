/**
 * BleakAI - Transform AI conversations into structured forms
 *
 * Core Philosophy: Bring Your Own Components
 * BleakAI provides the intelligence to decide what components to use,
 * while you maintain complete control over how they look and behave.
 *
 * Essential functionality:
 * 1. API communication with /chat endpoint (start, continue, complete)
 * 2. Component matching for questions
 */

// === Main Classes ===
export {Bleak} from "./chat/Bleak";
export {BleakSession} from "./chat/BleakSession";

// === Configuration ===
export type {BleakConfig} from "./chat/Bleak";
export type {BleakSessionConfig} from "./chat/BleakSession";

// === Essential Types ===
export type {
  AnsweredQuestion,
  Question,
  TaskSpecification,
  ChatResponse,
  ChatRequest,
  StartChatRequest,
  ContinueChatRequest,
  CompleteChatRequest,
  BleakElement
} from "./chat/types";

// === Error Handling ===
export {BleakError} from "./chat/Bleak";

/**
 * Quick Start:
 *
 * ```typescript
 * import {BleakSession} from "bleakai";
 *
 * const bleak = new BleakSession({
 *   apiKey: "your-key",
 *   baseUrl: "http://localhost:8008/bleak",
 *   elements: {
 *     text: {
 *       component: YourTextInput,
 *       description: "For text input"
 *     },
 *     radio: {
 *       component: YourRadioGroup,
 *       description: "For single choice"
 *     }
 *   }
 * });
 *
 * // Start conversation
 * const result = await bleak.startBleakConversation("Help me with something");
 *
 * if (result.questions) {
 *   // Render components
 *   const components = bleak.resolveComponents(result.questions);
 *   // ... render in your UI
 * }
 * ```
 */
