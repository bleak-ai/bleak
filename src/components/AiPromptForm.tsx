// src/components/AiPromptForm.tsx
import {useMutation} from "@tanstack/react-query";
import {sendPrompt, type PromptQuestion} from "../api/sendPrompt";
import {useState, type FormEvent} from "react";
import {Textarea} from "./ui/textarea";
import {Button} from "./ui/button";
import SelectOptions from "./SelectOptions";
import {Loader, Loader2} from "lucide-react";

interface SendPromptVariables {
  prompt: string;
  answers?: Record<string, string>;
}

export const AiPromptForm = () => {
  const [currentText, setCurrentText] = useState("");
  // Stores the questions returned by the API
  const [questions, setQuestions] = useState<PromptQuestion[] | null>(null);
  // Stores the original prompt that led to the current questions
  const [promptThatLedToQuestions, setPromptThatLedToQuestions] = useState<
    string | null
  >(null);
  // Stores the final answer from the AI if no more questions are asked
  const [finalAiResponse, setFinalAiResponse] = useState<string | null>(null);

  const {
    mutate: send,
    isPending,
    isError,
    error
  } = useMutation<PromptQuestion[], Error, SendPromptVariables>({
    mutationFn: sendPrompt,
    onSuccess: (data, variables) => {
      if (data && data.length > 0) {
        setQuestions(data);
        setPromptThatLedToQuestions(variables.prompt);
        setCurrentText("");
        setFinalAiResponse(null);
      } else {
        setFinalAiResponse(
          variables.answers
            ? "Thank you for your answers! The process is complete."
            : "Prompt processed. No further questions."
        );
        setQuestions(null);
        setPromptThatLedToQuestions(null);
        setCurrentText("");
      }
    },
    onError: () => {
      setQuestions(null);
      setPromptThatLedToQuestions(null);
      setFinalAiResponse(null);
    }
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    if (questions && questions.length > 0 && promptThatLedToQuestions) {
      const answers: Record<string, string> = {};
      questions.forEach((q) => {
        const answer = formData.get(q.question);
        if (typeof answer === "string") {
          answers[q.question] = answer;
        } else if (q.type === "radio") {
          console.warn(`No answer provided for radio question: ${q.question}`);
        }
      });
      send({prompt: promptThatLedToQuestions, answers});
    } else if (currentText.trim() !== "") {
      setFinalAiResponse(null);
      send({prompt: currentText.trim()});
    }
  };

  const formTitle =
    questions && questions.length > 0
      ? "Refine with More Details"
      : "Ask the AI";
  const buttonText =
    questions && questions.length > 0 ? "Submit Answers" : "Send Prompt";
  const isTextareaDisabled = !!(questions && questions.length > 0);
  const isSubmitDisabled =
    isPending || (currentText.trim() === "" && !isTextareaDisabled);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-zinc-800 border border-zinc-700 rounded-2xl shadow-xl space-y-6">
      <h2 className="text-xl font-semibold text-zinc-100">{formTitle}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder={
            isTextareaDisabled
              ? "Answers will be submitted based on your selections below."
              : "Ask something..."
          }
          rows={4}
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          disabled={isTextareaDisabled}
          className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
        />

        {questions && questions.length > 0 && (
          <SelectOptions data={questions} />
        )}

        {isPending && (
          <div className="flex justify-center">
            <Loader className="w-8 h-8 animate-spin" />
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitDisabled}>
            {isPending ? "Sending..." : buttonText}
          </Button>
        </div>
      </form>

      {isError && (
        <div className="text-red-400 text-sm p-3 bg-red-900/30 border border-red-700 rounded-md">
          Error: {(error as Error)?.message || "An unknown error occurred."}
        </div>
      )}

      {finalAiResponse && (
        <div className="p-4 bg-green-800/30 border border-green-700 rounded-xl text-green-300 space-y-2">
          <p className="font-medium">Process Complete</p>
          <p>{finalAiResponse}</p>
        </div>
      )}
    </div>
  );
};
