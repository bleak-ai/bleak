import React from "react";
import {PromptForm} from "../utils/PromptForm";

interface ChatInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  prefilledPrompt?: string;
  apiKey?: string | null;
  onApiKeyChange: (key: string | null) => void;
  error?: Error | null;
}

export const ChatInput = ({
  onSubmit,
  isLoading,
  prefilledPrompt = "",
  error
}: ChatInputProps) => {
  return (
    <div className="space-y-6">
      <PromptForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        prefilledPrompt={prefilledPrompt}
      />

      {error && (
        <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
          <p className="text-destructive text-sm">
            <strong>Error:</strong> {error.message}
          </p>
        </div>
      )}
    </div>
  );
};
