import React, {useState, useMemo} from "react";
import {
  BleakUISession,
  type InteractiveQuestion,
  type BleakInputProps,
  type BleakChoiceProps
} from "bleakai";

// Shared element descriptions for reusability
export const ELEMENT_DESCRIPTIONS = {
  text: "Free-form text input for detailed responses",
  radio: "Single choice selection from predefined options",
  multi_select: "Multiple choice selection from available options"
} as const;

// Custom UI Components
const TextInput: React.FC<BleakInputProps> = ({text, value, onChange}) => (
  <div className="question-group">
    <label className="question-label">{text}</label>
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Enter ${text.toLowerCase()}`}
      className="text-input"
    />
  </div>
);

const RadioGroup: React.FC<BleakChoiceProps> = ({
  text,
  options,
  value,
  onChange
}) => (
  <div className="question-group">
    <label className="question-label">{text}</label>
    <div className="radio-options">
      {options?.map((option: string, i: number) => (
        <label key={i} className="radio-option">
          <input
            type="radio"
            name={text.replace(/\s+/g, "_")}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  </div>
);

const MultiSelect: React.FC<BleakChoiceProps> = ({
  text,
  options,
  value,
  onChange
}) => {
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <div className="question-group">
      <label className="question-label">{text}</label>
      <div className="checkbox-options">
        {options?.map((option: string, i: number) => (
          <label key={i} className="checkbox-option">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => {
                const newSelected = selected.includes(option)
                  ? selected.filter((v) => v !== option)
                  : [...selected, option];
                onChange(newSelected.join(", "));
              }}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// Element configuration mapping
const elementConfig = {
  text: {
    component: TextInput,
    description: ELEMENT_DESCRIPTIONS.text
  },
  radio: {
    component: RadioGroup,
    description: ELEMENT_DESCRIPTIONS.radio
  },
  multi_select: {
    component: MultiSelect,
    description: ELEMENT_DESCRIPTIONS.multi_select
  }
};

// UI Helper Components
const LoadingSpinner = () => (
  <div className="loading">
    <div className="spinner"></div>
    <span>Processing your request...</span>
  </div>
);

const ErrorMessage = ({
  error,
  onDismiss
}: {
  error: Error;
  onDismiss: () => void;
}) => (
  <div className="error-message">
    <strong>Something went wrong:</strong>
    <p>{error.message}</p>
    <button onClick={onDismiss} className="btn btn-secondary">
      Try Again
    </button>
  </div>
);

const PromptInput = ({
  prompt,
  setPrompt,
  onSubmit,
  isLoading,
  placeholder = "What would you like help with today?"
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
}) => (
  <div className="prompt-section">
    <textarea
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      rows={4}
      placeholder={placeholder}
      className="prompt-textarea"
      disabled={isLoading}
    />
    <button
      onClick={onSubmit}
      disabled={isLoading || !prompt.trim()}
      className="btn btn-primary"
    >
      {isLoading ? "Getting started..." : "Get Started"}
    </button>
  </div>
);

const QuestionsSection = ({
  questions,
  answers,
  onAnswerChange,
  onSubmit,
  onRequestMore,
  isLoading,
  bleak
}: {
  questions: InteractiveQuestion[];
  answers: Record<string, string>;
  onAnswerChange: (question: string, value: string) => void;
  onSubmit: () => void;
  onRequestMore: () => void;
  isLoading: boolean;
  bleak: BleakUISession;
}) => {
  const allQuestionsAnswered = questions.every((q) =>
    answers[q.question]?.trim()
  );

  return (
    <div className="questions-section">
      <h2>Help me understand better</h2>
      <p>Please answer these questions so I can provide the best assistance:</p>

      <div className="questions-list">
        {bleak
          .getBleakComponents(questions, answers, onAnswerChange)
          .map(({Component, props, key}) => (
            <Component key={key} {...props} />
          ))}
      </div>

      <div className="action-buttons">
        <button
          onClick={onSubmit}
          disabled={!allQuestionsAnswered || isLoading}
          className="btn btn-primary"
        >
          {isLoading ? "Processing..." : "Get My Answer"}
        </button>

        <button
          onClick={onRequestMore}
          disabled={!allQuestionsAnswered || isLoading}
          className="btn btn-secondary"
        >
          {isLoading ? "Processing..." : "I need to provide more details"}
        </button>
      </div>
    </div>
  );
};

const AnswerSection = ({
  answer,
  onReset
}: {
  answer: string;
  onReset: () => void;
}) => (
  <div className="answer-section">
    <h2>Here's your answer:</h2>
    <div className="answer-content">{answer}</div>
    <button onClick={onReset} className="btn btn-primary">
      Ask Another Question
    </button>
  </div>
);

// Main App Component
function App() {
  // State management
  const [prompt, setPrompt] = useState("");
  const [questions, setQuestions] = useState<InteractiveQuestion[] | null>(
    null
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize BleakUISession with element configuration
  const uiSession = useMemo(
    () =>
      new BleakUISession({
        baseUrl: "http://localhost:8008/bleak",
        timeout: 30000,
        elements: elementConfig
      }),
    []
  );

  // Event handlers
  const handleStartConversation = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    resetState();

    try {
      const result = await uiSession.startBleakConversation(prompt);

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

  const handleSubmitAnswers = async () => {
    if (!questions) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await uiSession.finishBleakConversation(answers);
      setFinalAnswer(result);
      setQuestions(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestMoreQuestions = async () => {
    if (!questions) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await uiSession.requestMoreBleakQuestions(answers);

      if (result.questions) {
        setQuestions(result.questions);
      } else if (result.isComplete) {
        const finalResult = await uiSession.finishBleakConversation(answers);
        setFinalAnswer(finalResult);
        setQuestions(null);
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

  const resetState = () => {
    setQuestions(null);
    setAnswers({});
    setFinalAnswer(null);
  };

  const resetAll = () => {
    uiSession.resetBleakSession();
    resetState();
    setError(null);
    setIsLoading(false);
    setPrompt("");
  };

  const dismissError = () => {
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>BleakAI Demo</h1>
        <p>Interactive AI conversations with dynamic forms</p>
      </header>

      <main className="app-main">
        <div className="ui-demo">
          {error && <ErrorMessage error={error} onDismiss={dismissError} />}

          {isLoading && <LoadingSpinner />}

          {!questions && !finalAnswer && !isLoading && (
            <PromptInput
              prompt={prompt}
              setPrompt={setPrompt}
              onSubmit={handleStartConversation}
              isLoading={isLoading}
            />
          )}

          {questions && !isLoading && (
            <QuestionsSection
              questions={questions}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              onSubmit={handleSubmitAnswers}
              onRequestMore={handleRequestMoreQuestions}
              isLoading={isLoading}
              bleak={uiSession}
            />
          )}

          {finalAnswer && !isLoading && (
            <AnswerSection answer={finalAnswer} onReset={resetAll} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
