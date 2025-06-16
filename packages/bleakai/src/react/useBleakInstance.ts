import {useState, useRef, useEffect} from "react";
import {Question, AnsweredQuestion} from "../chat/types";
import {Bleak, BleakConfig} from "../chat/Bleak";

export interface UseBleakInstanceReturn {
  bleak: Bleak | null;
  isLoading: boolean;
  error: string | null;
  questions: Question[];
  answers: Record<string, string>;
  finalAnswer: string | null;
  isComplete: boolean;
  ask: (prompt: string) => Promise<void>;
  answerQuestion: (question: string, answer: string) => void;
  submitAnswers: () => Promise<void>;
  getComponents: () => any[];
  reset: () => void;
}

/**
 * React hook for using Bleak with automatic state management
 */
export function useBleakInstance(config: BleakConfig): UseBleakInstanceReturn {
  const bleakRef = useRef<Bleak | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize Bleak instance
  useEffect(() => {
    bleakRef.current = new Bleak(config);
  }, [config]);

  const ask = async (prompt: string) => {
    if (!bleakRef.current) return;

    setIsLoading(true);
    setError(null);
    setFinalAnswer(null);
    setIsComplete(false);
    setAnswers({});

    try {
      const result = await bleakRef.current.start(prompt);

      if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions);
      } else if (result.answer) {
        setFinalAnswer(result.answer);
        setIsComplete(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const answerQuestion = (question: string, answer: string) => {
    setAnswers((prev) => ({...prev, [question]: answer}));
  };

  const submitAnswers = async () => {
    if (!bleakRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await bleakRef.current.complete(answers);
      setFinalAnswer(result);
      setIsComplete(true);
      setQuestions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getComponents = () => {
    if (!bleakRef.current || questions.length === 0) return [];
    return bleakRef.current.getComponents(questions);
  };

  const reset = () => {
    bleakRef.current?.reset();
    setQuestions([]);
    setAnswers({});
    setFinalAnswer(null);
    setIsComplete(false);
    setError(null);
    setIsLoading(false);
  };

  return {
    bleak: bleakRef.current,
    isLoading,
    error,
    questions,
    answers,
    finalAnswer,
    isComplete,
    ask,
    answerQuestion,
    submitAnswers,
    getComponents,
    reset
  };
}
