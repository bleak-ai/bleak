import {useState} from "react";
import {SimpleInteractive} from "../chat/interactive/SimpleInteractive";
import {
  BleakElementConfigEditor,
  type CustomBleakElementConfig
} from "../chat/config/BleakConfigEditor";
import {Settings, Sparkles, MessageSquare, X} from "lucide-react";
import {Button} from "../ui/button";
import {ApiKeyInput} from "../ApiKeyInput";

const ChatPage = () => {
  const [customConfig, setCustomConfig] =
    useState<CustomBleakElementConfig | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [prefilledPrompt, setPrefilledPrompt] = useState<string>("");

  const handleConfigChange = (config: CustomBleakElementConfig) => {
    setCustomConfig(config);
  };

  const handleConversationStart = () => {
    setConversationStarted(true);
  };

  const handleNewConversation = () => {
    setConversationStarted(false);
    setPrefilledPrompt("");
  };

  const handleApiKeyChange = (key: string | null) => {
    setApiKey(key);
  };

  const handleExamplePromptClick = (prompt: string) => {
    setPrefilledPrompt(prompt);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 relative">
      {/* Settings Panel */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20"
            onClick={() => setIsConfigOpen(false)}
          />

          {/* Panel */}
          <div className="relative ml-auto w-full max-w-md bg-white border-l border-neutral-200 shadow-lg overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-neutral-600" />
                  <h2 className="text-lg font-medium text-neutral-900">
                    Component Settings
                  </h2>
                </div>
                <button
                  onClick={() => setIsConfigOpen(false)}
                  className="p-1 hover:bg-neutral-100 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Configure which UI component types the AI can generate during
                  conversations.
                </p>
              </div>

              <BleakElementConfigEditor
                onConfigChange={handleConfigChange}
                isCollapsed={false}
              />
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-medium">Bleak Assistant</h1>
          </div>

          <div className="flex items-center gap-3">
            {conversationStarted && (
              <Button
                onClick={handleNewConversation}
                variant="outline"
                size="sm"
                className="border-neutral-300 text-neutral-600 hover:text-neutral-900"
              >
                New Chat
              </Button>
            )}
            <button
              onClick={() => setIsConfigOpen(true)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Configure components"
            >
              <Settings className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={
            !conversationStarted
              ? "min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-6 py-16"
              : "w-full"
          }
        >
          {!conversationStarted && (
            /* Welcome Screen Content */
            <div className="text-center max-w-4xl mx-auto space-y-12">
              {/* Welcome Message */}
              <div className="space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-light text-neutral-900">
                  Try Bleak Assistant
                </h2>
                <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto">
                  Experience how Bleak generates interactive UI components based
                  on your questions. Follow these steps to get started:
                </p>
              </div>

              {/* API Key Input */}
              <div className="w-full max-w-2xl mx-auto">
                <h3 className="text-lg font-medium text-neutral-900 mb-4 text-center">
                  Step 1: Enter your OpenAI API Key
                </h3>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                  <ApiKeyInput
                    onApiKeyChange={handleApiKeyChange}
                    required={true}
                    error={null}
                  />
                </div>
              </div>

              {/* Example Prompts */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    Step 2: Configure Components (Optional)
                  </h3>
                  <button
                    onClick={() => setIsConfigOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    Configure Components
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">
                      Step 3: Try these example questions
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Click any question below to pre-fill it, then press "Ask
                      Question" to start
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {[
                      "Help me plan a vacation to Europe",
                      "I need to choose a programming language for my project",
                      "Create a personalized workout plan for me",
                      "Recommend a restaurant for a romantic dinner"
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        className="px-4 py-2 text-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full transition-colors border border-neutral-200"
                        onClick={() => handleExamplePromptClick(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Single persistent SimpleInteractive component */}
          <div
            className={
              !conversationStarted ? "w-full max-w-3xl mx-auto mt-16" : "w-full"
            }
          >
            <SimpleInteractive
              key="persistent-chat" // Stable key ensures component persists
              customConfig={customConfig}
              onConversationStart={handleConversationStart}
              isWelcomeMode={!conversationStarted}
              initialApiKey={apiKey}
              prefilledPrompt={prefilledPrompt}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
