import {useState, type FormEvent} from "react";
import {useMutation} from "@tanstack/react-query";
import {Loader} from "lucide-react";
import {Button} from "../ui/button";
import {Textarea} from "../ui/textarea";
import {Label} from "../ui/label";
import {RadioGroup, RadioGroupItem} from "../ui/radio-group";
import {
  startInteractiveSession,
  resumeInteractiveSession,
  type InteractiveResponse,
  type AnsweredQuestion,
  type InteractiveQuestion
} from "../../api/interactiveApi";

export const SimpleInteractive = () => {
  const [prompt, setPrompt] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InteractiveQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);

  // Start session mutation
  const startMutation = useMutation<InteractiveResponse, Error, string>({
    mutationFn: startInteractiveSession,
    onSuccess: (data) => {
      setThreadId(data.thread_id);
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnswers({});
      } else if (data.answer) {
        setFinalAnswer(data.answer);
      }
    }
  });

  // Resume session mutation
  const resumeMutation = useMutation<
    InteractiveResponse,
    Error,
    {threadId: string; answeredQuestions: AnsweredQuestion[]}
  >({
    mutationFn: ({threadId, answeredQuestions}) =>
      resumeInteractiveSession(threadId, answeredQuestions),
    onSuccess: (data) => {
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnswers({});
      } else if (data.answer) {
        setFinalAnswer(data.answer);
        setQuestions([]);
      }
    }
  });

  const isLoading = startMutation.isPending || resumeMutation.isPending;
  const error = startMutation.error || resumeMutation.error;

  const handlePromptSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      startMutation.mutate(prompt.trim());
    }
  };

  const handleAnswersSubmit = () => {
    if (!threadId || isLoading) return;

    const answeredQuestions: AnsweredQuestion[] = questions
      .map((q) => {
        const answer = answers[q.question];
        if (answer && answer.trim()) {
          return {question: q.question, answer: answer.trim()};
        }
        return null;
      })
      .filter((item): item is AnsweredQuestion => item !== null);

    if (answeredQuestions.length > 0) {
      resumeMutation.mutate({threadId, answeredQuestions});
    }
  };

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers((prev) => ({...prev, [question]: value}));
  };

  const reset = () => {
    setPrompt("");
    setThreadId(null);
    setQuestions([]);
    setAnswers({});
    setFinalAnswer(null);
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
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm text-gray-100">
          <form onSubmit={handlePromptSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-base font-medium">
                What would you like to know?
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your question here..."
                rows={4}
                className="resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Ask Question"
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">
              Help me understand better
            </h2>
            <p className="text-muted-foreground text-sm">
              Please answer these questions to get a more personalized response
            </p>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={index} className="space-y-3">
                <Label className="text-base font-medium text-foreground">
                  {question.question}
                </Label>

                {question.type === "radio" && question.options ? (
                  <RadioGroup
                    value={answers[question.question] || ""}
                    onValueChange={(value) =>
                      handleAnswerChange(question.question, value)
                    }
                    className="space-y-3"
                  >
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className="flex items-center space-x-3 p-3 rounded-md  hover:bg-muted/50 transition-colors"
                      >
                        <RadioGroupItem
                          value={option}
                          id={`${index}-${optIndex}`}
                        />
                        <Label
                          htmlFor={`${index}-${optIndex}`}
                          className="cursor-pointer text-sm flex-1 leading-relaxed"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <Textarea
                    value={answers[question.question] || ""}
                    onChange={(e) =>
                      handleAnswerChange(question.question, e.target.value)
                    }
                    placeholder="Type your answer here..."
                    rows={3}
                    className="resize-none"
                  />
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={handleAnswersSubmit}
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
              "Submit Answers"
            )}
          </Button>
        </div>
      )}

      {/* Final Answer */}
      {finalAnswer && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Answer</h2>
            <div className="bg-muted/50 border border-border rounded-md p-4">
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {finalAnswer}
              </div>
            </div>
          </div>

          <Button
            onClick={reset}
            variant="secondary"
            className="w-full"
            size="lg"
          >
            Ask Another Question
          </Button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-3">
            <Loader className="w-5 h-5 animate-spin text-primary" />
            <span className="text-muted-foreground font-medium">
              Processing your request...
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center mt-0.5">
              <span className="text-xs text-destructive font-bold">!</span>
            </div>
            <div className="space-y-1">
              <p className="text-destructive font-medium text-sm">
                Something went wrong
              </p>
              <p className="text-destructive/80 text-sm">{error.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
