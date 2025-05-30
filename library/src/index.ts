/**
 * @bleakai/core - Framework-Agnostic Bleak Element Component Resolver
 *
 * A library that handles the logic of determining which component to use for dynamic bleak elements.
 * No rendering, no framework dependencies - just pure component resolution logic.
 */

export const VERSION = "2.0.0";
export const FRAMEWORK_AGNOSTIC = true;

// Main exports - resolver functions and classes
export {
  BleakResolver,
  createResolver,
  createResolverFromConfig,
  resolveElement,
  resolveElements,
  // Legacy aliases for backwards compatibility
  QuestionResolver,
  resolveQuestion,
  resolveQuestions
} from "./core/BleakResolver";

// Type exports - all the types users need
export type {
  BleakElement,
  BleakElementProps,
  ComponentResolution,
  ComponentRegistry,
  ResolverOptions,
  BleakElementConfig,
  BleakElementTypeConfig,
  BleakElementType,
  ComponentType,
  // Legacy aliases for backwards compatibility
  Question,
  QuestionProps,
  QuestionConfig,
  QuestionTypeConfig,
  QuestionType
} from "./types/core";
