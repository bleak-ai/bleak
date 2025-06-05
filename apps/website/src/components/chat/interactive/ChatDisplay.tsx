import React from "react";
import type {InteractiveQuestion} from "bleakai";

interface ChatDisplayProps {
  questions: InteractiveQuestion[];
  answers: Record<string, string>;
  finalAnswer: string | null;
  isLoading: boolean;
  error?: Error | null;
  onAnswerChange: (question: string, value: string) => void;
  onMoreQuestions: () => void;
  onGetAnswer: () => void;
  onReset: () => void;
  renderQuestions: (
    questions: InteractiveQuestion[],
    answers: Record<string, string>,
    onAnswerChange: (question: string, value: string) => void
  ) => React.ReactElement[];
}

const LoadingSpinner = () => (
  <div className="text-center py-8">
    <div className="inline-flex items-center gap-2 text-muted-foreground">
      <div className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin"></div>
      Processing...
    </div>
  </div>
);

const ErrorMessage = ({error}: {error: Error}) => (
  <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
    <p className="text-destructive text-sm">
      <strong>Error:</strong> {error.message}
    </p>
  </div>
);

const Questions = ({
  questions,
  answers,
  onAnswerChange,
  onMoreQuestions,
  onGetAnswer,
  renderQuestions,
  allAnswered
}: {
  questions: InteractiveQuestion[];
  answers: Record<string, string>;
  onAnswerChange: (question: string, value: string) => void;
  onMoreQuestions: () => void;
  onGetAnswer: () => void;
  renderQuestions: (
    questions: InteractiveQuestion[],
    answers: Record<string, string>,
    onAnswerChange: (question: string, value: string) => void
  ) => React.ReactElement[];
  allAnswered: boolean;
}) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-2xl font-light text-foreground mb-2">
        Help me understand better
      </h2>
      <p className="text-muted-foreground">
        Answer these questions for a personalized response
      </p>
    </div>

    <div className="space-y-6">
      {renderQuestions(questions, answers, onAnswerChange)}
    </div>

    <div className="flex gap-3">
      <button
        onClick={onMoreQuestions}
        disabled={!allAnswered}
        className="flex-1 px-6 py-3 border border-border rounded-lg bg-background text-foreground hover:bg-accent disabled:opacity-50 transition-all duration-200"
      >
        I need to provide more details
      </button>
      <button
        onClick={onGetAnswer}
        disabled={!allAnswered}
        className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all duration-200"
      >
        Get My Answer
      </button>
    </div>
  </div>
);

const Answer = ({answer, onReset}: {answer: string; onReset: () => void}) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-2xl font-light text-foreground mb-6">Answer</h2>
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
      className="px-8 py-3 border border-border rounded-lg bg-background text-foreground hover:bg-accent transition-all duration-200"
    >
      Ask Another Question
    </button>
  </div>
);

export const ChatDisplay = ({
  questions,
  answers,
  finalAnswer,
  isLoading,
  error,
  onAnswerChange,
  onMoreQuestions,
  onGetAnswer,
  onReset,
  renderQuestions
}: ChatDisplayProps) => {
  const allAnswered = questions.every((q) => answers[q.question]?.trim());

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {error && <ErrorMessage error={error} />}

      {questions.length > 0 && (
        <Questions
          questions={questions}
          answers={answers}
          onAnswerChange={onAnswerChange}
          onMoreQuestions={onMoreQuestions}
          onGetAnswer={onGetAnswer}
          renderQuestions={renderQuestions}
          allAnswered={allAnswered}
        />
      )}

      {finalAnswer && <Answer answer={finalAnswer} onReset={onReset} />}

      {isLoading && <LoadingSpinner />}
    </div>
  );
};
