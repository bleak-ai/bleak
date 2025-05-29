// Core types
export type {
  BleakQuestion,
  QuestionComponentProps,
  BleakRendererConfig,
  DynamicQuestionRendererProps,
  ComponentRegistry,
  BleakElementType
} from "./types";

// Core functionality
export {BleakRenderer} from "./core/BleakRenderer";

// React components
export {DynamicQuestionRenderer} from "./components/DynamicQuestionRenderer";

// Hooks
export {useBleakRenderer} from "./components/useBleakRenderer";

// Utilities
export {createDefaultConfig, createComponentRegistry} from "./utils";

// Simple configuration (NEW - Simple approach for users)
export type {
  QuestionConfig,
  QuestionTypeFromConfig,
  ComponentRegistry as SimpleComponentRegistry,
  ElementDefinitions
} from "./utils/simple";

// Component adaptation utilities
export {createAdaptedRegistry, quickSetup} from "./utils/componentAdapter";

// React hooks
export {useTemporaryRenderer} from "./components/useBleakRenderer";

// Utilities (legacy - for backward compatibility)
export {
  createQuestionTypes,
  createTypeValidator,
  createElementDefinitions,
  ComponentRegistryBuilder
} from "./utils";

// Version
export const version = "1.0.0";
