import React, {useState} from "react";
import {createResolverFromConfig} from "bleakai";
import {Button} from "../ui/button";
import {Card} from "../ui/card";
import {BLEAK_ELEMENT_CONFIG} from "../../config/bleakConfig";

// Helper component to render individual questions - clean and simple!
function TestQuestion({
  question,
  value,
  onChange,
  questionIndex
}: {
  question: any;
  value: string;
  onChange: (value: string) => void;
  questionIndex: number;
}) {
  // Create resolver from config - single source of truth!
  const {resolve} = createResolverFromConfig(BLEAK_ELEMENT_CONFIG, {
    fallbackComponent: "radio"
  });

  // Convert question format to proper BleakElement format
  const element = {
    type: question.type,
    text: question.text || question.question, // Support both formats
    options: question.options
  };

  // Resolve and get the component directly
  const {Component, props} = resolve(element, value, onChange, questionIndex);

  if (!Component) {
    console.error(`No component found for question type: ${question.type}`);
    return <div>Error: Unknown question type</div>;
  }

  // Clean, simple rendering - Debug info for IDs
  console.log(`Question ${questionIndex}: Props:`, props);

  return <Component {...props} />;
}

export const TestBleakAI: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const testQuestions = [
    {
      type: "text",
      text: "What's your company name?"
    },
    {
      type: "radio",
      text: "What's your business size?",
      options: ["Small (1-10)", "Medium (11-50)", "Large (50+)"]
    },
    {
      type: "radio",
      text: "What's your industry?",
      options: ["Technology", "Healthcare", "Finance", "Retail"]
    },
    {
      type: "radio",
      text: "What's your priority?",
      options: ["Cost", "Quality", "Speed", "Features"]
    },
    {
      type: "multi_select",
      text: "Which features do you need?",
      options: ["Analytics", "Reporting", "Integration", "Support"]
    },
    {
      type: "slider",
      text: "What's your budget range? (in thousands)",
      options: ["1", "100"]
    }
  ];

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [question]: value
    }));
  };

  const handleSubmit = () => {
    console.log("Submitted answers:", answers);
    alert("Check console for submitted answers");
  };

  const handleReset = () => {
    setAnswers({});
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">BleakAI Test Form</h1>
        <p className="text-muted-foreground mb-6">
          Test the question rendering system with multiple radio questions to
          verify unique ID generation.
        </p>

        <div className="space-y-6">
          {testQuestions.map((question, index) => (
            <div key={index}>
              <TestQuestion
                question={question}
                value={answers[question.text] || ""}
                onChange={(value: string) =>
                  handleAnswerChange(question.text, value)
                }
                questionIndex={index}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-6">
          <Button onClick={handleSubmit} className="flex-1">
            Submit Answers
          </Button>
          <Button onClick={handleReset} variant="outline">
            Reset
          </Button>
        </div>

        {Object.keys(answers).length > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Current State:</h3>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(answers, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
};
