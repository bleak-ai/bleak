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
        <Key className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1">
          <label
            htmlFor="api-key"
            className="text-sm font-medium text-foreground"
          >
            OpenAI API Key
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
          {!apiKey && !isApiKeyError && (
            <p className="text-xs text-muted-foreground mt-1">
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors underline underline-offset-2"
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
          className={`w-full px-4 py-3 pr-20 bg-input border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors ${
            isApiKeyError
              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
              : "border-border focus:border-ring"
          }`}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-1">
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded"
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
              className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {isApiKeyError && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-foreground">API Key Required</p>
            <p className="text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Success message */}
      {apiKey && !isApiKeyError && (
        <p className="text-xs text-muted-foreground">✓ API key saved locally</p>
      )}
    </div>
  );
};
