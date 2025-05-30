/**
 * @bleakai/core - Framework-Agnostic Question Component Resolver
 *
 * A library that handles the logic of determining which component to use for dynamic questions.
 * No rendering, no framework dependencies - just pure component resolution logic.
 */

export const VERSION = "2.0.0";
export const FRAMEWORK_AGNOSTIC = true;

// Main exports - resolver functions and classes
export {
  QuestionResolver,
  createResolver,
  createResolverFromConfig,
  resolveQuestion,
  resolveQuestions
} from "./core/QuestionResolver";

// Type exports - all the types users need
export type {
  Question,
  QuestionProps,
  ComponentResolution,
  ComponentRegistry,
  ResolverOptions,
  QuestionConfig,
  QuestionTypeConfig,
  QuestionType,
  ComponentType
} from "./types/core";
