// Centralized question type definitions
export const QUESTION_TYPES = {
  RADIO: "radio",
  TEXT: "text",
  MULTISELECT: "multiselect",
  SLIDER: "slider"
} as const;

// Type for the question types
export type QuestionType = (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES];

// Tuple of all available question types for use in zod schemas
export const AVAILABLE_QUESTION_TYPES = [
  "radio",
  "text",
  "multiselect",
  "slider"
] as const;

// Type guard to check if a string is a valid question type
export const isValidQuestionType = (type: string): type is QuestionType => {
  return AVAILABLE_QUESTION_TYPES.includes(type as QuestionType);
};

// Detailed element type definition for AI guidance
export type BleakElementType = {
  name: string; // Name of the elements
  description: string; // Description of the element, has to be accurate so the AI knows what it does
};

// Comprehensive element definitions with enhanced descriptions for better AI decision-making
export const BLEAK_ELEMENTS: BleakElementType[] = [
  {
    name: "radio",
    description:
      "Use radio for single-choice questions with 2-5 predefined options. Best for: yes/no questions, multiple choice with exclusive selection, categorical choices (e.g., 'What is your experience level?', 'Which option do you prefer?', 'Are you satisfied?'). Always provide options array."
  },
  {
    name: "text",
    description:
      "Use text for open-ended questions requiring free-form text input. Best for: names, descriptions, explanations, specific details, custom responses (e.g., 'What is your company name?', 'Describe your requirements', 'Any additional comments?'). Never provide options array."
  },
  {
    name: "multiselect",
    description:
      "Use multiselect for questions where users can select multiple options from a list. Best for: skills selection, feature preferences, multiple interests, tags (e.g., 'Which programming languages do you know?', 'Select all that apply', 'What features do you need?'). Always provide options array with 3+ choices."
  },
  {
    name: "slider",
    description:
      "Use slider for numeric input, ratings, scales, or range selections. Best for: satisfaction ratings (1-10), budget ranges, percentages, priority levels, quantities (e.g., 'Rate your satisfaction', 'What is your budget range?', 'How important is this feature?'). Provide options array with [min, max] values or scale labels."
  }
];
