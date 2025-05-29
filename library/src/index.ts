// Core functionality
export {BleakRenderer} from "./core/BleakRenderer";

// React components
export {DynamicQuestionRenderer} from "./components/DynamicQuestionRenderer";
export {
  BleakProvider,
  useBleakContext,
  ContextualDynamicQuestionRenderer
} from "./components/BleakProvider";

// React hooks
export {
  useBleakRenderer,
  useTemporaryRenderer
} from "./components/useBleakRenderer";

// Types
export type {
  BleakQuestion,
  QuestionComponentProps,
  ComponentRegistry,
  BleakRendererConfig,
  DynamicQuestionRendererProps,
  QuestionType,
  BleakElementType
} from "./types";

// Utilities
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
