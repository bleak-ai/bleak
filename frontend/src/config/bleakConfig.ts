import {
  TextBleakElement,
  RadioBleakElement,
  MultiSelectBleakElement,
  SliderBleakElement
} from "../components/chat/elements";
import type {BleakElementConfig} from "@bleakai/core";

// This enforces the library's type structure - single source of truth
export const BLEAK_ELEMENT_CONFIG = {
  text: {
    component: TextBleakElement,
    description:
      "Use text for open-ended elements requiring free-form text input. Best for: names, descriptions, explanations, specific details, custom responses (e.g., 'What is your company name?', 'Describe your requirements', 'Any additional comments?'). Never provide options array."
  },
  radio: {
    component: RadioBleakElement,
    description:
      "Use radio for single-choice elements with 2-5 predefined options. Best for: yes/no elements, multiple choice with exclusive selection, categorical choices (e.g., 'What is your experience level?', 'Which option do you prefer?', 'Are you satisfied?'). Always provide options array."
  },
  multi_select: {
    component: MultiSelectBleakElement,
    description:
      "Use multiselect for elements where users can select multiple options from a list. Best for: skills selection, feature preferences, multiple interests, tags (e.g., 'Which programming languages do you know?', 'Select all that apply', 'What features do you need?'). Always provide options array with 3+ choices."
  },
  slider: {
    component: SliderBleakElement,
    description:
      "Use slider for numeric input, ratings, scales, or range selections. Best for: satisfaction ratings (1-10), budget ranges, percentages, priority levels, quantities (e.g., 'Rate your satisfaction', 'What is your budget range?', 'How important is this feature?'). Provide options array with [min, max] values or scale labels."
  }
} satisfies BleakElementConfig;

// For API: Use descriptions directly - derived from the config
export const BLEAK_ELEMENTS = [
  {name: "text", description: BLEAK_ELEMENT_CONFIG.text.description},
  {name: "radio", description: BLEAK_ELEMENT_CONFIG.radio.description},
  {
    name: "multi_select",
    description: BLEAK_ELEMENT_CONFIG.multi_select.description
  },
  {name: "slider", description: BLEAK_ELEMENT_CONFIG.slider.description}
];

// Element types array - derived from the config
export const BLEAK_ELEMENT_TYPES = Object.keys(BLEAK_ELEMENT_CONFIG) as Array<
  keyof typeof BLEAK_ELEMENT_CONFIG
>;

// Type exports - derived from the config
export type BleakElementType = keyof typeof BLEAK_ELEMENT_CONFIG;

// Legacy aliases for backwards compatibility
/** @deprecated Use BLEAK_ELEMENT_CONFIG instead */
export const QUESTION_CONFIG = BLEAK_ELEMENT_CONFIG;
/** @deprecated Use BLEAK_ELEMENT_TYPES instead */
export const QUESTION_TYPES = BLEAK_ELEMENT_TYPES;
/** @deprecated Use BleakElementType instead */
export type QuestionType = BleakElementType;
