import React, {useState, useMemo} from "react";
import {BleakSession, type InteractiveQuestion} from "bleakai";

// Simple components with clean styling
const TextInput = ({text, value, onChange}: any) => (
  <div style={{marginBottom: "16px"}}>
    <label>{text}</label>
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={text}
    />
  </div>
);

const RadioGroup = ({text, options, value, onChange}: any) => (
  <div style={{marginBottom: "16px"}}>
    <label>{text}</label>
    {options?.map((option: string, i: number) => (
      <div key={i}>
        <input
          type="radio"
          name={text.replace(/\s+/g, "_")}
          checked={value === option}
          onChange={() => onChange(option)}
        />
        <span>{option}</span>
      </div>
    ))}
  </div>
);

const MultiSelect = ({text, options, value, onChange}: any) => {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <div>
      <label>{text}</label>
      {options?.map((option: string, i: number) => (
        <div key={i}>
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
        </div>
      ))}
    </div>
  );
};

// Element configuration for the backend
const elementConfig = {
  text: {
    component: TextInput,
    description:
      "Use text for open-ended elements requiring free-form text input. Best for: names, descriptions, explanations, specific details, custom responses."
  },
  radio: {
    component: RadioGroup,
    description:
      "Use radio for single-choice elements with 2-5 predefined options. Best for: yes/no elements, multiple choice with exclusive selection, categorical choices."
  },
  multi_select: {
    component: MultiSelect,
    description:
      "Use multiselect for elements where users can select multiple options from a list. Best for: skills selection, feature preferences, multiple interests."
  }
};

function App() {
  const [prompt, setPrompt] = useState("");
  const [questions, setQuestions] = useState<InteractiveQuestion[] | null>(
    null
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create BleakSession instance with configuration - useMemo ensures it's only created once
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

  const handleAsk = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setQuestions(null);
    setAnswers({});
    setFinalAnswer(null);

    try {
      // New Bleak API - single call, no confusing double await!
      const result = await bleak.startBleakConversation(prompt);

      if (result.needsInput && result.questions) {
        // Questions are immediately available, no second await needed
        setQuestions(result.questions);
        setIsLoading(false);
      } else if (result.answer) {
        // Direct answer available
        setFinalAnswer(result.answer);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    console.log("Current questions:", questions);
    console.log("Current answers:", answers);
    if (!questions) return;

    setIsLoading(true);
    setError(null);

    try {
      // New Bleak API - finish the conversation with user answers
      const result = await bleak.finishBleakConversation(answers);
      setFinalAnswer(result);
      setQuestions(null);
    } catch (err) {
      console.log("Error:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestMoreQuestions = async () => {
    console.log("Requesting more questions with current answers:", answers);
    if (!questions) return;

    setIsLoading(true);
    setError(null);

    try {
      // Request additional questions based on current answers
      const result = await bleak.requestMoreBleakQuestions(answers);

      if (result.questions) {
        // Update with new questions, keeping existing answers
        setQuestions(result.questions);
      } else if (result.isComplete) {
        // No more questions available, get final result
        const finalResult = await bleak.finishBleakConversation(answers);
        setFinalAnswer(finalResult);
        setQuestions(null);
      }
    } catch (err) {
      console.log("Error requesting more questions:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers((prev) => ({...prev, [question]: value}));
  };

  const reset = () => {
    bleak.resetBleakSession();
    setQuestions(null);
    setAnswers({});
    setFinalAnswer(null);
    setError(null);
    setIsLoading(false);
    setPrompt("");
  };

  const allQuestionsAnswered = questions?.every((q) =>
    answers[q.question]?.trim()
  );

  return (
    <div>
      <h1>BleakAI Demo - Clean Bleak API</h1>

      {/* Error display */}
      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            backgroundColor: "#ffebee",
            border: "1px solid #f44336",
            borderRadius: "4px"
          }}
        >
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {/* Initial prompt input */}
      {!questions && !finalAnswer && (
        <div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="Ask BleakAI anything..."
            style={{width: "100%", marginBottom: "10px"}}
          />
          <button onClick={handleAsk} disabled={isLoading || !prompt.trim()}>
            {isLoading ? "Loading..." : "Start Bleak Conversation"}
          </button>
        </div>
      )}

      {/* Questions with Bleak component resolution */}
      {questions && (
        <div>
          <h3>Please answer these questions:</h3>

          {bleak
            .getBleakComponents(questions, answers, handleAnswerChange)
            .map(({Component, props, key}) => (
              <Component key={key} {...props} />
            ))}

          <div style={{marginTop: "20px", display: "flex", gap: "10px"}}>
            <button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || isLoading}
            >
              {isLoading ? "Processing..." : "Finish Bleak Conversation"}
            </button>

            <button
              onClick={handleRequestMoreQuestions}
              disabled={!allQuestionsAnswered || isLoading}
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor:
                  allQuestionsAnswered && !isLoading ? "pointer" : "not-allowed"
              }}
            >
              {isLoading ? "Processing..." : "Request More Questions"}
            </button>
          </div>
        </div>
      )}

      {/* Final answer */}
      {finalAnswer && (
        <div>
          <h3>Bleak AI Response:</h3>
          <div
            style={{
              padding: "15px",
              backgroundColor: "#f0f8ff",
              border: "1px solid #0066cc",
              borderRadius: "4px"
            }}
          >
            {finalAnswer}
          </div>
          <button onClick={reset} style={{marginTop: "10px"}}>
            Start New Bleak Conversation
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
