import React, {useState} from "react";
import {
  BleakProvider,
  ContextualDynamicQuestionRenderer,
  createDefaultConfig,
  createComponentRegistry
} from "bleakai";

// Simple test components
const SimpleTextInput = ({question, value, onChange}: any) => (
  <div style={{margin: "10px 0"}}>
    <label style={{display: "block", marginBottom: "5px"}}>{question}</label>
    <input
      style={{border: "1px solid #ccc", padding: "5px", width: "100%"}}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const SimpleRadio = ({question, options = [], value, onChange}: any) => (
  <div style={{margin: "10px 0"}}>
    <label style={{display: "block", marginBottom: "5px"}}>{question}</label>
    {options.map((option: string, index: number) => (
      <label key={index} style={{display: "block", margin: "5px 0"}}>
        <input
          type="radio"
          value={option}
          checked={value === option}
          onChange={(e) => onChange(e.target.value)}
          style={{marginRight: "5px"}}
        />
        {option}
      </label>
    ))}
  </div>
);

enum BleakComponentEnum {
  RADIO = "radio",
  TEXT = "text"
}

// Create component registry
const components = createComponentRegistry()
  .add(BleakComponentEnum.TEXT, SimpleTextInput)
  .add(BleakComponentEnum.RADIO, SimpleRadio)
  .build();

// Create configuration
const config = createDefaultConfig(components, {
  enableLogging: true,
  fallbackComponent: SimpleTextInput
});

export const TestBleakAI = () => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = [
    {
      type: BleakComponentEnum.TEXT,
      question: "What is your name?"
    },
    {
      type: BleakComponentEnum.RADIO,
      question: "What is your favorite color?",
      options: ["Red", "Blue", "Green", "Yellow"]
    }
  ];

  return (
    <BleakProvider config={config}>
      <div style={{padding: "20px", maxWidth: "600px"}}>
        <h1>BleakAI Test</h1>

        {questions.map((question, index) => (
          <div
            key={index}
            style={{
              marginBottom: "20px",
              border: "1px solid #ddd",
              padding: "10px"
            }}
          >
            <ContextualDynamicQuestionRenderer
              question={question}
              value={answers[question.question] || ""}
              onChange={(value) =>
                setAnswers((prev) => ({...prev, [question.question]: value}))
              }
              questionIndex={index}
            />
          </div>
        ))}

        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f5f5f5"
          }}
        >
          <h3>Answers:</h3>
          <pre>{JSON.stringify(answers, null, 2)}</pre>
        </div>
      </div>
    </BleakProvider>
  );
};
