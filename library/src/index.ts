// Core types
export type {
  BleakQuestion,
  QuestionComponentProps,
  BleakRendererConfig,
  DynamicQuestionRendererProps,
  ComponentRegistry,
  BleakElementType
} from "./types";

// Simple configuration (NEW - Simple approach for users)
export type {
  QuestionConfig,
  QuestionTypeFromConfig,
  ComponentRegistry as SimpleComponentRegistry,
  ElementDefinitions
} from "./utils/simple";

// Core classes
export {BleakRenderer} from "./core/BleakRenderer";

// React components
export {DynamicQuestionRenderer} from "./components/DynamicQuestionRenderer";
export {
  BleakProvider,
  ContextualDynamicQuestionRenderer,
  useBleakContext
} from "./components/BleakProvider";

// Component adaptation utilities
export {
  adaptComponent,
  createAdaptedRegistry,
  quickSetup
} from "./utils/componentAdapter";

// React hooks
export {
  useBleakRenderer,
  useTemporaryRenderer
} from "./components/useBleakRenderer";

// Utilities (legacy - for backward compatibility)
export {
  createDefaultConfig,
  createQuestionTypes,
  createTypeValidator,
  createElementDefinitions,
  createComponentRegistry,
  ComponentRegistryBuilder
} from "./utils";

// Version
export const version = "1.0.0";
