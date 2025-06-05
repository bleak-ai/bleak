import React, {useState} from "react";
import {
  BleakSession,
  type InteractiveQuestion,
  type BleakElementConfig
} from "bleakai";
import {ChatWelcome} from "./ConversationWelcome";
import {BLEAK_ELEMENT_CONFIG} from "../../../config/bleakConfig";

interface ChatContainerProps {
  customConfig?: BleakElementConfig | null;
  onConversationStart?: () => void;
  isWelcomeMode?: boolean;
  initialApiKey?: string | null;
  prefilledPrompt?: string;
}

export const ChatContainer = ({
  customConfig,
  onConversationStart,
  isWelcomeMode = false,
  initialApiKey = null,
  prefilledPrompt = ""
}: ChatContainerProps) => {
  const [bleak] = useState(
    () =>
      new BleakSession({
        baseUrl:
          import.meta.env.VITE_BLEAK_API_URL || "http://localhost:8008/bleak",
        apiKey: initialApiKey || "your-api-key",
        elements: customConfig || BLEAK_ELEMENT_CONFIG
      })
  );

  const [questions, setQuestions] = useState<InteractiveQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(initialApiKey);

  const handleStartConversation = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    onConversationStart?.();

    try {
      const result = await bleak.startBleakConversation(prompt);

      if (result.needsInput && result.questions) {
        setQuestions(result.questions);
      } else if (result.answer) {
        setAnswer(result.answer);
      }

      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  };

  const handleSubmitAnswers = async () => {
    setIsLoading(true);
    try {
      const result = await bleak.finishBleakConversation(answers);
      setAnswer(result);
      setQuestions([]);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  };

  const handleRequestMoreQuestions = async () => {
    setIsLoading(true);
    try {
      const result = await bleak.requestMoreBleakQuestions(answers);

      if (result.questions) {
        setQuestions(result.questions);
      } else if (result.isComplete) {
        const finalResult = await bleak.finishBleakConversation(answers);
        setAnswer(finalResult);
        setQuestions([]);
      }

      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers((prev) => ({...prev, [question]: value}));
  };

  const reset = () => {
    setQuestions([]);
    setAnswers({});
    setAnswer("");
    setError(null);
    bleak.resetBleakSession();
  };

  const handleApiKeyChange = (key: string | null) => {
    setApiKey(key);
    // Note: BleakSession doesn't have updateApiKey method, would need to recreate session
  };

  const allQuestionsAnswered = questions.every((q) =>
    answers[q.question]?.trim()
  );

  // Show welcome screen
  if (isWelcomeMode || (!questions.length && !answer)) {
    return (
      <ChatWelcome
        onPromptSubmit={handleStartConversation}
        isLoading={isLoading}
        prefilledPrompt={prefilledPrompt}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
        error={error}
      />
    );
  }

  // Show questions
  if (questions.length > 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-medium">Help me understand better</h2>
          <p className="text-gray-600">
            Please answer these questions to get a more personalized response
          </p>
        </div>

        <div className="space-y-4">
          {bleak
            .getBleakComponents(questions, answers, handleAnswerChange)
            .map(({Component, props, key}) => (
              <Component key={key} {...props} />
            ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRequestMoreQuestions}
            disabled={!allQuestionsAnswered || isLoading}
            className="flex-1 px-4 py-2 border rounded disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "I need to provide more details"}
          </button>
          <button
            onClick={handleSubmitAnswers}
            disabled={!allQuestionsAnswered || isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Get My Answer"}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error.message}
          </div>
        )}
      </div>
    );
  }

  // Show answer
  if (answer) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-medium">Here's your answer</h2>
        <div className="p-4 bg-gray-800 text-white rounded">
          {answer.split("\n").map((line, i) => (
            <p key={i} className="mb-2 last:mb-0">
              {line}
            </p>
          ))}
        </div>
        <button onClick={reset} className="px-4 py-2 border rounded">
          Ask Another Question
        </button>
      </div>
    );
  }

  return null;
};
