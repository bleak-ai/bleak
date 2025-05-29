import React, {useState} from "react";
import {
  DynamicQuestionRenderer,
  createDefaultConfig,
  createComponentRegistry
} from "bleakai";
import {Button} from "../../ui/button";
import {Card} from "../../ui/card";
import type {InteractiveQuestion} from "../../../api/interactiveApi";
import {
  BleakTextQuestion,
  BleakRadioQuestion,
  BleakMultiSelectQuestion,
  BleakSliderQuestion
} from "../adapters/BleakAdapters";

// Create component registry using BleakAI
const components = createComponentRegistry()
  .add("text", BleakTextQuestion as any)
  .add("radio", BleakRadioQuestion as any)
  .add("multi_select", BleakMultiSelectQuestion as any)
  .add("slider", BleakSliderQuestion as any)
  .build();

// Create configuration with logging enabled
const config = createDefaultConfig(components, {
  enableLogging: true,
  fallbackComponent: BleakRadioQuestion as any, // Use radio as fallback
  customShouldHaveOptions: (type) =>
    ["radio", "multi_select", "slider"].includes(type),
  customDefaultOptions: (type) => {
    if (type === "radio") return ["Yes", "No"];
    if (type === "slider") return ["1", "10", "1"];
    return [];
  }
});

export const DynamicDemo: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const demoQuestions: InteractiveQuestion[] = [
    {
      type: "text",
      question: "What's your name?"
    },
    {
      type: "radio",
      question: "What's your experience level?",
      options: ["Beginner", "Intermediate", "Advanced"]
    },
    {
      type: "multi_select",
      question: "Which technologies interest you?",
      options: ["React", "Vue", "Angular", "Svelte", "TypeScript", "JavaScript"]
    },
    {
      type: "slider",
      question: "How satisfied are you with our service?",
      options: ["1", "10", "1"] // min, max, step
    }
  ];

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [question]: value
    }));
  };

  const handleReset = () => {
    setAnswers({});
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dynamic Questions Demo</h1>
        <p className="text-muted-foreground mb-6">
          This demo shows different question types being rendered dynamically
          using the direct config approach.
        </p>

        <div className="space-y-6">
          {demoQuestions.map((question, index) => (
            <div key={index} className="border rounded-lg p-4">
              <DynamicQuestionRenderer
                config={config}
                question={question}
                value={answers[question.question] || ""}
                onChange={(value) =>
                  handleAnswerChange(question.question, value)
                }
                questionIndex={index}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-6">
          <Button onClick={handleReset} variant="outline">
            Reset Answers
          </Button>
          <Button
            onClick={() =>
              console.log("Current answers:", JSON.stringify(answers, null, 2))
            }
          >
            Log Answers
          </Button>
        </div>

        {Object.keys(answers).length > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Current Answers:</h3>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(answers, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
};
