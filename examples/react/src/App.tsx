import React, {useState, useMemo} from "react";
import {
  BleakSession,
  type InteractiveQuestion,
  type BleakInputProps,
  type BleakChoiceProps
} from "bleakai";

/**
 * =============================================================================
 * SHARED ELEMENT CONFIGURATION
 * =============================================================================
 *
 * This configuration can be shared between different session instances.
 * The key insight: separate the descriptions from the components for reusability.
 */

// Define the element descriptions separately for reuse
export const ELEMENT_DESCRIPTIONS = {
  text: "Free-form text input for detailed responses",
  radio: "Single choice selection from predefined options",
  multi_select: "Multiple choice selection from available options"
} as const;

/**
 * =============================================================================
 * CREATING SESSIONS FOR DIFFERENT USE CASES
 * =============================================================================
 *
 * NEW ARCHITECTURE PATTERN:
 *
 * 1. For UI applications (current BleakSession with components):
 * ```typescript
 * const uiSession = new BleakSession({
 *   baseUrl: "/api/bleak",
 *   elements: elementConfig  // Full component mapping
 * });
 * // Has getBleakComponents() method
 * ```
 *
 * 2. For backend/API-only usage (BleakSession without components):
 * ```typescript
 * const coreSession = new BleakSession({
 *   baseUrl: "/api/bleak",
 *   apiKey: "your-key"
 *   // No elements config = behaves like BleakCoreSession
 * });
 * // Can use all conversation methods except getBleakComponents()
 * ```
 *
 * 3. When upgraded to new architecture:
 * ```typescript
 * import { BleakUISession, BleakCoreSession } from "bleakai";
 *
 * const uiSession = new BleakUISession({ elements: config });
 * const coreSession = new BleakCoreSession({ apiKey: "key" });
 * ```
 *
 * =============================================================================
 */

/**
 * =============================================================================
 * BLEAK COMPONENT DEFINITIONS
 * =============================================================================
 *
 * These are your custom UI components that BleakAI will use to render questions.
 * The key principle: "Bring Your Own Components" - BleakAI provides the intelligence
 * to decide what type of input is needed, while you control how it looks.
 *
 * IMPORTANT TYPING:
 * - Use BleakInputProps for components that don't need predefined options
 * - Use BleakChoiceProps for components that work with predefined options
 * - All components receive: text, value, onChange (+ options for choice components)
 * - uniqueId and elementIndex are optional but useful for accessibility/tracking
 */

// TEXT INPUT COMPONENT - for free-form text entry
const TextInput: React.FC<BleakInputProps> = ({text, value, onChange}) => (
  <div className="question-group">
    {/* Always provide clear labels for accessibility */}
    <label className="question-label">{text}</label>
    <input
      type="text"
      value={value || ""} // Handle undefined/null values gracefully
      onChange={(e) => onChange(e.target.value)} // Call onChange with new value
      placeholder={`Enter ${text.toLowerCase()}`} // Dynamic placeholder
      className="text-input"
    />
  </div>
);

// RADIO GROUP COMPONENT - for single choice selection
const RadioGroup: React.FC<BleakChoiceProps> = ({
  text,
  options,
  value,
  onChange
}) => (
  <div className="question-group">
    <label className="question-label">{text}</label>
    <div className="radio-options">
      {/* Map through the options array provided by BleakAI */}
      {options?.map((option: string, i: number) => (
        <label key={i} className="radio-option">
          <input
            type="radio"
            name={text.replace(/\s+/g, "_")} // Unique name for radio group
            checked={value === option} // Check if this option is selected
            onChange={() => onChange(option)} // Set this option as selected
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  </div>
);

// MULTI-SELECT COMPONENT - for multiple choice selection
const MultiSelect: React.FC<BleakChoiceProps> = ({
  text,
  options,
  value,
  onChange
}) => {
  // Parse the comma-separated value string into an array
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
                // Toggle selection: add if not selected, remove if selected
                const newSelected = selected.includes(option)
                  ? selected.filter((v) => v !== option)
                  : [...selected, option];
                // Convert back to comma-separated string format
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

/**
 * =============================================================================
 * BLEAK ELEMENT CONFIGURATION
 * =============================================================================
 *
 * This configuration object maps BleakAI element types to your components.
 * The AI will decide which type to use based on the context of the conversation.
 *
 * STRUCTURE:
 * - Key: element type name (used by AI to identify component)
 * - component: Your React component (or any framework component)
 * - description: Helps the AI understand when to use this component type
 *
 * BEST PRACTICES:
 * - Keep descriptions clear and specific
 * - Include examples in descriptions when helpful
 * - Use semantic type names (text, radio, multi_select, date, etc.)
 */
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

/**
 * =============================================================================
 * UI HELPER COMPONENTS
 * =============================================================================
 *
 * These components handle different states of the BleakAI flow:
 * - Loading states during API calls
 * - Error handling and display
 * - Initial prompt input
 * - Question rendering
 * - Final answer display
 */

// LOADING COMPONENT - shown during API calls
const LoadingSpinner = () => (
  <div className="loading">
    <div className="spinner"></div>
    <span>Processing your request...</span>
  </div>
);

// ERROR COMPONENT - handles error states gracefully
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

// PROMPT INPUT COMPONENT - the starting point of any BleakAI conversation
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
      disabled={isLoading} // Disable during loading
    />

    <button
      onClick={onSubmit}
      disabled={isLoading || !prompt.trim()} // Disable if loading or empty
      className="btn btn-primary"
    >
      {isLoading ? "Getting started..." : "Get Started"}
    </button>
  </div>
);

// QUESTIONS SECTION - renders the dynamically generated questions
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
  // Check if all questions have been answered
  const allQuestionsAnswered = questions.every((q) =>
    answers[q.question]?.trim()
  );

  return (
    <div className="questions-section">
      <h2>Help me understand better</h2>
      <p>Please answer these questions so I can provide the best assistance:</p>

      <div className="questions-list">
        {/*
          COMPONENT RESOLUTION MAGIC HAPPENS HERE!
          getBleakComponents() converts InteractiveQuestion[] into renderable components
          by matching question types to your configured components
        */}
        {bleak
          .getBleakComponents(questions, answers, onAnswerChange)
          .map(({Component, props, key}) => (
            <Component key={key} {...props} />
          ))}
      </div>

      <div className="action-buttons">
        {/* PRIMARY ACTION: Get final answer */}
        <button
          onClick={onSubmit}
          disabled={!allQuestionsAnswered || isLoading}
          className="btn btn-primary"
        >
          {isLoading ? "Processing..." : "Get My Answer"}
        </button>

        {/* SECONDARY ACTION: Request more questions for refinement */}
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

// ANSWER SECTION - displays the final result
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

/**
 * =============================================================================
 * MAIN APP COMPONENT - THE COMPLETE BLEAKAI ARCHITECTURE DEMO
 * =============================================================================
 *
 * This demonstrates both UI and backend usage patterns:
 * 1. UI Demo: Complete conversation flow with forms (BleakSession with elements)
 * 2. Backend Demo: Quick answers without UI (BleakSession without elements)
 *
 * When upgraded to new architecture, these would become:
 * 1. BleakUISession for UI applications
 * 2. BleakCoreSession for backend applications
 */
function App() {
  /**
   * UI DEMO STATE MANAGEMENT
   * ========================
   * For the full UI experience with form components
   */
  const [prompt, setPrompt] = useState("");
  const [questions, setQuestions] = useState<InteractiveQuestion[] | null>(
    null
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * BLEAK SESSION INITIALIZATION (UI VERSION)
   * =========================================
   * This session includes full element configuration for UI components.
   *
   * CURRENT APPROACH: BleakSession with elements
   * FUTURE APPROACH: BleakUISession with elements
   *
   * SECURE CONFIGURATION:
   * - No apiKey needed in frontend (handled by proxy)
   * - baseUrl points to your backend proxy
   * - Backend proxy adds API key securely
   * - timeout: Request timeout in milliseconds (default: 30000)
   * - elements: Your component configuration (maps types to components)
   *
   * WHY useMemo?
   * - Prevents recreation on every render
   * - Session manages internal state and HTTP client
   * - Only recreate if dependencies change
   */
  const uiSession = useMemo(
    () =>
      new BleakSession({
        // No API key in frontend! Proxy handles it securely
        baseUrl: "http://localhost:8009/bleak", // Your Hono proxy endpoint
        timeout: 30000, // 30 second timeout
        elements: elementConfig // Your component mapping
      }),
    [] // Empty dependency array - create once
  );

  // UI Demo handlers (same as before)
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
        <h1>BleakAI Architecture Demo</h1>
        <p>Testing both UI and Backend usage patterns with the same library</p>
      </header>

      <main className="app-main">
        <>
          <div className="ui-demo">
            <h2>🎨 UI Demo (BleakSession with Components)</h2>
            <p>
              Complete conversation flow with dynamic forms and component
              resolution
            </p>

            {/* ERROR STATE: Always show errors first */}
            {error && <ErrorMessage error={error} onDismiss={dismissError} />}

            {/* LOADING STATE: Show during API calls */}
            {isLoading && <LoadingSpinner />}

            {/* INITIAL STATE: Show prompt input when starting fresh */}
            {!questions && !finalAnswer && !isLoading && (
              <PromptInput
                prompt={prompt}
                setPrompt={setPrompt}
                onSubmit={handleStartConversation}
                isLoading={isLoading}
              />
            )}

            {/* QUESTIONS STATE: Show when AI needs more information */}
            {questions && !isLoading && (
              <QuestionsSection
                questions={questions}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                onSubmit={handleSubmitAnswers}
                onRequestMore={handleRequestMoreQuestions}
                isLoading={isLoading}
                bleak={uiSession} // Pass session for component resolution
              />
            )}

            {/* FINAL STATE: Show answer when conversation complete */}
            {finalAnswer && !isLoading && (
              <AnswerSection answer={finalAnswer} onReset={resetAll} />
            )}
          </div>
        </>
      </main>
    </div>
  );
}

export default App;

/**
 * =============================================================================
 * KEY BLEAKAI ARCHITECTURE CONCEPTS SUMMARY
 * =============================================================================
 *
 * 1. **Split Architecture**: Core logic vs UI logic (coming in new version)
 * 2. **Configuration Patterns**: With/without elements for different use cases
 * 3. **Shared Descriptions**: Element descriptions can be reused across sessions
 * 4. **UI vs Backend**: Same library, different configuration approaches
 * 5. **Type Safety**: Use BleakInputProps/BleakChoiceProps for proper typing
 * 6. **Element Configuration**: Map component types to your React components
 * 7. **Conversation Flow**: prompt → questions → answers → final result
 * 8. **Iterative Refinement**: Users can request more questions for detail
 * 9. **State Management**: Track prompt, questions, answers, loading, errors
 * 10. **Component Resolution**: getBleakComponents() handles the magic
 * 11. **Error Handling**: Always handle API errors gracefully
 * 12. **Accessibility**: Use proper labels, IDs, and semantic HTML
 * 13. **Performance**: useMemo for sessions, efficient re-renders
 * 14. **Flexible Usage**: Same session class, different configuration patterns

 */
