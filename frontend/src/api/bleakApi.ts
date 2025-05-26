// src/api/bleakApi.ts
import axios from "axios";
import {z} from "zod";

// API Base URL
const API_BASE_URL = "http://127.0.0.1:8000/local";

// Response Schemas
const QuestionsResponseSchema = z.object({
  structured_questions: z.array(
    z.discriminatedUnion("type", [
      z.object({
        question: z.string(),
        type: z.literal("radio"),
        options: z.array(z.string()).min(1)
      }),
      z.object({
        question: z.string(),
        type: z.literal("text")
      })
    ])
  )
});

const AnswerResponseSchema = z.object({
  answer: z.string()
});

// Types
export type PromptQuestion = z.infer<
  typeof QuestionsResponseSchema
>["structured_questions"][0];
export type QuestionsResponse = z.infer<typeof QuestionsResponseSchema>;
export type AnswerResponse = z.infer<typeof AnswerResponseSchema>;

export interface AnsweredQuestion {
  question: string;
  answer: string;
}

// API Functions
export const fetchQuestions = async (
  prompt: string
): Promise<PromptQuestion[]> => {
  console.log("Fetching questions for prompt:", prompt);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/bleak/questions`,
      {prompt},
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Questions response:", response.data);

    const parsed = QuestionsResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error("Invalid questions response:", parsed.error);
      throw new Error("Invalid questions response format");
    }

    return parsed.data.structured_questions;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw new Error("Failed to fetch questions");
  }
};

export const submitAnswers = async ({
  answeredQuestions,
  prompt
}: {
  answeredQuestions: AnsweredQuestion[];
  prompt: string;
}): Promise<string> => {
  console.log("Submitting answers:", answeredQuestions);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/bleak/answer`,
      {
        answered_questions: answeredQuestions,
        prompt: prompt
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Answer response:", response.data);

    const parsed = AnswerResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error("Invalid answer response:", parsed.error);
      throw new Error("Invalid answer response format");
    }

    return parsed.data.answer;
  } catch (error) {
    console.error("Error submitting answers:", error);
    throw new Error("Failed to submit answers");
  }
};
