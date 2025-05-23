// src/components/AiPromptForm.tsx
import {useMutation} from "@tanstack/react-query";
import {
  fetchQuestions,
  submitAnswers,
  type PromptQuestion,
  type AnsweredQuestion
} from "../api/postalApi";
import {useState, type FormEvent} from "react";
import {Textarea} from "./ui/textarea";
import {Button} from "./ui/button";
import SelectOptions from "./SelectOptions";
import {Loader} from "lucide-react";

export const AiPromptForm = () => {
  const [currentText, setCurrentText] = useState("");
  const [questions, setQuestions] = useState<PromptQuestion[] | null>(null);
  const [finalAiResponse, setFinalAiResponse] = useState<string | null>(null);

  // Mutation for fetching questions from initial prompt
  const fetchQuestionsMutation = useMutation<PromptQuestion[], Error, string>({
    mutationFn: fetchQuestions,
    onSuccess: (data) => {
      if (data && data.length > 0) {
        setQuestions(data);
        setCurrentText("");
        setFinalAiResponse(null);
      } else {
        // No questions returned, show completion message
        setFinalAiResponse(
          "Prompt processed successfully. No additional questions needed."
        );
        setQuestions(null);
        setCurrentText("");
      }
    },
    onError: () => {
      resetFormState();
    }
  });

  // Mutation for submitting answers and getting final response
  const submitAnswersMutation = useMutation<
    string,
    Error,
    {
      answeredQuestions: AnsweredQuestion[];
      prompt: string;
    }
  >({
    mutationFn: submitAnswers,
    onSuccess: (aiResponse) => {
      setFinalAiResponse(aiResponse);
      // setQuestions(null);
    },
    onError: () => {
      resetFormState();
    }
  });

  const resetFormState = () => {
    setQuestions(null);
    setFinalAiResponse(null);
    setCurrentText("");
  };

  const isLoading =
    fetchQuestionsMutation.isPending || submitAnswersMutation.isPending;
  const error = fetchQuestionsMutation.error || submitAnswersMutation.error;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    if (questions && questions.length > 0) {
      // We have questions to submit
      const answeredQuestions: AnsweredQuestion[] = questions
        .map((q) => {
          const answer = formData.get(q.question);
          if (typeof answer === "string" && answer.trim() !== "") {
            return {
              question: q.question,
              answer: answer.trim()
            };
          }
          return null;
        })
        .filter((item): item is AnsweredQuestion => item !== null);

      if (answeredQuestions.length > 0) {
        submitAnswersMutation.mutate({
          answeredQuestions,
          prompt: currentText.trim()
        });
      }
    } else if (currentText.trim() !== "") {
      // Initial prompt submission
      setFinalAiResponse(null);
      fetchQuestionsMutation.mutate(currentText.trim());
    }
  };

  const getFormTitle = (): string => {
    if (questions && questions.length > 0) {
      return "Please Answer the Following Questions";
    }
    return "Ask the AI";
  };

  const getButtonText = (): string => {
    if (isLoading) return "Processing...";
    if (questions && questions.length > 0) return "Submit Answers";
    return "Send Prompt";
  };

  const isTextareaDisabled = !!(questions && questions.length > 0);
  const isSubmitDisabled =
    isLoading || (currentText.trim() === "" && !isTextareaDisabled);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-zinc-800 border border-zinc-700 rounded-2xl shadow-xl space-y-6">
      <h2 className="text-xl font-semibold text-zinc-100">{getFormTitle()}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder={
            isTextareaDisabled
              ? "Please answer the questions below to continue."
              : "Enter your prompt here..."
          }
          rows={4}
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          disabled={isTextareaDisabled}
          className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
        />

        {questions && questions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-200">
              Answer these questions to get a personalized response:
            </h3>
            <SelectOptions data={questions} />
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center">
            <Loader className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitDisabled}>
            {getButtonText()}
          </Button>
        </div>
      </form>

      {error && (
        <div className="text-red-400 text-sm p-3 bg-red-900/30 border border-red-700 rounded-md">
          <p className="font-medium">Error occurred:</p>
          <p>{error.message || "An unknown error occurred."}</p>
        </div>
      )}

      {finalAiResponse && (
        <div className="p-4 bg-green-800/30 border border-green-700 rounded-xl text-green-300 space-y-2">
          <p className="font-medium">AI Response:</p>
          <p className="whitespace-pre-wrap">{finalAiResponse}</p>
          <Button
            onClick={resetFormState}
            variant="outline"
            size="sm"
            className="mt-3 text-green-300 border-green-600 hover:bg-green-800/20"
          >
            Ask Another Question
          </Button>
        </div>
      )}
    </div>
  );
};
