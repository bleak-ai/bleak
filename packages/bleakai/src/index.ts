/**
 * BleakAI - Transform AI conversations into structured forms
 *
 * Core Philosophy: Bring Your Own Components
 * BleakAI provides the intelligence to decide what components to use,
 * while you maintain complete control over how they look and behave.
 */

// === Primary Bleak API ===
// The main, intuitive way to use BleakAI

// New architecture - recommended for new projects
export {BleakCoreSession} from "./chat/BleakCoreSession";
export type {BleakCoreSessionConfig} from "./chat/BleakCoreSession";
export {BleakUISession} from "./chat/BleakUISession";
export type {BleakUISessionConfig} from "./chat/BleakUISession";

// Interface and shared types
export type {IBleakSession, SessionState} from "./chat/IBleakSession";

// Backward compatibility - use BleakUISession for new projects
export {BleakSession} from "./chat/BleakSession";
export type {BleakSessionConfig} from "./chat/BleakSession";

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
export type {AnsweredQuestion, InteractiveQuestion} from "./chat/types";

// === Error Types ===
// Error classes for proper error handling
export {ChatError, RateLimitError, AuthenticationError} from "./chat/Bleak";

/**
 * Quick Start with New Architecture:
 *
 * ```typescript
 * import { BleakUISession } from 'bleakai';
 *
 * // For UI applications - includes getBleakComponents
 * const bleak = new BleakUISession({
 *   apiKey: "your-key",
 *   elements: {
 *     text: { component: YourTextInput, description: "For text input" },
 *     radio: { component: YourRadioGroup, description: "For single choice" }
 *   }
 * });
 *
 * // Start a conversation
 * const result = await bleak.startBleakConversation("Help me plan a trip");
 *
 * if (result.questions && result.questions.length > 0) {
 *   // Convert questions to your components
 *   const components = bleak.getBleakComponents(result.questions, answers, onChange);
 *   // ... render components
 * }
 * ```
 *
 * For backend/CLI usage without UI:
 *
 * ```typescript
 * import { BleakCoreSession } from 'bleakai';
 *
 * // For backend/CLI - no UI dependencies
 * const bleak = new BleakCoreSession({
 *   apiKey: "your-key"
 * });
 *
 * // Use all conversation methods except getBleakComponents
 * const answer = await bleak.quickBleakAsk("What's the weather like?");
 * ```
 */
