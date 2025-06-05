import React, {useState, useMemo} from "react";
import {
  BleakSession,
  type InteractiveQuestion,
  type BleakInputProps,
  type BleakChoiceProps
} from "bleakai";

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
 * MAIN APP COMPONENT - THE COMPLETE BLEAKAI FLOW
 * =============================================================================
 *
 * This demonstrates a complete BleakAI conversation flow:
 * 1. Initialize BleakSession with your components
 * 2. Start conversation with a prompt
 * 3. Handle questions/answers iteratively
 * 4. Get final answer
 * 5. Reset for new conversation
 */
function App() {
  /**
   * STATE MANAGEMENT
   * ===============
   * BleakAI conversations are stateful - you need to track:
   * - Current prompt
   * - Generated questions
   * - User answers
   * - Final answer
   * - Loading states
   * - Error states
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
   * BLEAK SESSION INITIALIZATION
   * ============================
   * The BleakSession is the main API for interacting with BleakAI.
   *
   * CONFIGURATION OPTIONS:
   * - apiKey: Your BleakAI API key (required for production)
   * - baseUrl: API endpoint (defaults to production, override for local dev)
   * - timeout: Request timeout in milliseconds (default: 30000)
   * - elements: Your component configuration (maps types to components)
   *
   * WHY useMemo?
   * - Prevents recreation on every render
   * - BleakSession manages internal state and HTTP client
   * - Only recreate if dependencies change
   */
  const bleak = useMemo(
    () =>
      new BleakSession({
        apiKey: "your-api-key", // TODO: Replace with actual API key
        baseUrl: "http://localhost:8008/bleak", // Local development endpoint
        timeout: 30000, // 30 second timeout
        elements: elementConfig // Your component mapping
      }),
    [] // Empty dependency array - create once
  );

  /**
   * CONVERSATION FLOW HANDLERS
   * ==========================
   * These functions handle the different stages of a BleakAI conversation
   */

  /**
   * STEP 1: START CONVERSATION
   * =========================
   * This is the entry point of any BleakAI conversation.
   *
   * WHAT HAPPENS:
   * 1. Send initial prompt to BleakAI
   * 2. AI analyzes prompt and decides:
   *    - Return immediate answer (if prompt is straightforward)
   *    - Generate questions (if more info needed)
   * 3. Update UI state accordingly
   *
   * RESPONSE TYPES:
   * - needsInput: true = questions generated, show form
   * - needsInput: false = direct answer available
   */
  const handleStartConversation = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    resetState(); // Clear previous conversation state

    try {
      // The magic starts here! Send prompt to BleakAI
      const result = await bleak.startBleakConversation(prompt);

      if (result.needsInput && result.questions) {
        // AI needs more information - show questions
        setQuestions(result.questions);
      } else if (result.answer) {
        // AI has enough info - show direct answer
        setFinalAnswer(result.answer);
      }
    } catch (err) {
      // Handle API errors gracefully
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * STEP 2A: SUBMIT ANSWERS (COMPLETE CONVERSATION)
   * ===============================================
   * When user has answered questions and wants the final answer.
   *
   * WHAT HAPPENS:
   * 1. Send all collected answers to BleakAI
   * 2. AI processes answers with original prompt context
   * 3. Generate comprehensive final answer
   * 4. Conversation is complete
   */
  const handleSubmitAnswers = async () => {
    if (!questions) return;

    setIsLoading(true);
    setError(null);

    try {
      // Send answers and get final result
      const result = await bleak.finishBleakConversation(answers);
      setFinalAnswer(result);
      setQuestions(null); // Hide questions, show answer
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * STEP 2B: REQUEST MORE QUESTIONS (ITERATIVE REFINEMENT)
   * =====================================================
   * When user wants to provide even more details before getting answer.
   * This enables iterative conversation refinement.
   *
   * WHAT HAPPENS:
   * 1. Send current answers to BleakAI
   * 2. AI analyzes answers and generates follow-up questions
   * 3. User can provide additional context
   * 4. Process repeats until user is satisfied
   *
   * USE CASES:
   * - Complex requirements that need multiple rounds of clarification
   * - User realizes they want to add more context
   * - Building detailed specifications iteratively
   */
  const handleRequestMoreQuestions = async () => {
    if (!questions) return;

    setIsLoading(true);
    setError(null);

    try {
      // Request additional questions based on current answers
      const result = await bleak.requestMoreBleakQuestions(answers);

      if (result.questions) {
        // More questions generated - continue conversation
        setQuestions(result.questions);
      } else if (result.isComplete) {
        // AI decided no more questions needed - finish conversation
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

  /**
   * ANSWER CHANGE HANDLER
   * ====================
   * Updates the answers state when user interacts with form components.
   * This is passed to all components via getBleakComponents().
   *
   * IMPORTANT:
   * - Keep answers in sync with component state
   * - Use question text as key (BleakAI's internal identifier)
   * - Preserve existing answers when updating
   */
  const handleAnswerChange = (question: string, value: string) => {
    setAnswers((prev) => ({...prev, [question]: value}));
  };

  /**
   * STATE RESET HELPERS
   * ===================
   * Clean up state for new conversations
   */
  const resetState = () => {
    setQuestions(null);
    setAnswers({});
    setFinalAnswer(null);
  };

  const resetAll = () => {
    bleak.resetBleakSession(); // Reset BleakAI internal state
    resetState(); // Reset component state
    setError(null);
    setIsLoading(false);
    setPrompt("");
  };

  const dismissError = () => {
    setError(null);
    setIsLoading(false);
  };

  /**
   * RENDER LOGIC
   * ============
   * The UI flow follows this priority:
   * 1. Show errors (if any)
   * 2. Show loading spinner (during API calls)
   * 3. Show prompt input (initial state)
   * 4. Show questions (when AI needs input)
   * 5. Show final answer (conversation complete)
   *
   * CONDITIONAL RENDERING STRATEGY:
   * - Only one main section visible at a time
   * - Clear visual feedback for each state
   * - Consistent loading states across sections
   */
  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Assistant</h1>
        <p>Get personalized help with step-by-step guidance</p>
      </header>

      <main className="app-main">
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
            bleak={bleak} // Pass session for component resolution
          />
        )}

        {/* FINAL STATE: Show answer when conversation complete */}
        {finalAnswer && !isLoading && (
          <AnswerSection answer={finalAnswer} onReset={resetAll} />
        )}
      </main>
    </div>
  );
}

export default App;

/**
 * =============================================================================
 * KEY BLEAKAI CONCEPTS SUMMARY
 * =============================================================================
 *
 * 1. **Bring Your Own Components**: BleakAI provides intelligence, you provide UI
 * 2. **Type Safety**: Use BleakInputProps/BleakChoiceProps for proper typing
 * 3. **Element Configuration**: Map component types to your React components
 * 4. **Conversation Flow**: prompt → questions → answers → final result
 * 5. **Iterative Refinement**: Users can request more questions for detail
 * 6. **State Management**: Track prompt, questions, answers, loading, errors
 * 7. **Component Resolution**: getBleakComponents() handles the magic
 * 8. **Error Handling**: Always handle API errors gracefully
 * 9. **Accessibility**: Use proper labels, IDs, and semantic HTML
 * 10. **Performance**: useMemo for BleakSession, efficient re-renders
 *
 * =============================================================================
 * NEXT STEPS FOR IMPLEMENTATION
 * =============================================================================
 *
 * 1. Replace "your-api-key" with actual API key
 * 2. Update baseUrl for your environment (production/staging/local)
 * 3. Add your custom CSS styles for the component classes
 * 4. Extend elementConfig with more component types as needed
 * 5. Add error logging/analytics for production monitoring
 * 6. Consider adding progress indicators for long conversations
 * 7. Implement conversation history/persistence if needed
 * 8. Add unit tests for critical conversation flows
 * 9. Consider accessibility improvements (ARIA labels, keyboard nav)
 * 10. Add loading states for better UX during slow connections
 */
