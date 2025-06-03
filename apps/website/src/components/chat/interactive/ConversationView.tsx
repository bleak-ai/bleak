import React from "react";
import {QuestionsSection} from "../questions/QuestionsSection";
import {AnswerSection} from "../utils/AnswerSection";
import {ErrorDisplay} from "../utils/ErrorDisplay";
import type {BleakElementConfig} from "bleakai";
import type {InteractiveQuestion, AnsweredQuestion} from "bleakai";

interface ConversationViewProps {
  questions: InteractiveQuestion[];
  answers: Record<string, string>;
  finalAnswer: string | null;
  allAnsweredQuestions: AnsweredQuestion[];
  previousAnswers: AnsweredQuestion[];
  isLoading: boolean;
  allQuestionsAnswered: boolean;
  customConfig?: BleakElementConfig | null;
  error?: Error | null;
  onAnswerChange: (question: string, value: string) => void;
  onChoice: (choice: "more_questions" | "final_answer") => void;
  onReset: () => void;
}

export const ConversationView = ({
  questions,
  answers,
  finalAnswer,
  allAnsweredQuestions,
  previousAnswers,
  isLoading,
  allQuestionsAnswered,
  customConfig,
  error,
  onAnswerChange,
  onChoice,
  onReset
}: ConversationViewProps) => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Conversation History */}
      <div className="flex-1 p-6 space-y-8 overflow-y-auto max-w-4xl mx-auto w-full">
        {/* Questions */}
        {questions.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4 text-foreground">
              Questions ({questions.length})
            </h3>
            <QuestionsSection
              questions={questions}
              answers={answers}
              onAnswerChange={onAnswerChange}
              onChoice={onChoice}
              isLoading={isLoading}
              allQuestionsAnswered={allQuestionsAnswered}
              previousAnswers={previousAnswers}
              customConfig={customConfig}
            />
          </div>
        )}

        {/* Final Answer */}
        {finalAnswer && (
          <AnswerSection
            answer={finalAnswer}
            answeredQuestions={allAnsweredQuestions}
            onReset={onReset}
          />
        )}

        {/* Errors */}
        {error && <ErrorDisplay error={error} />}

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin"></div>
              Processing your request...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
