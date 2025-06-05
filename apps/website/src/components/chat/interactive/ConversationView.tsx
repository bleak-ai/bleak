import React from "react";
import {QuestionsSection} from "../questions/QuestionsSection";
import type {BleakElementConfig, InteractiveQuestion} from "bleakai";

// Use the proper types from bleakai
type InteractiveQuestionType = InteractiveQuestion;

interface ConversationViewProps {
  questions: InteractiveQuestionType[];
  answers: Record<string, string>;
  finalAnswer: string | null;
  isLoading: boolean;
  allQuestionsAnswered: boolean;
  customConfig?: BleakElementConfig | null;
  error?: Error | null;
  onAnswerChange: (question: string, value: string) => void;
  onChoice: (choice: "more_questions" | "final_answer") => void;
  onReset: () => void;
  bleak?: unknown;
}

// Simple inline components for ConversationView
const AnswerSection = ({
  answer,
  onReset
}: {
  answer: string;
  onReset: () => void;
}) => (
  <div className="space-y-8">
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-light text-foreground">Answer</h2>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="prose prose-neutral max-w-none text-foreground">
          {answer.split("\n").map((line, index) => (
            <p key={index} className="mb-4 last:mb-0">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>

    <button
      onClick={onReset}
      className="px-8 py-3 text-base font-medium border border-border rounded-lg bg-background text-foreground hover:bg-accent hover:border-ring/50 transition-all duration-200"
    >
      Ask Another Question
    </button>
  </div>
);

const ErrorDisplay = ({error}: {error: Error}) => (
  <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
    <div className="text-sm text-destructive">
      <strong>Something went wrong:</strong>
      <p className="mt-1">{error.message}</p>
    </div>
  </div>
);

export const ConversationView = ({
  questions,
  answers,
  finalAnswer,
  isLoading,
  allQuestionsAnswered,
  customConfig,
  error,
  onAnswerChange,
  onChoice,
  onReset,
  bleak
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
              customConfig={customConfig}
              bleak={bleak}
            />
          </div>
        )}

        {/* Final Answer */}
        {finalAnswer && (
          <AnswerSection answer={finalAnswer} onReset={onReset} />
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
