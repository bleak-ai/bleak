import React, {useMemo, useState} from "react";
import {
  BleakSession,
  type InteractiveQuestion,
  type BleakInputProps,
  type BleakChoiceProps
} from "bleakai";

export const ELEMENT_DESCRIPTIONS = {
  text: "Free-form text input for detailed responses",
  radio: "Single choice selection from predefined options"
} as const;

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

const elementsConfig = {
  text: {
    component: TextInput,
    description: ELEMENT_DESCRIPTIONS.text
  },
  radio: {
    component: RadioGroup,
    description: ELEMENT_DESCRIPTIONS.radio
  }
};

const uiSession = new BleakSession({
  elements: elementsConfig,
  // baseUrl: "http://localhost:6006/bleak" // TODO: Uncomment this to use proxy
  baseUrl: "http://localhost:8008/bleak" // TODO: Uncomment this to use without proxu
});

export const ArticleCreator = () => {
  const [initialPrompt, setInitialPrompt] = useState("");
  const [questions, setQuestions] = useState<InteractiveQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [finalAnswer, setFinalAnswer] = useState<string>("");
  const [conversationState, setConversationState] = useState<
    "start" | "continue" | "complete"
  >("start");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (conversationState === "start") {
      const response = await uiSession.startBleakConversation(initialPrompt);

      if (response && response.questions && response.questions.length > 0) {
        setQuestions(response.questions);
      }
    } else if (conversationState === "complete") {
      const response = await uiSession.finishBleakConversation(answers);

      console.log("final response", response);
      setFinalAnswer(response);
    } else if (conversationState === "continue") {
      const response = await uiSession.requestMoreBleakQuestions(answers);

      if (response && response.questions && response.questions.length > 0) {
        setQuestions(response.questions);
      }
    }

    // TODO: Handle state with continue
    setConversationState("complete");
  };

  const onAnswerChange = (question: string, answer: string) => {
    setAnswers((prev) => ({...prev, [question]: answer}));
  };

  const componentConfigs = uiSession.resolveComponents(questions);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <TextInput
          text="Article Title"
          value={initialPrompt}
          onChange={setInitialPrompt}
        />

        <div>
          <p>Questions</p>

          {componentConfigs.map(({Component, staticProps, question}) => (
            <Component
              key={question.question} // Use question text as key
              {...staticProps} // Static props: text, options, uniqueId, elementIndex
              value={answers[question.question] || ""} // Dynamic: current value
              onChange={(value: string) =>
                onAnswerChange(question.question, value)
              }
            />
          ))}
        </div>

        <div>
          Final Answer
          <p>{finalAnswer}</p>
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
