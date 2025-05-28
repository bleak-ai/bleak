import React, {useState} from "react";
import {
  DynamicQuestionRenderer,
  getSupportedTypes
} from "./DynamicQuestionRenderer";
import {Button} from "../ui/button";
import {Card} from "../ui/card";
import type {InteractiveQuestion} from "../../api/interactiveApi";

export const DynamicDemo: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Demo questions showcasing different available types
  const demoQuestions: InteractiveQuestion[] = [
    {
      type: "slider",
      question: "Rate your experience from 1 to 10",
      options: ["1", "10", "1"] // min, max, step
    },
    {
      type: "multiselect",
      question: "Which programming languages do you know?",
      options: ["JavaScript", "Python", "TypeScript", "Java", "C++", "Go"]
    },
    {
      type: "text",
      question: "What's your preferred development environment?",
      options: ["VS Code", "IntelliJ", "Vim", "Sublime Text", "Atom"]
    },
    {
      type: "radio",
      question: "What's your experience level?",
      options: ["Beginner", "Intermediate", "Advanced", "Expert"]
    }
  ];

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers((prev) => ({...prev, [question]: value}));
  };

  const clearAnswers = () => {
    setAnswers({});
  };

  const supportedTypes = getSupportedTypes();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Dynamic UI Components Demo</h1>
        <p className="text-muted-foreground">
          Frontend now supports specific UI element types with type validation!
        </p>
      </div>

      {/* Supported Types */}
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Supported Component Types:</h3>
        <div className="flex flex-wrap gap-2">
          {supportedTypes.map((type) => (
            <span
              key={type}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
            >
              {type}
            </span>
          ))}
        </div>
      </Card>

      {/* Demo Questions */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Try Different Component Types
          </h2>
          <Button onClick={clearAnswers} variant="outline" size="sm">
            Clear All
          </Button>
        </div>

        {demoQuestions.map((question, index) => (
          <Card key={index} className="p-4">
            <div className="mb-2">
              <span className="text-xs  px-2 py-1 rounded font-mono">
                type: "{question.type}"
              </span>
            </div>
            <DynamicQuestionRenderer
              question={question}
              value={answers[question.question] || ""}
              onChange={(value) => handleAnswerChange(question.question, value)}
              questionIndex={index}
            />
          </Card>
        ))}
      </div>

      {/* Results */}
      {Object.keys(answers).length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Current Answers:</h3>
          <div className="space-y-2">
            {Object.entries(answers).map(([question, answer]) => (
              <div key={question} className="text-sm">
                <strong className="text-blue-600">Q:</strong> {question}
                <br />
                <strong className="text-green-600">A:</strong>{" "}
                {answer || "(empty)"}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-4 bg-green-50 border-green-200">
        <h3 className="font-semibold text-green-800 mb-2">Answers</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>✅ Backend can only send supported UI element types</li>
          <li>✅ Frontend automatically renders the appropriate component</li>
          <li>✅ Easy to add new component types to the registry</li>
          <li>✅ Type-safe with compile-time validation</li>
          <li>✅ Fallback to RadioQuestion for unsupported types</li>
        </ul>
      </Card>
    </div>
  );
};
