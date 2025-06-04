/**
 * bleakai - Simple AI Conversation Library
 */

// Main Bleak class for AI conversations
export {Bleak} from "./chat/Bleak";

// Essential types for using Bleak
export type {BleakConfig, BleakAskOptions} from "./chat/Bleak";

// Types needed for element configuration
export type {BleakElementConfig} from "./types/core";

// Types needed for conversation handling
export type {AnsweredQuestion, InteractiveQuestion} from "./chat/types";

// Error classes for error handling
export {ChatError, RateLimitError, AuthenticationError} from "./chat/Bleak";
