import React from "react";
import {RadioQuestion} from "./RadioQuestion";
import {SliderQuestion} from "./SliderQuestion";
import {MultiSelectQuestion} from "./MultiSelectQuestion";
import type {InteractiveQuestion} from "../../api/interactiveApi";
import {
  logComponentRender,
  logComponentFallback,
  logComponentRegistry
} from "../../utils/logger";
import {TextQuestion} from "./TextQuestion";
import {QUESTION_TYPES} from "../../types/questionTypes";

interface DynamicQuestionRendererProps {
  question: InteractiveQuestion;
  value: string;
  onChange: (value: string) => void;
  questionIndex: number;
}

// Component registry for available UI elements only
// Using 'any' here because different components have different prop requirements
// (some require options, others make them optional)
const ComponentRegistry: Record<string, React.ComponentType<any>> = {
  [QUESTION_TYPES.RADIO]: RadioQuestion,
  [QUESTION_TYPES.TEXT]: TextQuestion,
  [QUESTION_TYPES.MULTISELECT]: MultiSelectQuestion,
  [QUESTION_TYPES.SLIDER]: SliderQuestion
};

// Log the component registry on module load (only in development)
if (process.env.NODE_ENV === "development") {
  logComponentRegistry(ComponentRegistry);
}

// Function to determine if a question should have options based on component type
const shouldHaveOptions = (type: string): boolean => {
  const optionBasedTypes = [
    QUESTION_TYPES.RADIO,
    QUESTION_TYPES.MULTISELECT,
    QUESTION_TYPES.SLIDER
  ];
  return optionBasedTypes.includes(type.toLowerCase() as any);
};

export const DynamicQuestionRenderer: React.FC<
  DynamicQuestionRendererProps
> = ({question, value, onChange, questionIndex}) => {
  const {type, options} = question;
  const normalizedType = type.toLowerCase();

  // Get the component for this type, fallback to RadioQuestion for unsupported types
  const Component = ComponentRegistry[normalizedType];
  const componentName = Component?.name || "Unknown";

  console.log("Component", Component);
  if (Component) {
    logComponentRender(type, componentName, questionIndex);
  } else {
    logComponentFallback(type, "RadioQuestion", "Type not found in registry");
  }

  const FinalComponent = Component || RadioQuestion;

  // Determine if this component expects options
  const expectsOptions = shouldHaveOptions(type);

  // For components that expect options but don't have them, provide defaults
  const finalOptions = expectsOptions && !options ? ["Yes", "No"] : options;

  // Special handling for different component types
  const componentProps = {
    question: question.question,
    value,
    onChange,
    questionIndex,
    ...(finalOptions && {options: finalOptions})
  };

  return <FinalComponent {...componentProps} />;
};

// Export a function to register new component types dynamically
export const registerComponent = (
  type: string,
  component: React.ComponentType<any>
) => {
  ComponentRegistry[type.toLowerCase()] = component;

  // Log the registration in development
  if (process.env.NODE_ENV === "development") {
    console.log(
      `🎨 Registered new component: ${type} → ${component.name || "Anonymous"}`
    );
  }
};

// Export function to check if a type is supported
export const isSupportedType = (type: string): boolean => {
  return type.toLowerCase() in ComponentRegistry;
};

// Export function to get all supported types
export const getSupportedTypes = (): string[] => {
  return Object.keys(ComponentRegistry);
};
