import {useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {
  startInteractiveSession,
  makeInteractiveChoice,
  type InteractiveResponse,
  type AnsweredQuestion,
  type InteractiveQuestion
} from "../../api/interactiveApi";
import {PromptForm} from "./PromptForm";
import {QuestionsSection} from "./QuestionsSection";
import {AnswerSection} from "./AnswerSection";
import {ErrorDisplay} from "./ErrorDisplay";

export const SimpleInteractive = () => {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InteractiveQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [allAnsweredQuestions, setAllAnsweredQuestions] = useState<
    AnsweredQuestion[]
  >([]);
  const [previousAnswers, setPreviousAnswers] = useState<AnsweredQuestion[]>(
    []
  );
  const [noMoreQuestionsAvailable, setNoMoreQuestionsAvailable] =
    useState(false);
  const [noMoreQuestionsMessage, setNoMoreQuestionsMessage] =
    useState<string>("");

  // Start session mutation
  const startMutation = useMutation<InteractiveResponse, Error, string>({
    mutationFn: startInteractiveSession,
    onSuccess: (data) => {
      setThreadId(data.thread_id);
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnswers({});
        setPreviousAnswers([]);
        setNoMoreQuestionsAvailable(false);
        setNoMoreQuestionsMessage("");
      } else if (data.answer) {
        setFinalAnswer(data.answer);
      }
    }
  });

  // Choice mutation
  const choiceMutation = useMutation<
    InteractiveResponse,
    Error,
    {
      threadId: string;
      answeredQuestions: AnsweredQuestion[];
      choice: "more_questions" | "final_answer";
    }
  >({
    mutationFn: ({threadId, answeredQuestions, choice}) =>
      makeInteractiveChoice(threadId, answeredQuestions, choice),
    onSuccess: (data) => {
      if (data.status === "completed" && data.answer) {
        // Final answer received
        setFinalAnswer(data.answer);
        setQuestions([]);
        setAllAnsweredQuestions((prev) => [
          ...prev,
          ...getCurrentAnsweredQuestions()
        ]);
        setNoMoreQuestionsAvailable(false);
        setNoMoreQuestionsMessage("");
      } else if (data.status === "no_more_questions") {
        // No more questions available, show message and only final answer option
        setNoMoreQuestionsAvailable(true);
        setNoMoreQuestionsMessage(
          data.message ||
            "I have enough information to provide a comprehensive answer."
        );
      } else if (data.questions && data.questions.length > 0) {
        // More questions received
        const currentAnswered = getCurrentAnsweredQuestions();
        setPreviousAnswers((prev) => [...prev, ...currentAnswered]);
        setAllAnsweredQuestions((prev) => [...prev, ...currentAnswered]);
        setQuestions(data.questions);
        setAnswers({});
        setNoMoreQuestionsAvailable(false);
        setNoMoreQuestionsMessage("");
      }
    }
  });

  const isLoading = startMutation.isPending || choiceMutation.isPending;
  const error = startMutation.error || choiceMutation.error;

  const getCurrentAnsweredQuestions = (): AnsweredQuestion[] => {
    return questions
      .map((q) => {
        const answer = answers[q.question];
        if (answer && answer.trim()) {
          return {question: q.question, answer: answer.trim()};
        }
        return null;
      })
      .filter((item): item is AnsweredQuestion => item !== null);
  };

  const handlePromptSubmit = (prompt: string) => {
    startMutation.mutate(prompt);
  };

  const handleChoice = (choice: "more_questions" | "final_answer") => {
    if (!threadId || isLoading) return;

    const answeredQuestions = getCurrentAnsweredQuestions();
    if (answeredQuestions.length > 0) {
      choiceMutation.mutate({threadId, answeredQuestions, choice});
    }
  };

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers((prev) => ({...prev, [question]: value}));
  };

  const reset = () => {
    setThreadId(null);
    setQuestions([]);
    setAnswers({});
    setFinalAnswer(null);
    setAllAnsweredQuestions([]);
    setPreviousAnswers([]);
    setNoMoreQuestionsAvailable(false);
    setNoMoreQuestionsMessage("");
  };

  const allQuestionsAnswered = questions.every((q) =>
    answers[q.question]?.trim()
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
        <p className="text-muted-foreground">
          Ask me anything, and I'll help you find the answer
        </p>
      </div>

      {/* Initial Prompt */}
      {!threadId && (
        <PromptForm onSubmit={handlePromptSubmit} isLoading={isLoading} />
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <QuestionsSection
          questions={questions}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          onChoice={handleChoice}
          isLoading={isLoading}
          allQuestionsAnswered={allQuestionsAnswered}
          previousAnswers={previousAnswers}
          noMoreQuestionsAvailable={noMoreQuestionsAvailable}
          noMoreQuestionsMessage={noMoreQuestionsMessage}
        />
      )}

      {/* Final Answer */}
      {finalAnswer && (
        <AnswerSection
          answer={finalAnswer}
          answeredQuestions={allAnsweredQuestions}
          onReset={reset}
        />
      )}

      {/* Loading */}
      {/* {isLoading && <LoadingSpinner />} */}

      {/* Error */}
      {error && <ErrorDisplay error={error} />}
    </div>
  );
};
