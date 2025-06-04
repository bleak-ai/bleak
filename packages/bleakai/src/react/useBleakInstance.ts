import {useState, useCallback} from "react";
import type {Bleak} from "../chat/Bleak";
import type {InteractiveQuestion, AnsweredQuestion} from "../chat/types";

export interface UseBleakInstanceResult {
  ask: (prompt: string) => Promise<void>;
  continue: (
    answers: AnsweredQuestion[] | Record<string, string>
  ) => Promise<void>;
  finish: (answers?: AnsweredQuestion[]) => Promise<void>;
  reset: () => void;

  // State
  questions: InteractiveQuestion[] | null;
  answer: string | null;
  isLoading: boolean;
  error: Error | null;

  // Helpers
  renderQuestions: (questions: InteractiveQuestion[]) => any[];
}

export function useBleakInstance(bleakInstance: Bleak): UseBleakInstanceResult {
  const [questions, setQuestions] = useState<InteractiveQuestion[] | null>(
    null
  );
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const ask = useCallback(
    async (prompt: string) => {
      setIsLoading(true);
      setError(null);
      setQuestions(null);
      setAnswer(null);

      try {
        const result = await bleakInstance.ask(prompt, {
          onQuestions: async (questions) => {
            setQuestions(questions);
            setIsLoading(false);

            // Return a promise that resolves when user submits answers
            return new Promise((resolve) => {
              // This will be resolved by the continue function
              (window as any).__bleakResolveAnswers = resolve;
            });
          }
        });

        setAnswer(result);
        setQuestions(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [bleakInstance]
  );

  const continueConversation = useCallback(
    async (answers: AnsweredQuestion[] | Record<string, string>) => {
      setIsLoading(true);
      setError(null);

      try {
        // Resolve the pending promise from ask()
        if ((window as any).__bleakResolveAnswers) {
          (window as any).__bleakResolveAnswers(
            Array.isArray(answers)
              ? answers
              : Object.entries(answers).map(([question, answer]) => ({
                  question,
                  answer
                }))
          );
          delete (window as any).__bleakResolveAnswers;
        }
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    },
    []
  );

  const finish = useCallback(
    async (finalAnswers: AnsweredQuestion[] = []) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await bleakInstance.finish(finalAnswers);
        setAnswer(result);
        setQuestions(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [bleakInstance]
  );

  const reset = useCallback(() => {
    bleakInstance.reset();
    setQuestions(null);
    setAnswer(null);
    setError(null);
    setIsLoading(false);
  }, [bleakInstance]);

  const renderQuestions = useCallback(
    (questions: InteractiveQuestion[]) => {
      return bleakInstance.renderQuestions(questions);
    },
    [bleakInstance]
  );

  return {
    ask,
    continue: continueConversation,
    finish,
    reset,
    questions,
    answer,
    isLoading,
    error,
    renderQuestions
  };
}
