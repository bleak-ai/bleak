import React, {useState} from "react";
import {BleakSession, type InteractiveQuestion} from "bleakai";
import {ChatDisplay} from "./ChatDisplay";
import {BLEAK_ELEMENT_CONFIG} from "../../../config/bleakConfig";
import {ChatInput} from "./ChatInput";

interface ChatProps {
  onConversationStart?: () => void;
  isWelcomeMode?: boolean;
  initialApiKey?: string | null;
  prefilledPrompt?: string;
}

export const Chat = ({
  onConversationStart,
  isWelcomeMode = false,
  initialApiKey = null,
  prefilledPrompt = ""
}: ChatProps) => {
  const [bleak] = useState(
    () =>
      new BleakSession({
        baseUrl:
          import.meta.env.VITE_BLEAK_API_URL || "http://localhost:8008/bleak",
        apiKey: initialApiKey || "your-api-key",
        elements: BLEAK_ELEMENT_CONFIG
      })
  );

  const [questions, setQuestions] = useState<InteractiveQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalAnswer, setFinalAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(initialApiKey);

  const handleStart = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    onConversationStart?.();

    try {
      const result = await bleak.startBleakConversation(prompt);

      if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions);
      } else if (result.answer) {
        setFinalAnswer(result.answer);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAnswer = async () => {
    setIsLoading(true);
    try {
      const result = await bleak.finishBleakConversation(answers);
      setFinalAnswer(result);
      setQuestions([]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoreQuestions = async () => {
    setIsLoading(true);
    try {
      const result = await bleak.requestMoreBleakQuestions(answers);

      if (result.questions) {
        setQuestions(result.questions);
      } else if (result.isComplete) {
        const finalResult = await bleak.finishBleakConversation(answers);
        setFinalAnswer(finalResult);
        setQuestions([]);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers((prev) => ({...prev, [question]: value}));
  };

  const handleReset = () => {
    setQuestions([]);
    setAnswers({});
    setFinalAnswer("");
    setError(null);
    bleak.resetBleakSession();
  };

  const handleApiKeyChange = (key: string | null) => {
    setApiKey(key);
  };

  const renderQuestions = (
    questions: InteractiveQuestion[],
    answers: Record<string, string>,
    onAnswerChange: (question: string, value: string) => void
  ) => {
    return bleak
      .getBleakComponents(questions, answers, onAnswerChange)
      .map(({Component, props, key}) => <Component key={key} {...props} />);
  };

  // Show input when welcome mode or no conversation yet
  if (isWelcomeMode || (!questions.length && !finalAnswer)) {
    return (
      <ChatInput
        onSubmit={handleStart}
        isLoading={isLoading}
        prefilledPrompt={prefilledPrompt}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
        error={error}
      />
    );
  }

  // Show conversation
  return (
    <ChatDisplay
      questions={questions}
      answers={answers}
      finalAnswer={finalAnswer}
      isLoading={isLoading}
      error={error}
      onAnswerChange={handleAnswerChange}
      onMoreQuestions={handleMoreQuestions}
      onGetAnswer={handleGetAnswer}
      onReset={handleReset}
      renderQuestions={renderQuestions}
    />
  );
};
