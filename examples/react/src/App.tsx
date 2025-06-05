import React, {useState} from "react";
import {BleakSession, type InteractiveQuestion} from "bleakai";

// Simple components with clean styling
const TextInput = ({question, value, onChange}: any) => (
  <div style={{marginBottom: "16px"}}>
    <label>{question}</label>
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question}
    />
  </div>
);

const RadioGroup = ({question, options, value, onChange}: any) => (
  <div style={{marginBottom: "16px"}}>
    <label>{question}</label>
    {options?.map((option: string, i: number) => (
      <div key={i}>
        <input
          type="radio"
          name={question.replace(/\s+/g, "_")}
          checked={value === option}
          onChange={() => onChange(option)}
        />
        <span>{option}</span>
      </div>
    ))}
  </div>
);

const MultiSelect = ({question, options, value, onChange}: any) => {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <div>
      <label>{question}</label>
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

// Element configuration with default components
const BLEAK_ELEMENT_CONFIG = {
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

  // Create BleakSession instance with configuration
  const bleak = new BleakSession({
    apiKey: "your-api-key",
    baseUrl: "http://localhost:8008/bleak",
    timeout: 30000,
    elements: BLEAK_ELEMENT_CONFIG
  });

  const handleAsk = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setQuestions(null);
    setAnswers({});
    setFinalAnswer(null);

    try {
      const {createSession} = bleak;
      // Create session with the new clean API
      const session = await createSession(prompt);

      const {hasQuestions, getQuestions, getResult} = session;

      if (hasQuestions) {
        // Get questions and update UI state
        const sessionQuestions = await getQuestions();
        setQuestions(sessionQuestions);
        setIsLoading(false);
      } else {
        // No questions, get result directly
        const result = await session.getResult();
        setFinalAnswer(result);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!questions) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create a new session and submit answers
      const session = await bleak.createSession(prompt);
      const result = await session.submitAnswers(answers);
      setFinalAnswer(result);
      setQuestions(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers((prev) => ({...prev, [question]: value}));
  };

  const reset = () => {
    bleak.reset();
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
      <h1>BleakAI Demo - Improved API</h1>

      {/* Error display */}
      {error && <div>Error: {error.message}</div>}

      {/* Initial prompt input */}
      {!questions && !finalAnswer && (
        <div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />
          <button onClick={handleAsk} disabled={isLoading || !prompt.trim()}>
            {isLoading ? "Loading..." : "Ask AI"}
          </button>
        </div>
      )}

      {/* Questions */}
      {questions && (
        <div>
          <h3>Please answer these questions:</h3>
          {questions.map((question) => {
            // Simple component rendering without complex resolver
            const Component =
              BLEAK_ELEMENT_CONFIG[
                question.type as keyof typeof BLEAK_ELEMENT_CONFIG
              ]?.component || TextInput;

            return (
              <Component
                key={question.question}
                question={question.question}
                value={answers[question.question] || ""}
                onChange={(value: string) =>
                  handleAnswerChange(question.question, value)
                }
                options={question.options}
              />
            );
          })}
          <button
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered || isLoading}
          >
            {isLoading ? "Processing..." : "Submit Answers"}
          </button>
        </div>
      )}

      {/* Final answer */}
      {finalAnswer && (
        <div>
          <h3>AI Response:</h3>
          <div>{finalAnswer}</div>
          <button onClick={reset}>Start Over</button>
        </div>
      )}
    </div>
  );
}

export default App;
