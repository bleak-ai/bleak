import axios from "axios";
import {z} from "zod";
import {logApiCall, logSessionFlow} from "../utils/logger";
import {BLEAK_ELEMENT_TYPES, BLEAK_ELEMENTS} from "../config/bleakConfig";

// API Base URL
const API_BASE_URL = "http://0.0.0.0:8008";

// Dynamic question schema that can handle any type
const InteractiveQuestionSchema = z.object({
  question: z.string(),
  type: z.enum(BLEAK_ELEMENT_TYPES as [string, ...string[]]), // Fix enum conversion
  options: z.array(z.string()).nullish().optional() // Make it truly optional, not nullable
});

export type AvailableElements = z.infer<
  typeof InteractiveQuestionSchema.shape.type
>;

const InteractiveResponseSchema = z.object({
  thread_id: z.string(),
  status: z.string().optional(),
  questions: z.array(InteractiveQuestionSchema).optional(),
  answer: z.string().optional(),
  message: z.string().optional(),
  answered_questions: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string()
      })
    )
    .optional(),
  previous_answers: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string()
      })
    )
    .optional(),
  suggestion: z.string().optional(),
  total_questions_answered: z.number().optional(),
  reason: z.string().optional(),
  error: z.string().optional()
});

// Types
export interface AnsweredQuestion {
  question: string;
  answer: string;
}

export type InteractiveQuestion = z.infer<typeof InteractiveQuestionSchema>;

export interface InteractiveResponse {
  thread_id: string;
  status?: string;
  questions?: InteractiveQuestion[];
  answer?: string;
  message?: string;
  answered_questions?: AnsweredQuestion[];
  previous_answers?: AnsweredQuestion[];
  suggestion?: string;
  total_questions_answered?: number;
  reason?: string;
  error?: string;
}

export interface InitialRequest {
  prompt: string;
  thread_id: null;
  apiKey?: string;
}

export interface ResumeRequest {
  thread_id: string;
  answered_questions: AnsweredQuestion[];
  apiKey?: string;
}

export interface ChoiceRequest {
  thread_id: string;
  answered_questions: AnsweredQuestion[];
  choice: "more_questions" | "final_answer";
  apiKey?: string;
}

/**
 * Start a new interactive session with the given prompt.
 *
 * This function initiates a conversation and returns clarifying questions
 * along with a thread_id for maintaining conversation state.
 *
 * @param prompt - The user's initial question or request
 * @param customBleakElements - Optional custom configuration for bleak elements
 * @param apiKey - Optional OpenAI API key for the request
 * @returns Promise resolving to the interactive response with questions
 * @throws Error if the request fails or response format is invalid
 */
export const startInteractiveSession = async (
  prompt: string,
  customBleakElements?: Array<{name: string; description: string}>,
  apiKey?: string
): Promise<InteractiveResponse> => {
  const payload = {
    prompt,
    thread_id: null,
    bleak_elements: customBleakElements || BLEAK_ELEMENTS
  };

  logSessionFlow("Starting Interactive Session", {prompt});
  logApiCall("/bleak/interactive", payload);

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  // Add API key to headers if provided
  if (apiKey) {
    headers["X-OpenAI-API-Key"] = apiKey;
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/bleak/interactive`,
      payload,
      {
        headers,
        timeout: 30000 // 30 second timeout
      }
    );

    logApiCall("/bleak/interactive", payload, response.data);

    const parsed = InteractiveResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error("Invalid interactive response:", parsed.error);
      throw new Error("Invalid interactive response format");
    }

    logSessionFlow("Session Started Successfully", {
      thread_id: parsed.data.thread_id,
      questions_count: parsed.data.questions?.length || 0
    });

    return parsed.data;
  } catch (error) {
    console.error("Error starting interactive session:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(`Failed to start interactive session: ${errorMessage}`);
    }
    throw new Error("Failed to start interactive session");
  }
};

/**
 * Make a choice in an interactive session to either get more questions or proceed to final answer.
 *
 * This function handles the user's decision after answering initial questions:
 * - "more_questions": Request additional clarifying questions (up to 5 total)
 * - "final_answer": Proceed directly to answer generation
 *
 * @param threadId - The conversation thread identifier
 * @param answeredQuestions - All previously answered questions
 * @param choice - User's choice: "more_questions" or "final_answer"
 * @param apiKey - Optional OpenAI API key for the request
 * @returns Promise resolving to either more questions or the final answer
 * @throws Error if the request fails or response format is invalid
 */
export const makeInteractiveChoice = async (
  threadId: string,
  answeredQuestions: AnsweredQuestion[],
  choice: "more_questions" | "final_answer",
  apiKey?: string
): Promise<InteractiveResponse> => {
  const payload = {
    thread_id: threadId,
    answered_questions: answeredQuestions,
    choice: choice
  };

  logSessionFlow("Making Interactive Choice", {
    thread_id: threadId,
    choice,
    answered_questions_count: answeredQuestions.length
  });

  // Validate choice parameter
  if (!["more_questions", "final_answer"].includes(choice)) {
    throw new Error(
      "Invalid choice. Must be 'more_questions' or 'final_answer'"
    );
  }

  logApiCall("/bleak/interactive/choice", payload);

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  // Add API key to headers if provided
  if (apiKey) {
    headers["X-OpenAI-API-Key"] = apiKey;
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/bleak/interactive/choice`,
      payload,
      {
        headers,
        timeout: choice === "final_answer" ? 60000 : 30000 // Longer timeout for final answer
      }
    );

    logApiCall("/bleak/interactive/choice", payload, response.data);

    const parsed = InteractiveResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error("Invalid choice response:", parsed.error);
      throw new Error("Invalid choice response format");
    }

    // Log additional information for debugging
    const result = parsed.data;
    if (result.status === "no_more_questions") {
      logSessionFlow("No More Questions Available", {
        reason: result.reason || "unknown",
        total_questions_answered: result.total_questions_answered
      });
    } else if (result.status === "interrupted" && result.questions) {
      logSessionFlow("Additional Questions Generated", {
        new_questions_count: result.questions.length
      });
    }

    return result;
  } catch (error) {
    console.error("Error making interactive choice:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(`Failed to make interactive choice: ${errorMessage}`);
    }
    throw new Error("Failed to make interactive choice");
  }
};

/**
 * Helper function to check if the maximum number of questions has been reached.
 *
 * @param answeredQuestions - List of answered questions
 * @returns True if 5 or more questions have been answered
 */
export const hasReachedMaxQuestions = (
  answeredQuestions: AnsweredQuestion[]
): boolean => {
  return answeredQuestions.length >= 5;
};

/**
 * Helper function to get a user-friendly message about question limits.
 *
 * @param answeredQuestions - List of answered questions
 * @returns Message about remaining questions or limit reached
 */
export const getQuestionLimitMessage = (
  answeredQuestions: AnsweredQuestion[]
): string => {
  const remaining = Math.max(0, 5 - answeredQuestions.length);

  if (remaining === 0) {
    return "Maximum of 5 questions reached. Ready to generate your answer!";
  } else if (remaining === 1) {
    return "You can ask 1 more clarifying question.";
  } else {
    return `You can ask up to ${remaining} more clarifying questions.`;
  }
};
