import React from "react";
import {Loader} from "lucide-react";
import {Button} from "../../ui/button";
import type {BleakQuestion} from "bleakai";
import {BLEAK_ELEMENT_CONFIG} from "../../../config/bleakConfig";

interface BleakElementsSectionProps {
  questions: BleakQuestion[];
  answers: Record<string, string>;
  onAnswerChange: (question: string, value: string) => void;
  onChoice: (choice: "more_questions" | "final_answer") => void;
  isLoading: boolean;
  allQuestionsAnswered: boolean; // Still needed for interface compatibility
  customConfig?: typeof BLEAK_ELEMENT_CONFIG | null;
  bleak?: {
    resolveComponents: (questions: BleakQuestion[]) => Array<{
      Component: React.ComponentType<any>;
      staticProps: {
        text: string;
        options?: string[] | null;
        uniqueId: string;
        elementIndex: number;
      };
      question: BleakQuestion;
    }>;
  };
}

// Fallback component renderer using custom config
const FallbackBleakElement = ({
  question,
  value,
  onChange,
  questionIndex,
  config
}: {
  question: BleakQuestion;
  value: string;
  onChange: (value: string) => void;
  questionIndex: number;
  config: typeof BLEAK_ELEMENT_CONFIG;
}) => {
  const elementConfig = config[question.type as keyof typeof config];

  if (!elementConfig) {
    console.error(`No component configured for type: ${question.type}`);
    return (
      <div className="text-destructive text-sm">
        Error rendering question: {question.question}
      </div>
    );
  }

  const Component = elementConfig.component;

  return (
    <Component
      text={question.question}
      options={question.options || []}
      value={value}
      onChange={onChange}
      uniqueId={`bleak-${question.type}-${questionIndex}`}
      elementIndex={questionIndex}
    />
  );
};

export const QuestionsSection = ({
  questions,
  answers,
  onAnswerChange,
  onChoice,
  isLoading,
  customConfig,
  bleak
}: BleakElementsSectionProps) => {
  // Check if all questions have been answered
  const allAnswered = questions.every((q) => answers[q.question]?.trim());

  // Get active element types for display
  const getActiveElementTypes = () => {
    if (!customConfig) return null;

    const activeTypes = Object.keys(customConfig);
    return activeTypes.length > 0 ? activeTypes : null;
  };

  const activeTypes = getActiveElementTypes();

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-light text-foreground">
            Help me understand better
          </h2>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Please answer these questions to get a more personalized response
            </p>
            {activeTypes && (
              <p className="text-xs text-muted-foreground">
                Using custom element types: {activeTypes.join(", ")}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {bleak
            ? // Use the new resolveComponents approach from BleakSession
              bleak
                .resolveComponents(questions)
                .map(({Component, staticProps, question}, index) => (
                  <div key={question.question} className="space-y-3">
                    <Component
                      {...staticProps}
                      value={answers[question.question] || ""}
                      onChange={(value: string) =>
                        onAnswerChange(question.question, value)
                      }
                    />
                    {index < questions.length - 1 && (
                      <div className="w-full h-px bg-border"></div>
                    )}
                  </div>
                ))
            : // Fallback to custom config approach if bleak session not available
              questions.map((question, index) => (
                <div key={index} className="space-y-3">
                  <FallbackBleakElement
                    question={question}
                    value={answers[question.question] || ""}
                    onChange={(value: string) =>
                      onAnswerChange(question.question, value)
                    }
                    questionIndex={index}
                    config={customConfig || BLEAK_ELEMENT_CONFIG}
                  />
                  {index < questions.length - 1 && (
                    <div className="w-full h-px bg-border"></div>
                  )}
                </div>
              ))}
        </div>
      </div>

      {/* Choice buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => onChoice("more_questions")}
          variant="outline"
          disabled={!allAnswered || isLoading}
          className="flex-1 py-3 text-base font-medium"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Getting more questions...
            </>
          ) : (
            "I need to provide more details"
          )}
        </Button>

        <Button
          onClick={() => onChoice("final_answer")}
          disabled={!allAnswered || isLoading}
          className="flex-1 py-3 text-base font-medium"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Generating answer...
            </>
          ) : (
            "Get My Answer"
          )}
        </Button>
      </div>
    </div>
  );
};
