import {useState} from "react";
import {PromptForm} from "../utils/PromptForm";

interface ChatWelcomeProps {
  onPromptSubmit: (prompt: string) => void;
  isLoading: boolean;
  prefilledPrompt?: string;
  apiKey?: string | null;
  onApiKeyChange: (key: string | null) => void;
  error?: Error | null;
}

export const ChatWelcome = ({
  onPromptSubmit,
  isLoading,
  prefilledPrompt = "",
  apiKey,
  onApiKeyChange,
  error
}: ChatWelcomeProps) => {
  return (
    <div className="space-y-6">
      <PromptForm
        onSubmit={onPromptSubmit}
        isLoading={isLoading}
        prefilledPrompt={prefilledPrompt}
      />

      {error && apiKey && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error.message}
        </div>
      )}
    </div>
  );
};
