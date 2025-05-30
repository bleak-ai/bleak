import {Loader} from "lucide-react";
import {Button} from "../../ui/button";
import {createResolverFromConfig} from "@bleakai/core";
import type {
  InteractiveQuestion,
  AnsweredQuestion
} from "../../../api/interactiveApi";
import {QUESTION_CONFIG} from "../../../config/questionConfig";
import type {CustomQuestionConfig} from "../config/QuestionConfigEditor";

interface QuestionsSectionProps {
  questions: InteractiveQuestion[];
  answers: Record<string, string>;
  onAnswerChange: (question: string, value: string) => void;
  onChoice: (choice: "more_questions" | "final_answer") => void;
  isLoading: boolean;
  allQuestionsAnswered: boolean;
  previousAnswers?: AnsweredQuestion[];
  noMoreQuestionsAvailable?: boolean;
  noMoreQuestionsMessage?: string;
  customConfig?: CustomQuestionConfig | null;
}

// Helper component to render individual questions - much simpler now!
function DynamicQuestion({
  question,
  value,
  onChange,
  questionIndex
}: {
  question: InteractiveQuestion;
  value: string;
  onChange: (value: string) => void;
  questionIndex: number;
}) {
  const {resolve} = createResolverFromConfig(QUESTION_CONFIG, {
    fallbackComponent: "radio"
  });

  // Resolve and get the component directly
  const {Component, props} = resolve(
    {
      type: question.type,
      question: question.question,
      options: question.options || undefined
    },
    value,
    onChange,
    questionIndex
  );

  if (!Component) {
    console.error(`No component found for question type: ${question.type}`);
    return <div>Error: Unknown question type</div>;
  }

  return <Component {...props} />;
}

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
}: QuestionsSectionProps) => {
  // Get active question types for display
  const getActiveQuestionTypes = () => {
    if (!customConfig) return null;

    const activeTypes = Object.entries(customConfig)
      .filter(([_, config]) => config.enabled)
      .map(([_type, config]) => config.name);

    return activeTypes.length > 0 ? activeTypes : null;
  };

  const activeTypes = getActiveQuestionTypes();

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">
          Help me understand better
        </h2>
        <p className="text-muted-foreground text-sm">
          Please answer these questions to get a more personalized response
        </p>
        {previousAnswers && previousAnswers.length > 0 && (
          <p className="text-muted-foreground text-xs">
            Building on your previous {previousAnswers.length} answer(s)
          </p>
        )}
        {activeTypes && (
          <p className="text-muted-foreground text-xs">
            Using custom question types: {activeTypes.join(", ")}
          </p>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={index}>
            <DynamicQuestion
              question={question}
              value={answers[question.question] || ""}
              onChange={(value: string) =>
                onAnswerChange(question.question, value)
              }
              questionIndex={index}
            />
          </div>
        ))}
      </div>

      {/* Choice buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
        {!noMoreQuestionsAvailable && (
          <Button
            onClick={() => onChoice("more_questions")}
            variant="outline"
            disabled={!allQuestionsAnswered || isLoading}
            className="flex-1"
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
          className="flex-1"
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
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">{noMoreQuestionsMessage}</p>
        </div>
      )}
    </div>
  );
};
