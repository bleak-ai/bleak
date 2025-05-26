import axios from "axios";
import {z} from "zod";

// API Base URL
const API_BASE_URL = "http://0.0.0.0:8008";

// Response Schemas
const InteractiveQuestionSchema = z.discriminatedUnion("type", [
  z.object({
    question: z.string(),
    type: z.literal("radio"),
    options: z.array(z.string()).min(1)
  }),
  z.object({
    question: z.string(),
    type: z.literal("text")
  })
]);

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
    .optional()
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
  rating?: number;
  answered_questions?: AnsweredQuestion[];
}

export interface InitialRequest {
  prompt: string;
  thread_id: null;
}

export interface ResumeRequest {
  thread_id: string;
  answered_questions: AnsweredQuestion[];
}

// API Functions
export const startInteractiveSession = async (
  prompt: string
): Promise<InteractiveResponse> => {
  console.log("Starting interactive session with prompt:", prompt);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/bleak/interactive`,
      {
        prompt,
        thread_id: null
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Interactive session response:", response.data);

    const parsed = InteractiveResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error("Invalid interactive response:", parsed.error);
      throw new Error("Invalid interactive response format");
    }

    return parsed.data;
  } catch (error) {
    console.error("Error starting interactive session:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to start interactive session: ${
          error.response?.data?.detail || error.message
        }`
      );
    }
    throw new Error("Failed to start interactive session");
  }
};

export const resumeInteractiveSession = async (
  threadId: string,
  answeredQuestions: AnsweredQuestion[]
): Promise<InteractiveResponse> => {
  console.log("Resuming interactive session:", {threadId, answeredQuestions});

  try {
    const response = await axios.post(
      `${API_BASE_URL}/bleak/interactive/resume`,
      {
        thread_id: threadId,
        answered_questions: answeredQuestions
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Resume session response:", response.data);

    const parsed = InteractiveResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error("Invalid resume response:", parsed.error);
      throw new Error("Invalid resume response format");
    }

    return parsed.data;
  } catch (error) {
    console.error("Error resuming interactive session:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to resume interactive session: ${
          error.response?.data?.detail || error.message
        }`
      );
    }
    throw new Error("Failed to resume interactive session");
  }
};
