import React, {useState, useMemo} from "react";
import {BleakSession, type InteractiveQuestion} from "bleakai";

// Clean input components without styles
const TextInput = ({text, value, onChange}: any) => (
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

const RadioGroup = ({text, options, value, onChange}: any) => (
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

const MultiSelect = ({text, options, value, onChange}: any) => {
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

// Configuration for different input types
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

// Loading component
const LoadingSpinner = () => (
  <div className="loading">
    <div className="spinner"></div>
    <span>Processing your request...</span>
  </div>
);

// Error display component
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

// Main prompt input component
const PromptInput = ({
  prompt,
  setPrompt,
  onSubmit,
  isLoading
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}) => (
  <div className="prompt-section">
    <h2>Ask AI Assistant</h2>
    <p>
      Describe what you need help with, and I'll guide you through it step by
      step.
    </p>

    <textarea
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      rows={4}
      placeholder="What would you like help with today?"
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

// Questions section component
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
  bleak: BleakSession;
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

// Final answer component
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

function App() {
  const [prompt, setPrompt] = useState("");
  const [questions, setQuestions] = useState<InteractiveQuestion[] | null>(
    null
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize AI session
  const bleak = useMemo(
    () =>
      new BleakSession({
        apiKey: "your-api-key",
        baseUrl: "http://localhost:8008/bleak",
        timeout: 30000,
        elements: elementConfig
      }),
    []
  );

  const handleStartConversation = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    resetState();

    try {
      const result = await bleak.startBleakConversation(prompt);

      if (result.needsInput && result.questions) {
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
      const result = await bleak.finishBleakConversation(answers);
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

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers((prev) => ({...prev, [question]: value}));
  };

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Assistant</h1>
        <p>Get personalized help with step-by-step guidance</p>
      </header>

      <main className="app-main">
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
            bleak={bleak}
          />
        )}

        {finalAnswer && !isLoading && (
          <AnswerSection answer={finalAnswer} onReset={resetAll} />
        )}
      </main>
    </div>
  );
}

export default App;
