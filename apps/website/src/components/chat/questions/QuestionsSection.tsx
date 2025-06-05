import React from "react";
import {Loader} from "lucide-react";
import {Button} from "../../ui/button";
import {createResolverFromConfig} from "bleakai";
import type {BleakElementConfig, InteractiveQuestion} from "bleakai";
import {BLEAK_ELEMENT_CONFIG} from "../../../config/bleakConfig";

// Use the proper types from bleakai
type InteractiveQuestionType = InteractiveQuestion;

interface BleakElementsSectionProps {
  questions: InteractiveQuestionType[];
  answers: Record<string, string>;
  onAnswerChange: (question: string, value: string) => void;
  onChoice: (choice: "more_questions" | "final_answer") => void;
  isLoading: boolean;
  allQuestionsAnswered: boolean; // Still needed for interface compatibility
  customConfig?: BleakElementConfig | null;
  bleak?: unknown; // Changed from any to unknown
}

// Dynamic component that creates proper bleak elements based on config
const DynamicBleakElement = ({
  question,
  value,
  onChange,
  questionIndex,
  config
}: {
  question: InteractiveQuestionType;
  value: string;
  onChange: (value: string) => void;
  questionIndex: number;
  config: BleakElementConfig;
}) => {
  const {resolve} = createResolverFromConfig(config);

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
    return <Component {...props} />;
  } catch (error) {
    console.error("Error resolving bleak element:", error);
    return (
      <div className="text-destructive text-sm">
        Error rendering question: {question.question}
      </div>
    );
  }
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
          {bleak && typeof bleak === "object" && "getBleakComponents" in bleak
            ? // Use the new getBleakComponents approach from App.tsx
              (
                bleak as {
                  getBleakComponents: (
                    questions: InteractiveQuestionType[],
                    answers: Record<string, string>,
                    onAnswerChange: (question: string, value: string) => void
                  ) => {
                    Component: React.ComponentType<unknown>;
                    props: Record<string, unknown>;
                    key: string;
                  }[];
                }
              )
                .getBleakComponents(questions, answers, onAnswerChange)
                .map(({Component, props, key}) => (
                  <div key={key} className="space-y-3">
                    <Component {...props} />
                    {key !== `question-${questions.length - 1}` && (
                      <div className="w-full h-px bg-border"></div>
                    )}
                  </div>
                ))
            : // Fallback to old approach if bleak session not available
              questions.map((question, index) => (
                <div key={index} className="space-y-3">
                  <DynamicBleakElement
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
