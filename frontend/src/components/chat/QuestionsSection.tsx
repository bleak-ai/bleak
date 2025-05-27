import {Loader} from "lucide-react";
import {Button} from "../ui/button";
import {RadioQuestion} from "./RadioQuestion";
import {TextQuestion} from "./TextQuestion";
import type {
  InteractiveQuestion,
  AnsweredQuestion
} from "../../api/interactiveApi";

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
  noMoreQuestionsMessage
}: QuestionsSectionProps) => {
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
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={index}>
            {question.type === "radio" && question.options ? (
              <RadioQuestion
                question={question.question}
                options={question.options}
                value={answers[question.question] || ""}
                onChange={(value) => onAnswerChange(question.question, value)}
                questionIndex={index}
              />
            ) : (
              <TextQuestion
                question={question.question}
                value={answers[question.question] || ""}
                onChange={(value) => onAnswerChange(question.question, value)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Choice buttons */}
      <div className="space-y-3">
        {noMoreQuestionsAvailable ? (
          // Show only final answer option when no more questions are available
          <div className="space-y-3">
            {noMoreQuestionsMessage && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-blue-800 text-sm">
                  {noMoreQuestionsMessage}
                </p>
              </div>
            )}
            <Button
              onClick={() => onChoice("final_answer")}
              disabled={!allQuestionsAnswered || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Get Final Answer"
              )}
            </Button>
          </div>
        ) : (
          // Show both options when more questions might be available
          <div className="flex gap-3">
            <Button
              onClick={() => onChoice("final_answer")}
              disabled={!allQuestionsAnswered || isLoading}
              className="flex-1"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Get Final Answer"
              )}
            </Button>

            <Button
              onClick={() => onChoice("more_questions")}
              disabled={!allQuestionsAnswered || isLoading}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Ask More Questions"
              )}
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          {noMoreQuestionsAvailable
            ? "Ready to provide your answer based on the information gathered."
            : 'Choose "Get Final Answer" to proceed, or "Ask More Questions" for additional clarification'}
        </p>
      </div>
    </div>
  );
};
