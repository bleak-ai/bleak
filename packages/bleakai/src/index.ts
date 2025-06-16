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

// === Main Class ===
export {BleakSession} from "./chat/BleakSession";

// === Configuration ===
export type {BleakSessionConfig} from "./chat/BleakSession";

// === Essential Types ===
export type {
  AnsweredQuestion,
  BleakQuestion,
  TaskSpecification,
  ChatResponse,
  ChatRequest,
  StartChatRequest,
  ContinueChatRequest,
  CompleteChatRequest,
  BleakElement,
  // Component Props
  BleakComponentProps,
  BleakChoiceProps
} from "./chat/types";

/**
 * Quick Start:
 *
 * ```typescript
 * import {BleakSession, BleakComponentProps, BleakChoiceProps} from "bleakai";
 *
 * // Your components (using the new clear prop names)
 * const TextInput: React.FC<BleakComponentProps> = ({text, value, onChange}) => (
 *   <input value={value} onChange={e => onChange(e.target.value)} />
 * );
 *
 * const RadioGroup: React.FC<BleakChoiceProps> = ({text, options, value, onChange}) => (
 *   <div>
 *     {options.map(option => (
 *       <label key={option}>
 *         <input type="radio" checked={value === option} onChange={() => onChange(option)} />
 *         {option}
 *       </label>
 *     ))}
 *   </div>
 * );
 *
 * const bleak = new BleakSession({
 *   apiKey: "your-key",
 *   baseUrl: "http://localhost:8008/bleak",
 *   elements: {
 *     text: {
 *       component: TextInput,
 *       description: "For text input"
 *     },
 *     radio: {
 *       component: RadioGroup,
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
