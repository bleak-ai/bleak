import {useState, useEffect} from "react";
import {useMutation} from "@tanstack/react-query";
import {
  startConversation,
  continueConversation,
  finishConversation,
  createSimpleChatClient,
  getChatErrorMessage,
  type ChatResponse,
  type AnsweredQuestion,
  type InteractiveQuestion,
  type ChatBleakElement as BleakElement,
  type BleakElementConfig
} from "bleakai";
import {BleakChat} from "bleakai";

// App-specific configuration (moved from chatApi.ts)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const DEFAULT_TIMEOUT = 30000;

function createAppChatConfig(apiKey?: string) {
  return {
    baseUrl: API_BASE_URL,
    apiKey: apiKey,
    timeout: DEFAULT_TIMEOUT
  };
}

interface UseConversationStateProps {
  initialApiKey?: string | null;
  customConfig?: BleakElementConfig | null;
  onConversationStart?: () => void;
}

export function useConversationState({
  initialApiKey,
  customConfig,
  onConversationStart
}: UseConversationStateProps) {
  const [chatClient, setChatClient] = useState<BleakChat | null>(null);
  const [questions, setQuestions] = useState<InteractiveQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [allAnsweredQuestions, setAllAnsweredQuestions] = useState<
    AnsweredQuestion[]
  >([]);
  const [previousAnswers, setPreviousAnswers] = useState<AnsweredQuestion[]>(
    []
  );
  const [apiKey, setApiKey] = useState<string | null>(initialApiKey || null);

  // Update API key when initialApiKey changes
  useEffect(() => {
    if (initialApiKey && initialApiKey !== apiKey) {
      setApiKey(initialApiKey);
    }
  }, [initialApiKey, apiKey]);

  // Convert custom config to API format
  const getCustomBleakElements = (): BleakElement[] | undefined => {
    if (!customConfig) return undefined;

    return Object.entries(customConfig).map(([name, config]) => ({
      name,
      description: config.description
    }));
  };

  // Start session mutation
  const startMutation = useMutation<
    {response: ChatResponse; client: BleakChat},
    Error,
    string
  >({
    mutationFn: async (prompt: string) => {
      console.log("🚀 Starting conversation with prompt:", prompt);
      console.log("🔧 Custom elements:", getCustomBleakElements());
      console.log("🔑 API key present:", !!apiKey);

      return await startConversation(
        prompt,
        createAppChatConfig(apiKey || undefined),
        {
          bleakElements: getCustomBleakElements()
        }
      );
    },
    onSuccess: ({response, client}) => {
      console.log("✅ Conversation started successfully:", response);

      setChatClient(client);

      // Handle response based on type
      switch (response.type) {
        case "questions":
          setQuestions(response.questions || []);
          setAnswers({});
          setPreviousAnswers([]);
          setFinalAnswer(null);
          break;
        case "answer":
          setFinalAnswer(response.content);
          setQuestions([]);
          break;
        case "clarification":
          setQuestions(response.questions || []);
          setAnswers({});
          setPreviousAnswers([]);
          setFinalAnswer(null);
          break;
        default:
          console.warn("⚠️ Unexpected response type:", response.type);
      }

      onConversationStart?.();
    },
    onError: (error) => {
      console.error("❌ Conversation start error:", error);
    }
  });

  // Choice mutation
  const choiceMutation = useMutation<
    ChatResponse,
    Error,
    {
      answeredQuestions: AnsweredQuestion[];
      choice: "more_questions" | "final_answer";
    }
  >({
    mutationFn: async ({answeredQuestions, choice}) => {
      if (!chatClient) {
        throw new Error("No active chat client");
      }

      if (choice === "final_answer") {
        return await finishConversation(chatClient, answeredQuestions);
      } else {
        return await continueConversation(chatClient, answeredQuestions, true);
      }
    },
    onSuccess: (response) => {
      console.log("✅ Choice response:", response);

      switch (response.type) {
        case "answer":
          setFinalAnswer(response.content);
          setQuestions([]);
          setAllAnsweredQuestions((prev) => [
            ...prev,
            ...getCurrentAnsweredQuestions()
          ]);
          break;
        case "questions":
          const currentAnswered = getCurrentAnsweredQuestions();
          setPreviousAnswers((prev) => [...prev, ...currentAnswered]);
          setAllAnsweredQuestions((prev) => [...prev, ...currentAnswered]);
          setQuestions(response.questions || []);
          setAnswers({});
          break;
        case "clarification":
          const clarificationAnswered = getCurrentAnsweredQuestions();
          setPreviousAnswers((prev) => [...prev, ...clarificationAnswered]);
          setAllAnsweredQuestions((prev) => [
            ...prev,
            ...clarificationAnswered
          ]);
          setQuestions(response.questions || []);
          setAnswers({});
          break;
        default:
          setFinalAnswer(
            response.content ||
              "I have enough information to provide a comprehensive answer."
          );
          setQuestions([]);
      }
    },
    onError: (error) => {
      console.error("❌ Choice error:", error);
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
    // Clear previous state before starting new conversation
    setQuestions([]);
    setAnswers({});
    setFinalAnswer(null);
    setChatClient(null);
    setAllAnsweredQuestions([]);
    setPreviousAnswers([]);

    startMutation.mutate(prompt);
  };

  const handleChoice = (choice: "more_questions" | "final_answer") => {
    if (!questions.length || isLoading) return;

    const answeredQuestions = getCurrentAnsweredQuestions();

    if (answeredQuestions.length > 0) {
      choiceMutation.mutate({answeredQuestions, choice});
    }
  };

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers((prev) => ({...prev, [question]: value}));
  };

  const reset = () => {
    setQuestions([]);
    setAnswers({});
    setFinalAnswer(null);
    setChatClient(null);
    setAllAnsweredQuestions([]);
    setPreviousAnswers([]);
  };

  const allQuestionsAnswered = questions.every((q) =>
    answers[q.question]?.trim()
  );

  return {
    // State
    questions,
    answers,
    finalAnswer,
    allAnsweredQuestions,
    previousAnswers,
    apiKey,
    setApiKey,
    isLoading,
    error,
    allQuestionsAnswered,

    // Actions
    handlePromptSubmit,
    handleChoice,
    handleAnswerChange,
    reset,

    // Error helpers
    getChatErrorMessage
  };
}
