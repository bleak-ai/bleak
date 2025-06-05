import React, {useState, useEffect} from "react";

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

  useEffect(() => {
    const saved = localStorage.getItem("openai_api_key");
    if (saved) {
      setApiKey(saved);
      onApiKeyChange(saved);
    }
  }, [onApiKeyChange]);

  const handleChange = (value: string) => {
    setApiKey(value);
    if (value.trim()) {
      localStorage.setItem("openai_api_key", value.trim());
      onApiKeyChange(value.trim());
    } else {
      localStorage.removeItem("openai_api_key");
      onApiKeyChange(null);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        OpenAI API Key {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type="password"
        value={apiKey}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="sk-..."
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {error && <div className="text-sm text-red-600">{error}</div>}

      {!apiKey && (
        <p className="text-xs text-gray-500">
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-600"
          >
            Get your API key from OpenAI
          </a>
        </p>
      )}
    </div>
  );
};
