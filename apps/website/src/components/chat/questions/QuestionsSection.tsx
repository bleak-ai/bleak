import {Loader} from "lucide-react";
import {Button} from "../../ui/button";
import {createResolverFromConfig} from "bleakai";
import type {
  InteractiveQuestion,
  AnsweredQuestion
} from "../../../api/interactiveApi";
import {BLEAK_ELEMENT_CONFIG} from "../../../config/bleakConfig";
import type {CustomBleakElementConfig} from "../config/BleakConfigEditor";

interface BleakElementsSectionProps {
  questions: InteractiveQuestion[];
  answers: Record<string, string>;
  onAnswerChange: (question: string, value: string) => void;
  onChoice: (choice: "more_questions" | "final_answer") => void;
  isLoading: boolean;
  allQuestionsAnswered: boolean;
  previousAnswers?: AnsweredQuestion[];
  noMoreQuestionsAvailable?: boolean;
  noMoreQuestionsMessage?: string;
  customConfig?: CustomBleakElementConfig | null;
}

// Dynamic component that creates proper bleak elements based on config
const DynamicBleakElement = ({
  question,
  value,
  onChange,
  questionIndex
}: {
  question: InteractiveQuestion;
  value: string;
  onChange: (value: string) => void;
  questionIndex: number;
}) => {
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
    return <Component {...props} />;
  } catch (error) {
    console.error("Error resolving bleak element:", error);
    return (
      <div className="text-red-600 text-sm">
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
  allQuestionsAnswered,
  previousAnswers,
  noMoreQuestionsAvailable = false,
  noMoreQuestionsMessage,
  customConfig
}: BleakElementsSectionProps) => {
  // Get active element types for display
  const getActiveElementTypes = () => {
    if (!customConfig) return null;

    const activeTypes = Object.entries(customConfig)
      .filter(([_, config]) => config.enabled)
      .map(([_type, config]) => config.name);

    return activeTypes.length > 0 ? activeTypes : null;
  };

  const activeTypes = getActiveElementTypes();

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-light text-neutral-900">
            Help me understand better
          </h2>
          <div className="space-y-2">
            <p className="text-neutral-600">
              Please answer these questions to get a more personalized response
            </p>
            {previousAnswers && previousAnswers.length > 0 && (
              <p className="text-xs text-neutral-500">
                Building on your previous {previousAnswers.length} answer(s)
              </p>
            )}
            {activeTypes && (
              <p className="text-xs text-neutral-500">
                Using custom element types: {activeTypes.join(", ")}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={index} className="space-y-3">
              <DynamicBleakElement
                question={question}
                value={answers[question.question] || ""}
                onChange={(value: string) =>
                  onAnswerChange(question.question, value)
                }
                questionIndex={index}
              />
              {index < questions.length - 1 && (
                <div className="w-full h-px bg-neutral-200"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Choice buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {!noMoreQuestionsAvailable && (
          <Button
            onClick={() => onChoice("more_questions")}
            variant="outline"
            disabled={!allQuestionsAnswered || isLoading}
            className="flex-1 border-neutral-300 text-neutral-900 hover:bg-neutral-50 py-3 text-base font-medium"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Getting more questions...
              </>
            ) : (
              "Ask more questions"
            )}
          </Button>
        )}

        <Button
          onClick={() => onChoice("final_answer")}
          disabled={!allQuestionsAnswered || isLoading}
          className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white py-3 text-base font-medium"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Generating answer...
            </>
          ) : (
            "Get my answer"
          )}
        </Button>
      </div>

      {/* No more questions message */}
      {noMoreQuestionsAvailable && noMoreQuestionsMessage && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">{noMoreQuestionsMessage}</p>
        </div>
      )}
    </div>
  );
};
