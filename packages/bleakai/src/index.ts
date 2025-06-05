/**
 * bleakai - Simple AI Conversation Library
 */

// Main Bleak class for AI conversations (legacy API)
export {Bleak} from "./chat/Bleak";

// New improved session-based API
export {BleakSession} from "./chat/BleakSession";
export type {BleakSessionConfig, SessionState} from "./chat/BleakSession";

// Default components that work out of the box
export {BleakText, BleakRadio, DEFAULT_BLEAK_ELEMENTS} from "./components";
export type {BleakComponentProps} from "./components";

// Essential types for using Bleak
export type {BleakConfig, BleakAskOptions} from "./chat/Bleak";

// Types needed for element configuration
export type {BleakElementConfig} from "./types/core";

// Types needed for conversation handling
export type {AnsweredQuestion, InteractiveQuestion} from "./chat/types";

// Error classes for error handling
export {ChatError, RateLimitError, AuthenticationError} from "./chat/Bleak";
