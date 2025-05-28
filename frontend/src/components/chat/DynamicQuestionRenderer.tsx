import React from "react";
import {RadioQuestion} from "./RadioQuestion";
import {TextQuestion} from "./TextQuestion";
import {SliderQuestion} from "./SliderQuestion";
import {MultiSelectQuestion} from "./MultiSelectQuestion";
import type {InteractiveQuestion} from "../../api/interactiveApi";

interface DynamicQuestionRendererProps {
  question: InteractiveQuestion;
  value: string;
  onChange: (value: string) => void;
  questionIndex: number;
}

// Component registry for dynamic UI elements
const ComponentRegistry: Record<string, React.ComponentType<any>> = {
  // Legacy types (for backward compatibility)
  radio: RadioQuestion,
  text: TextQuestion,

  // New dynamic types
  input: RadioQuestion, // Map to radio for choice-based input
  malo: TextQuestion, // Map to text for open-ended input
  slider: SliderQuestion,
  multiselect: MultiSelectQuestion,

  // Fallback mappings for common types
  select: RadioQuestion,
  dropdown: RadioQuestion,
  checkbox: MultiSelectQuestion,
  range: SliderQuestion,
  scale: SliderQuestion,
  rating: SliderQuestion,
  textarea: TextQuestion,
  textinput: TextQuestion
};

// Function to determine if a question should have options based on component type
const shouldHaveOptions = (type: string): boolean => {
  const optionBasedTypes = [
    "radio",
    "select",
    "dropdown",
    "input",
    "multiselect",
    "checkbox",
    "slider",
    "range",
    "scale",
    "rating"
  ];
  return optionBasedTypes.includes(type.toLowerCase());
};

export const DynamicQuestionRenderer: React.FC<
  DynamicQuestionRendererProps
> = ({question, value, onChange, questionIndex}) => {
  const {type, options} = question;

  // Get the component for this type, fallback to TextQuestion
  const Component = ComponentRegistry[type.toLowerCase()] || TextQuestion;

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

  return <Component {...componentProps} />;
};

// Export a function to register new component types dynamically
export const registerComponent = (
  type: string,
  component: React.ComponentType<any>
) => {
  ComponentRegistry[type.toLowerCase()] = component;
};

// Export function to check if a type is supported
export const isSupportedType = (type: string): boolean => {
  return type.toLowerCase() in ComponentRegistry;
};

// Export function to get all supported types
export const getSupportedTypes = (): string[] => {
  return Object.keys(ComponentRegistry);
};
