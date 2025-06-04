import {useState} from "react";
import {
  startConversation,
  finishConversation,
  type AnsweredQuestion,
  type InteractiveQuestion,
  type BleakElementConfig,
  createResolverFromConfig
} from "bleakai";
import "./App.css";

// Simple configuration
function createAppChatConfig(apiKey?: string) {
  return {
    baseUrl: "http://0.0.0.0:8008",
    apiKey: apiKey,
    timeout: 30000
  };
}

// Very simple components with no styling
const TextInput = ({question, value, onChange}: any) => (
  <div>
    <label>{question}</label>
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
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

export const BLEAK_ELEMENT_CONFIG = {
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
} satisfies BleakElementConfig;

function App() {
  const [prompt, setPrompt] = useState("");
  const [chatClient, setChatClient] = useState<any>(null);
  const [questions, setQuestions] = useState<InteractiveQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleAsk = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setAnswers({});
    setFinalAnswer(null);

    try {
      const {response, client} = await startConversation(
        prompt,
        createAppChatConfig(),
        {
          bleakElements: Object.entries(BLEAK_ELEMENT_CONFIG).map(
            ([name, config]) => ({
              name,
              description: config.description
            })
          )
        }
      );

      setChatClient(client);

      if (response.type === "questions") {
        setQuestions(response.questions || []);
      } else if (response.type === "answer") {
        setFinalAnswer(response.content);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!chatClient || !questions.length) return;

    setIsLoading(true);
    setError(null);

    try {
      const answeredQuestions: AnsweredQuestion[] = questions
        .map((q) => {
          const answer = answers[q.question];
          if (answer && answer.trim()) {
            return {question: q.question, answer: answer.trim()};
          }
          return null;
        })
        .filter((item): item is AnsweredQuestion => item !== null);

      const response = await finishConversation(chatClient, answeredQuestions);

      if (response.type === "answer") {
        setFinalAnswer(response.content);
        setQuestions([]);
      } else if (response.type === "questions") {
        setQuestions(response.questions || []);
        setAnswers({});
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

  const reset = () => {
    setQuestions([]);
    setAnswers({});
    setFinalAnswer(null);
    setChatClient(null);
    setError(null);
    setIsLoading(false);
    setPrompt("");
  };

  const allQuestionsAnswered = questions.every((q) =>
    answers[q.question]?.trim()
  );

  const renderQuestion = (question: any, questionIndex: number) => {
    const value = answers[question.question] || "";
    const onChange = (val: string) =>
      handleAnswerChange(question.question, val);

    const {resolve} = createResolverFromConfig(BLEAK_ELEMENT_CONFIG);

    const elementData = {
      type: question.type,
      text: question.question,
      options: question.options || []
    };

    try {
      const {Component, props} = resolve(
        elementData,
        value,
        onChange,
        questionIndex
      );
      return (
        <div key={question.question}>
          <h3>{question.question}</h3>
          <Component {...props} />
        </div>
      );
    } catch (error) {
      console.error("Error resolving bleak element:", error);
      return (
        <div className="text-destructive text-sm">
          Error rendering question: {question.question}
        </div>
      );
    }

    // switch (question.type) {
    //   case "text":
    //     return (
    //       <TextInput
    //         key={question.question}
    //         question={question.question}
    //         value={value}
    //         onChange={onChange}
    //       />
    //     );
    //   case "radio":
    //     return (
    //       <RadioGroup
    //         key={question.question}
    //         question={question.question}
    //         options={question.options}
    //         value={value}
    //         onChange={onChange}
    //       />
    //     );
    //   case "multiSelect":
    //     return (
    //       <MultiSelect
    //         key={question.question}
    //         question={question.question}
    //         options={question.options}
    //         value={value}
    //         onChange={onChange}
    //       />
    //     );
    //   default:
    //     return (
    //       <TextInput
    //         key={question.question}
    //         question={question.question}
    //         value={value}
    //         onChange={onChange}
    //       />
    //     );
    // }
  };

  return (
    <div>
      <h1>BleakAI Demo</h1>

      {/* Error display */}
      {error && (
        <div style={{color: "red", margin: "10px 0"}}>
          Error: {error.message}
        </div>
      )}

      {/* Initial prompt input */}
      {!questions.length && !finalAnswer && (
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
      {questions.length > 0 && (
        <div>
          <h3>Answer these questions:</h3>
          {questions.map((question, index) => renderQuestion(question, index))}
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
