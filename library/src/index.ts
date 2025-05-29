// Core types
export type {
  BleakQuestion,
  QuestionComponentProps,
  BleakRendererConfig,
  DynamicQuestionRendererProps,
  ComponentRegistry,
  BleakElementType
} from "./types";

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
