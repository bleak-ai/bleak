import {useState} from "react";
import {
  Bleak,
  type BleakElementConfig,
  type InteractiveQuestion
} from "bleakai";
import "./App.css";

// Simple components with no styling
const TextInput = ({question, value, onChange}: any) => (
  <div>
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
  <div>
    <label>{question}</label>
    {options?.map((option: string, i: number) => (
      <div key={i}>
        <input
          type="radio"
          name={question}
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

// Element configuration
const BLEAK_ELEMENT_CONFIG: BleakElementConfig = {
  text: {
    component: TextInput,
    description:
      "Use text for open-ended elements requiring free-form text input. Best for: names, descriptions, explanations, specific details, custom responses (e.g., 'What is your company name?', 'Describe your requirements', 'Any additional comments?'). Never provide options array."
  },
  radio: {
    component: RadioGroup,
    description:
      "Use radio for single-choice elements with 2-5 predefined options. Best for: yes/no elements, multiple choice with exclusive selection, categorical choices (e.g., 'What is your experience level?', 'Which option do you prefer?', 'Are you satisfied?'). Always provide options array."
  },
  multi_select: {
    component: MultiSelect,
    description:
      "Use multiselect for elements where users can select multiple options from a list. Best for: skills selection, feature preferences, multiple interests, tags (e.g., 'Which programming languages do you know?', 'Select all that apply', 'What features do you need?'). Always provide options array with 3+ choices."
  }
};

// Initialize Bleak instance once with configuration
const bleak = new Bleak({
  apiKey: "your-api-key",
  baseUrl: "http://localhost:8008",
  timeout: 30000,
  elements: BLEAK_ELEMENT_CONFIG
});

function App() {
  const [prompt, setPrompt] = useState("");
  const [questions, setQuestions] = useState<InteractiveQuestion[] | null>(
    null
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleAsk = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setQuestions(null);
    setAnswers({});
    setFinalAnswer(null);

    try {
      const result = await bleak.ask(prompt, {
        onQuestions: async (questions: InteractiveQuestion[]) => {
          setQuestions(questions);
          setIsLoading(false);

          // Wait for user to submit answers
          return new Promise((resolve) => {
            (window as any).__resolveAnswers = resolve;
          });
        },
        onError: (error: Error) => {
          setError(error);
          setIsLoading(false);
        }
      });

      setFinalAnswer(result);
      setQuestions(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!questions) return;

    setIsLoading(true);
    setError(null);

    try {
      // Resolve the promise with answers
      if ((window as any).__resolveAnswers) {
        (window as any).__resolveAnswers(answers);
        delete (window as any).__resolveAnswers;
      }
    } catch (err) {
      setError(err as Error);
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
      <h1>BleakAI Demo - New Class-Based API</h1>

      {/* Error display */}
      {error && (
        <div style={{color: "red", margin: "10px 0"}}>
          Error: {error.message}
        </div>
      )}

      {/* Initial prompt input */}
      {!questions && !finalAnswer && (
        <div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask something"
            rows={3}
          />
          <button onClick={handleAsk} disabled={isLoading}>
            {isLoading ? "Loading..." : "Ask AI"}
          </button>
        </div>
      )}

      {/* Questions */}
      {questions && (
        <div>
          <h3>Answer these questions:</h3>
          {(() => {
            // Use bleak.renderQuestions to get rendered components
            const renderedQuestions = bleak.renderQuestions(questions);
            return renderedQuestions.map(
              ({
                question,
                Component,
                props
              }: {
                question: InteractiveQuestion;
                Component: any;
                props: any;
              }) => (
                <div key={question.question}>
                  <Component
                    {...props}
                    question={question.question}
                    value={answers[question.question] || ""}
                    onChange={(value: string) =>
                      handleAnswerChange(question.question, value)
                    }
                    options={question.options}
                  />
                </div>
              )
            );
          })()}
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
