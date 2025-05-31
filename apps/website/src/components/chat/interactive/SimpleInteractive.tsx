import {useState, useEffect} from "react";
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
  onConversationStart?: () => void;
  isWelcomeMode?: boolean;
  initialApiKey?: string | null;
  prefilledPrompt?: string;
}

export const SimpleInteractive = ({
  customConfig,
  onConversationStart,
  isWelcomeMode = false,
  initialApiKey = null,
  prefilledPrompt = ""
}: SimpleInteractiveProps) => {
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
  const [apiKey, setApiKey] = useState<string | null>(initialApiKey);

  // Update API key when initialApiKey changes
  useEffect(() => {
    if (initialApiKey && initialApiKey !== apiKey) {
      setApiKey(initialApiKey);
    }
  }, [initialApiKey, apiKey]);

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
    mutationFn: (prompt: string) => {
      console.log("🚀 Starting session with prompt:", prompt);
      console.log("🔧 Custom elements:", getCustomBleakElements());
      console.log("🔑 API key present:", !!apiKey);

      return startInteractiveSession(
        prompt,
        getCustomBleakElements(),
        apiKey || undefined
      );
    },
    onSuccess: (data) => {
      console.log("✅ Session started successfully:", data);
      setThreadId(data.thread_id);

      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnswers({});
        setPreviousAnswers([]);
        setNoMoreQuestionsAvailable(false);
        setNoMoreQuestionsMessage("");
        setFinalAnswer(null); // Clear any previous final answer
      } else if (data.answer) {
        setFinalAnswer(data.answer);
        setQuestions([]); // Clear questions when we have final answer
      } else {
        console.warn("⚠️ No questions or answer in response:", data);
      }

      // Notify parent that conversation has started
      if (onConversationStart) {
        onConversationStart();
      }
    },
    onError: (error) => {
      console.error("❌ Session start error:", error);
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
      console.log("✅ Choice response:", data);

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
    },
    onError: (error) => {
      console.error("❌ Choice error:", error);
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
    // Clear previous state before starting new session
    setQuestions([]);
    setAnswers({});
    setFinalAnswer(null);
    setThreadId(null);
    setAllAnsweredQuestions([]);
    setPreviousAnswers([]);
    setNoMoreQuestionsAvailable(false);
    setNoMoreQuestionsMessage("");

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

  // Different layouts for welcome mode vs conversation mode
  if (isWelcomeMode) {
    return (
      <div className="space-y-6">
        {/* API Key Input - only shown if there's an error and no API key from parent */}
        {apiKeyError && !apiKey && (
          <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
            <ApiKeyInput
              onApiKeyChange={setApiKey}
              required={false}
              error={apiKeyError}
            />
          </div>
        )}

        {/* Prompt Form for welcome screen */}
        <PromptForm
          onSubmit={handlePromptSubmit}
          isLoading={isLoading}
          prefilledPrompt={prefilledPrompt}
        />

        {/* Non-API Key Errors */}
        {nonApiKeyError && <ErrorDisplay error={nonApiKeyError} />}
      </div>
    );
  }

  // Conversation mode - ChatGPT style
  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Conversation History */}
      <div className="flex-1 p-6 space-y-8 overflow-y-auto max-w-4xl mx-auto w-full">
        {/* API Key Input - only if no API key */}
        {!apiKey && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
            <ApiKeyInput
              onApiKeyChange={setApiKey}
              required={false}
              error={apiKeyError}
            />
          </div>
        )}

        {/* Debug info - remove this in production */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-xs">
            <strong>Debug Info:</strong>
            <br />
            Questions: {questions.length}
            <br />
            Thread ID: {threadId || "None"}
            <br />
            Loading: {isLoading ? "Yes" : "No"}
            <br />
            Final Answer: {finalAnswer ? "Yes" : "No"}
            <br />
            Error: {error?.message || "None"}
          </div>
        )}

        {/* Questions */}
        {questions.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4">
              Questions ({questions.length})
            </h3>
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
          </div>
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

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-neutral-600">
              <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin"></div>
              Processing your request...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
