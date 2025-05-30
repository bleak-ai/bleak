import {TextQuestion} from "../components/chat/questions/TextQuestion";
import {RadioQuestion} from "../components/chat/questions/RadioQuestion";
import {MultiSelectQuestion} from "../components/chat/questions/MultiSelectQuestion";
import {SliderQuestion} from "../components/chat/questions/SliderQuestion";
import type {QuestionConfig} from "@bleakai/core";

// This enforces the library's type structure - single source of truth
export const QUESTION_CONFIG = {
  text: {
    component: TextQuestion,
    description:
      "Use text for open-ended questions requiring free-form text input. Best for: names, descriptions, explanations, specific details, custom responses (e.g., 'What is your company name?', 'Describe your requirements', 'Any additional comments?'). Never provide options array."
  },
  radio: {
    component: RadioQuestion,
    description:
      "Use radio for single-choice questions with 2-5 predefined options. Best for: yes/no questions, multiple choice with exclusive selection, categorical choices (e.g., 'What is your experience level?', 'Which option do you prefer?', 'Are you satisfied?'). Always provide options array."
  },
  multi_select: {
    component: MultiSelectQuestion,
    description:
      "Use multiselect for questions where users can select multiple options from a list. Best for: skills selection, feature preferences, multiple interests, tags (e.g., 'Which programming languages do you know?', 'Select all that apply', 'What features do you need?'). Always provide options array with 3+ choices."
  },
  slider: {
    component: SliderQuestion,
    description:
      "Use slider for numeric input, ratings, scales, or range selections. Best for: satisfaction ratings (1-10), budget ranges, percentages, priority levels, quantities (e.g., 'Rate your satisfaction', 'What is your budget range?', 'How important is this feature?'). Provide options array with [min, max] values or scale labels."
  }
} satisfies QuestionConfig;

// For API: Use descriptions directly - derived from the config
export const BLEAK_ELEMENTS = [
  {name: "text", description: QUESTION_CONFIG.text.description},
  {name: "radio", description: QUESTION_CONFIG.radio.description},
  {name: "multi_select", description: QUESTION_CONFIG.multi_select.description},
  {name: "slider", description: QUESTION_CONFIG.slider.description}
];

// Question types array - derived from the config
export const QUESTION_TYPES = Object.keys(QUESTION_CONFIG) as Array<
  keyof typeof QUESTION_CONFIG
>;

// Type exports - derived from the config
export type QuestionType = keyof typeof QUESTION_CONFIG;
