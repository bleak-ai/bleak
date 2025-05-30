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
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2 text-foreground">
        <Key className="w-4 h-4 " />
        <label htmlFor="api-key" className="text-sm font-medium">
          OpenAI API Key
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      </div>

      <div className="relative">
        <input
          id="api-key"
          type={isVisible ? "text" : "password"}
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          placeholder="sk-..."
          className={`w-full px-3 py-2 pr-16 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            isApiKeyError
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
              : "border-gray-300 focus:border-gray-500 focus:ring-gray-200"
          }`}
        />

        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="px-2 py-1 text-gray-400 hover:text-gray-600 transition-colors"
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
              className="px-2 py-1 text-gray-400 hover:text-rose-500 transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {isApiKeyError && (
        <div className="mt-2 flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-rose-700">
            <p className="font-medium">API Key Error</p>
            <p className="mt-1">{error}</p>
            <p className="mt-2 text-xs">
              Get your API key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                OpenAI's platform
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Success message */}
      {apiKey && !isApiKeyError && (
        <p className="mt-2 text-xs text-gray-600">✓ API key saved locally</p>
      )}

      {/* Required field message */}
      {required && !apiKey && !isApiKeyError && (
        <p className="mt-2 text-xs text-gray-500">
          Required to use Bleak. Keys are stored locally and never sent to our
          servers.
        </p>
      )}

      {/* Help text for new users */}
      {!apiKey && !isApiKeyError && (
        <p className="mt-2 text-xs text-gray-500">
          Need an API key?{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 underline hover:no-underline"
          >
            Get one from OpenAI
          </a>{" "}
        </p>
      )}
    </div>
  );
};
