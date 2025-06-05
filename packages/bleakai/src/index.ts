/**
 * BleakAI - Transform AI conversations into structured forms
 *
 * Core Philosophy: Bring Your Own Components
 * BleakAI provides the intelligence to decide what components to use,
 * while you maintain complete control over how they look and behave.
 */

// === Primary Bleak API ===
// The main, intuitive way to use BleakAI
export {BleakSession} from "./chat/BleakSession";
export type {BleakSessionConfig, SessionState} from "./chat/BleakSession";

// === Component System ===
// Framework-agnostic component resolution
export {createResolverFromConfig} from "./core/BleakResolver";
export type {BleakElementConfig} from "./types/core";

// === Built-in Components ===
// Ready-to-use components that work out of the box
export {
  BleakText,
  BleakRadio,
  defaultComponents,
  DEFAULT_BLEAK_ELEMENTS
} from "./components";
export type {BleakComponentProps} from "./components";

// === Conversation Types ===
// Types for handling conversations and questions
export type {AnsweredQuestion, InteractiveQuestion} from "./chat/types";

// === Error Types ===
// Error classes for proper error handling
export {ChatError, RateLimitError, AuthenticationError} from "./chat/Bleak";

/**
 * Quick Start with Bleak API:
 *
 * ```typescript
 * import { BleakSession } from 'bleakai';
 *
 * // Create a session with your components
 * const bleak = new BleakSession({
 *   apiKey: "your-key",
 *   elements: {
 *     text: { component: YourTextInput, description: "For text input" },
 *     radio: { component: YourRadioGroup, description: "For single choice" }
 *   }
 * });
 *
 * // Start a conversation (single call, no double await!)
 * const result = await bleak.startBleakConversation("Help me plan a trip");
 *
 * if (result.needsInput && result.questions) {
 *   // Convert questions to your components
 *   const components = bleak.getBleakComponents(result.questions, answers, onChange);
 *
 *   // Render components...
 *
 *   // Finish the conversation
 *   const finalAnswer = await bleak.finishBleakConversation(answers);
 * } else if (result.answer) {
 *   // Direct answer available
 *   console.log(result.answer);
 * }
 * ```
 */
