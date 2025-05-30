import {useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {
  startInteractiveSession,
  makeInteractiveChoice,
  type InteractiveResponse,
  type AnsweredQuestion,
  type InteractiveQuestion
} from "../../../api/interactiveApi";
import {PromptForm} from "../utils/PromptForm";
import {QuestionsSection} from "../questions/QuestionsSection";
import {AnswerSection} from "../utils/AnswerSection";
import {ErrorDisplay} from "../utils/ErrorDisplay";
import {ApiKeyInput} from "../../ApiKeyInput";
import type {CustomBleakElementConfig} from "../config/BleakConfigEditor";

interface SimpleInteractiveProps {
  customConfig?: CustomBleakElementConfig | null;
}

export const SimpleInteractive = ({customConfig}: SimpleInteractiveProps) => {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InteractiveQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [allAnsweredQuestions, setAllAnsweredQuestions] = useState<
    AnsweredQuestion[]
  >([]);
  const [previousAnswers, setPreviousAnswers] = useState<AnsweredQuestion[]>(
    []
  );
  const [noMoreQuestionsAvailable, setNoMoreQuestionsAvailable] =
    useState(false);
  const [noMoreQuestionsMessage, setNoMoreQuestionsMessage] =
    useState<string>("");
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Convert custom config to API format
  const getCustomBleakElements = () => {
    if (!customConfig) return undefined;

    return Object.entries(customConfig)
      .filter(([_, config]) => config.enabled)
      .map(([name, config]) => ({
        name,
        description: config.description
      }));
  };

  // Helper function to check if error is API key related
  const isApiKeyError = (error: Error): boolean => {
    const message = error.message.toLowerCase();
    return (
      message.includes("api key") ||
      message.includes("unauthorized") ||
      message.includes("authentication") ||
      message.includes("invalid api key") ||
      message.includes("openai api key is required")
    );
  };

  // Get API key error message for display
  const getApiKeyErrorMessage = (error: Error): string | null => {
    if (!isApiKeyError(error)) return null;

    const message = error.message;

    // Clean up common error patterns
    if (message.includes("OpenAI API key is required")) {
      return "Please enter your OpenAI API key to continue.";
    }
    if (message.includes("invalid api key")) {
      return "Invalid API key format. Please check your key and try again.";
    }
    if (message.includes("unauthorized")) {
      return "API key is invalid or has expired. Please check your OpenAI account.";
    }

    return "API key is required to use Bleak.";
  };

  // Start session mutation
  const startMutation = useMutation<InteractiveResponse, Error, string>({
    mutationFn: (prompt: string) =>
      startInteractiveSession(
        prompt,
        getCustomBleakElements(),
        apiKey || undefined
      ),
    onSuccess: (data) => {
      setThreadId(data.thread_id);
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnswers({});
        setPreviousAnswers([]);
        setNoMoreQuestionsAvailable(false);
        setNoMoreQuestionsMessage("");
      } else if (data.answer) {
        setFinalAnswer(data.answer);
      }
    }
  });

  // Choice mutation
  const choiceMutation = useMutation<
    InteractiveResponse,
    Error,
    {
      threadId: string;
      answeredQuestions: AnsweredQuestion[];
      choice: "more_questions" | "final_answer";
    }
  >({
    mutationFn: ({threadId, answeredQuestions, choice}) =>
      makeInteractiveChoice(
        threadId,
        answeredQuestions,
        choice,
        apiKey || undefined
      ),
    onSuccess: (data) => {
      if (data.status === "completed" && data.answer) {
        // Final answer received
        setFinalAnswer(data.answer);
        setQuestions([]);
        setAllAnsweredQuestions((prev) => [
          ...prev,
          ...getCurrentAnsweredQuestions()
        ]);
        setNoMoreQuestionsAvailable(false);
        setNoMoreQuestionsMessage("");
      } else if (data.status === "no_more_questions") {
        // No more questions available, show message and only final answer option
        setNoMoreQuestionsAvailable(true);
        setNoMoreQuestionsMessage(
          data.message ||
            "I have enough information to provide a comprehensive answer."
        );
      } else if (data.questions && data.questions.length > 0) {
        // More questions received
        const currentAnswered = getCurrentAnsweredQuestions();
        setPreviousAnswers((prev) => [...prev, ...currentAnswered]);
        setAllAnsweredQuestions((prev) => [...prev, ...currentAnswered]);
        setQuestions(data.questions);
        setAnswers({});
        setNoMoreQuestionsAvailable(false);
        setNoMoreQuestionsMessage("");
      }
    }
  });

  const isLoading = startMutation.isPending || choiceMutation.isPending;
  const error = startMutation.error || choiceMutation.error;
  const apiKeyError = error ? getApiKeyErrorMessage(error) : null;
  const nonApiKeyError = error && !isApiKeyError(error) ? error : null;

  const getCurrentAnsweredQuestions = (): AnsweredQuestion[] => {
    return questions
      .map((q) => {
        const answer = answers[q.question];
        if (answer && answer.trim()) {
          return {question: q.question, answer: answer.trim()};
        }
        return null;
      })
      .filter((item): item is AnsweredQuestion => item !== null);
  };

  const handlePromptSubmit = (prompt: string) => {
    startMutation.mutate(prompt);
  };

  const handleChoice = (choice: "more_questions" | "final_answer") => {
    if (!threadId || isLoading) return;

    const answeredQuestions = getCurrentAnsweredQuestions();
    if (answeredQuestions.length > 0) {
      choiceMutation.mutate({threadId, answeredQuestions, choice});
    }
  };

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers((prev) => ({...prev, [question]: value}));
  };

  const reset = () => {
    setThreadId(null);
    setQuestions([]);
    setAnswers({});
    setFinalAnswer(null);
    setAllAnsweredQuestions([]);
    setPreviousAnswers([]);
    setNoMoreQuestionsAvailable(false);
    setNoMoreQuestionsMessage("");
  };

  const allQuestionsAnswered = questions.every((q) =>
    answers[q.question]?.trim()
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* API Key Input */}
      <ApiKeyInput
        onApiKeyChange={setApiKey}
        required={false}
        error={apiKeyError}
      />

      {/* Initial Prompt */}
      {!threadId && (
        <PromptForm onSubmit={handlePromptSubmit} isLoading={isLoading} />
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <QuestionsSection
          questions={questions}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          onChoice={handleChoice}
          isLoading={isLoading}
          allQuestionsAnswered={allQuestionsAnswered}
          previousAnswers={previousAnswers}
          noMoreQuestionsAvailable={noMoreQuestionsAvailable}
          noMoreQuestionsMessage={noMoreQuestionsMessage}
          customConfig={customConfig}
        />
      )}

      {/* Final Answer */}
      {finalAnswer && (
        <AnswerSection
          answer={finalAnswer}
          answeredQuestions={allAnsweredQuestions}
          onReset={reset}
        />
      )}

      {/* Non-API Key Errors */}
      {nonApiKeyError && <ErrorDisplay error={nonApiKeyError} />}
    </div>
  );
};
