import React, {useState, useMemo} from "react";
import {
  BleakSession,
  type InteractiveQuestion,
  type BleakInputProps,
  type BleakChoiceProps,
  type BleakElementConfig
} from "bleakai";

// Use the proper types from bleakai
type InteractiveQuestionType = InteractiveQuestion;
type BleakInputPropsType = BleakInputProps;
type BleakChoicePropsType = BleakChoiceProps;

import {ConversationWelcome} from "./ConversationWelcome";

/**
 * =============================================================================
 * BLEAK COMPONENT DEFINITIONS (copied from App.tsx with website styling)
 * =============================================================================
 */

// TEXT INPUT COMPONENT - for free-form text entry
const TextInput: React.FC<BleakInputPropsType> = ({text, value, onChange}) => (
  <div className="space-y-3">
    <label className="text-base font-medium text-foreground">{text}</label>
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer here..."
      rows={3}
      className="w-full p-3 border border-border rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
    />
  </div>
);

// RADIO GROUP COMPONENT - for single choice selection
const RadioGroup: React.FC<BleakChoicePropsType> = ({
  text,
  options,
  value,
  onChange
}) => (
  <div className="space-y-3">
    <label className="text-base font-medium text-foreground">{text}</label>
    <div className="space-y-2">
      {options?.map((option: string, i: number) => (
        <label
          key={i}
          className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-card hover:bg-accent hover:border-ring/50 transition-all duration-200 cursor-pointer"
        >
          <input
            type="radio"
            name={text.replace(/\s+/g, "_")}
            checked={value === option}
            onChange={() => onChange(option)}
            className="h-4 w-4 text-primary focus:ring-primary border-border"
          />
          <span className="text-sm flex-1 leading-relaxed text-foreground">
            {option}
          </span>
        </label>
      ))}
    </div>
  </div>
);

// MULTI-SELECT COMPONENT - for multiple choice selection
const MultiSelect: React.FC<BleakChoicePropsType> = ({
  text,
  options,
  value,
  onChange
}) => {
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <div className="space-y-3">
      <label className="text-base font-medium text-foreground">{text}</label>
      <div className="space-y-2">
        {options?.map((option: string, i: number) => (
          <label
            key={i}
            className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-card hover:bg-accent hover:border-ring/50 transition-all duration-200 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => {
                const newSelected = selected.includes(option)
                  ? selected.filter((v) => v !== option)
                  : [...selected, option];
                onChange(newSelected.join(", "));
              }}
              className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
            />
            <span className="text-sm flex-1 leading-relaxed text-foreground">
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

/**
 * =============================================================================
 * BLEAK ELEMENT CONFIGURATION (copied from App.tsx)
 * =============================================================================
 */
const elementConfig = {
  text: {
    component: TextInput,
    description: "Free-form text input for detailed responses"
  },
  radio: {
    component: RadioGroup,
    description: "Single choice selection from predefined options"
  },
  multi_select: {
    component: MultiSelect,
    description: "Multiple choice selection from available options"
  }
};

/**
 * =============================================================================
 * UI HELPER COMPONENTS (website styling)
 * =============================================================================
 */

// LOADING COMPONENT
const LoadingSpinner = () => (
  <div className="text-center py-8">
    <div className="inline-flex items-center gap-2 text-muted-foreground">
      <div className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin"></div>
      Processing your request...
    </div>
  </div>
);

// ERROR COMPONENT
const ErrorMessage = ({
  error,
  onDismiss
}: {
  error: Error;
  onDismiss: () => void;
}) => (
  <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
    <div className="text-sm text-destructive">
      <strong>Something went wrong:</strong>
      <p className="mt-1">{error.message}</p>
    </div>
    <button
      onClick={onDismiss}
      className="mt-3 px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
    >
      Try Again
    </button>
  </div>
);

// QUESTIONS SECTION (adapted from App.tsx with website styling)
const QuestionsSection = ({
  questions,
  answers,
  onAnswerChange,
  onSubmit,
  onRequestMore,
  isLoading,
  bleak
}: {
  questions: InteractiveQuestionType[];
  answers: Record<string, string>;
  onAnswerChange: (question: string, value: string) => void;
  onSubmit: () => void;
  onRequestMore: () => void;
  isLoading: boolean;
  bleak: BleakSession; // Use proper BleakSession type
}) => {
  const allQuestionsAnswered = questions.every((q) =>
    answers[q.question]?.trim()
  );

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-light text-foreground">
            Help me understand better
          </h2>
          <p className="text-muted-foreground">
            Please answer these questions to get a more personalized response
          </p>
        </div>

        <div className="space-y-8">
          {bleak
            .getBleakComponents(questions, answers, onAnswerChange)
            .map(
              ({
                Component,
                props,
                key
              }: {
                Component: React.ComponentType<Record<string, unknown>>;
                props: Record<string, unknown>;
                key: string;
              }) => (
                <div key={key} className="space-y-3">
                  <Component {...props} />
                  {key !== `question-${questions.length - 1}` && (
                    <div className="w-full h-px bg-border"></div>
                  )}
                </div>
              )
            )}
        </div>
      </div>

      {/* Choice buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onRequestMore}
          disabled={!allQuestionsAnswered || isLoading}
          className="flex-1 py-3 px-6 text-base font-medium border border-border rounded-lg bg-background text-foreground hover:bg-accent hover:border-ring/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "I need to provide more details"}
        </button>

        <button
          onClick={onSubmit}
          disabled={!allQuestionsAnswered || isLoading}
          className="flex-1 py-3 px-6 text-base font-medium border border-primary bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Get My Answer"}
        </button>
      </div>
    </div>
  );
};

// ANSWER SECTION (website styling)
const AnswerSection = ({
  answer,
  onReset
}: {
  answer: string;
  onReset: () => void;
}) => (
  <div className="space-y-8">
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-light text-foreground">Answer</h2>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="prose prose-neutral max-w-none text-foreground">
          {answer.split("\n").map((line, index) => (
            <p key={index} className="mb-4 last:mb-0">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>

    <button
      onClick={onReset}
      className="px-8 py-3 text-base font-medium border border-border rounded-lg bg-background text-foreground hover:bg-accent hover:border-ring/50 transition-all duration-200"
    >
      Ask Another Question
    </button>
  </div>
);

/**
 * =============================================================================
 * MAIN CONVERSATION CONTAINER (App.tsx logic with website integration)
 * =============================================================================
 */

interface ConversationContainerProps {
  customConfig?: BleakElementConfig | null;
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
  /**
   * STATE MANAGEMENT (copied from App.tsx)
   */
  const [prompt, setPrompt] = useState(prefilledPrompt);
  const [questions, setQuestions] = useState<InteractiveQuestionType[] | null>(
    null
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(initialApiKey);

  /**
   * BLEAK SESSION INITIALIZATION (copied from App.tsx)
   */
  const bleak = useMemo(
    () =>
      new BleakSession({
        apiKey: apiKey || "your-api-key",
        baseUrl:
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8008/bleak",
        timeout: 30000,
        elements: customConfig || elementConfig
      }),
    [apiKey, customConfig]
  );

  /**
   * CONVERSATION FLOW HANDLERS (copied from App.tsx)
   */

  // START CONVERSATION
  const handleStartConversation = async (prompt: string) => {
    console.log("handleStartConversation", prompt);
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    resetState();

    try {
      console.log("prompt", prompt);
      const result = await bleak.startBleakConversation(prompt);

      if (result.needsInput && result.questions) {
        setQuestions(result.questions);
      } else if (result.answer) {
        setFinalAnswer(result.answer);
      }

      onConversationStart?.();
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // SUBMIT ANSWERS
  const handleSubmitAnswers = async () => {
    if (!questions) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await bleak.finishBleakConversation(answers);
      setFinalAnswer(result);
      setQuestions(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // REQUEST MORE QUESTIONS
  const handleRequestMoreQuestions = async () => {
    if (!questions) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await bleak.requestMoreBleakQuestions(answers);

      if (result.questions) {
        setQuestions(result.questions);
      } else if (result.isComplete) {
        const finalResult = await bleak.finishBleakConversation(answers);
        setFinalAnswer(finalResult);
        setQuestions(null);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // ANSWER CHANGE HANDLER
  const handleAnswerChange = (question: string, value: string) => {
    setAnswers((prev) => ({...prev, [question]: value}));
  };

  // STATE RESET HELPERS
  const resetState = () => {
    setQuestions(null);
    setAnswers({});
    setFinalAnswer(null);
  };

  const resetAll = () => {
    bleak.resetBleakSession();
    resetState();
    setError(null);
    setIsLoading(false);
    setPrompt("");
  };

  const dismissError = () => {
    setError(null);
    setIsLoading(false);
  };

  // Error handling helpers for website compatibility
  const getChatErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  };

  /**
   * RENDER LOGIC (adapted for website)
   */

  // Show welcome screen in welcome mode or if there's no active conversation
  if (isWelcomeMode || (!questions?.length && !finalAnswer)) {
    return (
      <ConversationWelcome
        onPromptSubmit={handleStartConversation}
        isLoading={isLoading}
        prefilledPrompt={prefilledPrompt}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        error={error}
        getChatErrorMessage={getChatErrorMessage}
      />
    );
  }

  // Show main conversation UI
  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <div className="flex-1 p-6 space-y-8 overflow-y-auto max-w-4xl mx-auto w-full">
        {/* Errors */}
        {error && <ErrorMessage error={error} onDismiss={dismissError} />}

        {/* Loading state */}
        {isLoading && <LoadingSpinner />}

        {/* Questions */}
        {questions && !isLoading && (
          <QuestionsSection
            questions={questions}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleSubmitAnswers}
            onRequestMore={handleRequestMoreQuestions}
            isLoading={isLoading}
            bleak={bleak}
          />
        )}

        {/* Final Answer */}
        {finalAnswer && !isLoading && (
          <AnswerSection answer={finalAnswer} onReset={resetAll} />
        )}
      </div>
    </div>
  );
};
