import {useState} from "react";
import {SimpleInteractive} from "../chat/interactive";
import {BleakElementConfigEditor} from "../chat/config/BleakConfigEditor";
import {Settings, Sparkles, MessageSquare, X} from "lucide-react";
import {Button} from "../ui/button";
import {ApiKeyInput} from "../ApiKeyInput";
import type {BleakElementConfig} from "bleakai";
import {BLEAK_ELEMENT_CONFIG} from "../../config/bleakConfig";

const ChatPage = () => {
  const [customConfig, setCustomConfig] =
    useState<BleakElementConfig>(BLEAK_ELEMENT_CONFIG);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [prefilledPrompt, setPrefilledPrompt] = useState<string>("");

  const handleConfigChange = (config: BleakElementConfig) => {
    setCustomConfig(config);
  };

  const handleConversationStart = () => {
    setConversationStarted(true);
  };

  const handleNewConversation = () => {
    setConversationStarted(false);
    setPrefilledPrompt("");
    window.location.reload();
  };

  const handleApiKeyChange = (key: string | null) => {
    setApiKey(key);
  };

  const handleExamplePromptClick = (prompt: string) => {
    setPrefilledPrompt(prompt);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Settings Panel - Silent Edge: Clean overlay */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsConfigOpen(false)}
          />

          {/* Panel */}
          <div className="relative ml-auto w-full max-w-md bg-background border-l border-border shadow-xl overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-lg font-medium text-foreground">
                    Component Settings
                  </h2>
                </div>
                <button
                  onClick={() => setIsConfigOpen(false)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="mb-8">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Configure which UI component types the AI can generate during
                  conversations
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
        <div className="flex items-center justify-between p-8 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-medium text-foreground">
              Bleak Assistant
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {conversationStarted && (
              <Button
                onClick={handleNewConversation}
                variant="outline"
                size="sm"
                className="interactive-scale"
              >
                New Chat
              </Button>
            )}
            <button
              onClick={() => setIsConfigOpen(true)}
              className="p-3 hover:bg-accent rounded-lg transition-colors duration-200"
              title="Configure components"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-20 py-10">
          {!conversationStarted && (
            /* Welcome Screen - Silent Edge: Spacious, confident */
            <div className="text-center content-max space-y-16">
              {/* Welcome Message */}
              <div className="space-y-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-10 h-10 text-primary-foreground" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-light text-foreground">
                    Try Bleak Assistant
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed text-max">
                    Experience how Bleak generates interactive UI components
                    based on your questions. Follow these steps to get started:
                  </p>
                </div>
              </div>

              {/* API Key Input - Clean, prominent */}
              <div className="w-full space-y-6">
                <h3 className="text-lg font-medium text-foreground text-center">
                  Step 1: Enter your OpenAI API Key
                </h3>
                <div className="silent-card">
                  <ApiKeyInput
                    onApiKeyChange={handleApiKeyChange}
                    required={true}
                    error={null}
                  />
                </div>
              </div>

              {/* Configuration Step - Minimal but clear */}
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-medium text-foreground">
                    Step 2: Configure Components (Optional)
                  </h3>
                  <button
                    onClick={() => setIsConfigOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors duration-200 text-sm font-medium interactive-scale"
                  >
                    <Settings className="w-4 h-4" />
                    Configure Components
                  </button>
                </div>

                {/* Example Prompts - Engaging, accessible */}
                <div className="space-y-6">
                  <div className="text-center space-y-3">
                    <h3 className="text-lg font-medium text-foreground">
                      Step 3: Try these example questions
                    </h3>
                    <p className="text-sm text-muted-foreground">
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
                        className="px-5 py-3 text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full transition-all duration-200 border border-border interactive-scale"
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

          {/* Chat Interface - Persistent and clean */}
          <div
            className={
              !conversationStarted ? "w-full content-max mt-16" : "w-full"
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
