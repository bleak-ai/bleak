import {useState} from "react";
import {PromptForm} from "../utils/PromptForm";
import {ErrorDisplay} from "../utils/ErrorDisplay";
import {ApiKeyInput} from "../../ApiKeyInput";

interface ConversationWelcomeProps {
  onPromptSubmit: (prompt: string) => void;
  isLoading: boolean;
  prefilledPrompt?: string;
  apiKey?: string | null;
  onApiKeyChange: (key: string | null) => void;
  error?: Error | null;
  getChatErrorMessage: (error: unknown) => string;
}

export const ConversationWelcome = ({
  onPromptSubmit,
  isLoading,
  prefilledPrompt = "",
  apiKey,
  onApiKeyChange,
  error,
  getChatErrorMessage
}: ConversationWelcomeProps) => {
  // Error categorization
  const isApiKeyError = (error: Error): boolean => {
    const errorMessage = getChatErrorMessage(error);
    return (
      errorMessage.includes("API key") ||
      errorMessage.includes("authentication")
    );
  };

  const isOllamaConnectionError = (error: Error): boolean => {
    const errorMessage = getChatErrorMessage(error);
    return (
      errorMessage.includes("connection") || errorMessage.includes("Ollama")
    );
  };

  const getApiKeyErrorMessage = (error: Error): string | null => {
    if (!isApiKeyError(error)) return null;
    return getChatErrorMessage(error);
  };

  const getOllamaConnectionErrorMessage = (error: Error): string | null => {
    if (!isOllamaConnectionError(error)) return null;
    return getChatErrorMessage(error);
  };

  const apiKeyError = error ? getApiKeyErrorMessage(error) : null;
  const ollamaConnectionError = error
    ? getOllamaConnectionErrorMessage(error)
    : null;
  const nonApiKeyError =
    error && !isApiKeyError(error) && !isOllamaConnectionError(error)
      ? error
      : null;

  return (
    <div className="space-y-6">
      {/* API Key Input - only shown if there's an API key error and no API key from parent */}
      {apiKeyError && !apiKey && (
        <div className="p-4 border border-border rounded-lg bg-muted">
          <ApiKeyInput
            onApiKeyChange={onApiKeyChange}
            required={false}
            error={apiKeyError}
          />
        </div>
      )}
      {/* Ollama Connection Error */}
      {ollamaConnectionError && (
        <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
          <div className="text-sm text-destructive">
            <strong>Connection Error:</strong> {ollamaConnectionError}
          </div>
          {!apiKey && (
            <div className="mt-3">
              <ApiKeyInput
                onApiKeyChange={onApiKeyChange}
                required={false}
                error={null}
              />
            </div>
          )}
        </div>
      )}

      {/* Prompt Form for welcome screen */}
      <PromptForm
        onSubmit={onPromptSubmit}
        isLoading={isLoading}
        prefilledPrompt={prefilledPrompt}
      />
      {/* Non-API Key Errors */}
      {nonApiKeyError && <ErrorDisplay error={nonApiKeyError} />}
    </div>
  );
};
