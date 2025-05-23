// src/api/sendPrompt.ts
import axios from "axios";
import {z} from "zod";

// Define the backend response schema
const BackendResponseSchema = z.object({
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

// Legacy response schema (keeping for reference)
const AiResponseSchema = z.object({
  answer: z.string(),
  rating: z.number()
});

// Type from schema
export type AiResponse = z.infer<typeof AiResponseSchema>;

const PromptQuestionSchema = z.discriminatedUnion("type", [
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

export type PromptQuestion = z.infer<typeof PromptQuestionSchema>;

interface SendPromptArgs {
  prompt: string;
  answers?: Record<string, string>;
}

export const sendPrompt = async ({
  prompt,
  answers
}: SendPromptArgs): Promise<PromptQuestion[]> => {
  console.log("Sending to backend:", {prompt, answers});

  const response = await axios.post("http://127.0.0.1:8000/local/postal", {
    prompt,
    answers // Include answers if they exist
  });

  console.log("Backend response:", response.data);

  // Validate response using the new schema
  const parsed = BackendResponseSchema.safeParse(response.data);
  if (!parsed.success) {
    console.error("Invalid response from backend:", parsed.error);
    throw new Error("Invalid backend response format");
  }

  return parsed.data.structured_questions;
};
