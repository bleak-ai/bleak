// src/api/sendPrompt.ts
import axios from "axios";
import {z} from "zod";

// Define response schema
const AiResponseSchema = z.object({
  answer: z.string(),
  rating: z.number()
});

// Type from schema
export type AiResponse = z.infer<typeof AiResponseSchema>;

export const sendPrompt = async (prompt: string): Promise<AiResponse> => {
  const response = await axios.post("http://127.0.0.1:8000/local/postal", {
    prompt
  });

  console.log(response.data);

  // Validate response using Zod
  const parsed = AiResponseSchema.safeParse(response.data);
  if (!parsed.success) {
    console.error("Invalid response from AI backend:", parsed.error);
    throw new Error("Invalid AI response");
  }

  return parsed.data;
  // return {reply: "Hello, how can I help you today?"};
};
