import {ConversationWelcome} from "./ConversationWelcome";
import {ConversationView} from "./ConversationView";
import {useConversationState} from "./hooks/useConversationState";
import type {CustomBleakElementConfig} from "../config/BleakConfigEditor";

interface ConversationContainerProps {
  customConfig?: CustomBleakElementConfig | null;
  onConversationStart?: () => void;
  isWelcomeMode?: boolean;
  initialApiKey?: string | null;
  prefilledPrompt?: string;
}

export const ConversationContainer = ({
  customConfig,
  onConversationStart,
  isWelcomeMode = false,
  initialApiKey = null,
  prefilledPrompt = ""
}: ConversationContainerProps) => {
  const {
    // State
    questions,
    answers,
    finalAnswer,
    allAnsweredQuestions,
    previousAnswers,
    apiKey,
    setApiKey,
    isLoading,
    error,
    allQuestionsAnswered,

    // Actions
    handlePromptSubmit,
    handleChoice,
    handleAnswerChange,
    reset,

    // Helpers
    getChatErrorMessage
  } = useConversationState({
    initialApiKey,
    customConfig,
    onConversationStart
  });

  // Determine error categories for welcome screen
  const isApiKeyError = (error: Error): boolean => {
    const errorMessage = getChatErrorMessage(error);
    return (
      errorMessage.includes("API key") ||
      errorMessage.includes("authentication")
    );
  };

  const isOllamaConnectionError = (error: Error): boolean => {
    const errorMessage = getChatErrorMessage(error);
    return (
      errorMessage.includes("connection") || errorMessage.includes("Ollama")
    );
  };

  const nonApiKeyError =
    error && !isApiKeyError(error) && !isOllamaConnectionError(error)
      ? error
      : null;

  // Show welcome screen in welcome mode or if there's no active conversation
  if (isWelcomeMode || (!questions.length && !finalAnswer)) {
    return (
      <ConversationWelcome
        onPromptSubmit={handlePromptSubmit}
        isLoading={isLoading}
        prefilledPrompt={prefilledPrompt}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        error={error}
        getChatErrorMessage={getChatErrorMessage}
      />
    );
  }

  // Show conversation view when there's an active conversation
  return (
    <ConversationView
      questions={questions}
      answers={answers}
      finalAnswer={finalAnswer}
      allAnsweredQuestions={allAnsweredQuestions}
      previousAnswers={previousAnswers}
      isLoading={isLoading}
      allQuestionsAnswered={allQuestionsAnswered}
      customConfig={customConfig}
      error={nonApiKeyError}
      onAnswerChange={handleAnswerChange}
      onChoice={handleChoice}
      onReset={reset}
    />
  );
};
