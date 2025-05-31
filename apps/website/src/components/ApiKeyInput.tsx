import React, {useState, useEffect} from "react";
import {Eye, EyeOff, Key, AlertCircle} from "lucide-react";

interface ApiKeyInputProps {
  onApiKeyChange: (apiKey: string | null) => void;
  required?: boolean;
  error?: string | null;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  onApiKeyChange,
  required = false,
  error = null
}) => {
  const [apiKey, setApiKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      onApiKeyChange(savedApiKey);
    }
  }, [onApiKeyChange]);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);

    // Save to localStorage and notify parent
    if (value.trim()) {
      localStorage.setItem("openai_api_key", value.trim());
      onApiKeyChange(value.trim());
    } else {
      localStorage.removeItem("openai_api_key");
      onApiKeyChange(null);
    }
  };

  const clearApiKey = () => {
    setApiKey("");
    localStorage.removeItem("openai_api_key");
    onApiKeyChange(null);
  };

  const isApiKeyError = error && error.toLowerCase().includes("api key");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Key className="w-5 h-5 text-neutral-600" />
        <div className="flex-1">
          <label
            htmlFor="api-key"
            className="text-sm font-medium text-neutral-900"
          >
            OpenAI API Key
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {!apiKey && !isApiKeyError && (
            <p className="text-xs text-neutral-500 mt-1">
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-700 hover:text-neutral-900 transition-colors underline"
              >
                Get your API key from OpenAI
              </a>
            </p>
          )}
        </div>
      </div>

      <div className="relative">
        <input
          id="api-key"
          type={isVisible ? "text" : "password"}
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          placeholder="sk-..."
          className={`w-full px-4 py-3 pr-20 bg-white border rounded-lg text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-0 transition-colors ${
            isApiKeyError
              ? "border-red-300 focus:border-red-500"
              : "border-neutral-300 focus:border-neutral-900"
          }`}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-1">
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded"
          >
            {isVisible ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>

          {apiKey && (
            <button
              type="button"
              onClick={clearApiKey}
              className="p-2 text-neutral-400 hover:text-red-500 transition-colors rounded text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {isApiKeyError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-red-900">API Key Required</p>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Success message */}
      {apiKey && !isApiKeyError && (
        <p className="text-xs text-neutral-600">✓ API key saved locally</p>
      )}
    </div>
  );
};
