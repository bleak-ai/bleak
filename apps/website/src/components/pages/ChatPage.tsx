import {useState} from "react";
import {MessageSquare} from "lucide-react";
import {Button} from "../ui/button";
import {ApiKeyInput} from "../ApiKeyInput";
import {Chat} from "../chat";

const ChatPage = () => {
  const [conversationStarted, setConversationStarted] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [prefilledPrompt, setPrefilledPrompt] = useState<string>("");

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
    <div className="min-h-screen bg-background text-foreground">
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
              >
                New Chat
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-20 py-10">
          {!conversationStarted && (
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
                    Ask any question and get an interactive response
                  </p>
                </div>
              </div>

              {/* API Key Input */}
              <div className="w-full space-y-6">
                <h3 className="text-lg font-medium text-foreground text-center">
                  Enter your OpenAI API Key
                </h3>
                <div className="silent-card">
                  <ApiKeyInput
                    onApiKeyChange={handleApiKeyChange}
                    required={true}
                    error={null}
                  />
                </div>
              </div>

              {/* Example Prompts */}
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <h3 className="text-lg font-medium text-foreground">
                    Try these example questions
                  </h3>
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
                      className="px-5 py-3 text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full transition-all duration-200 border border-border"
                      onClick={() => handleExamplePromptClick(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat Interface */}
          <div
            className={
              !conversationStarted ? "w-full content-max mt-16" : "w-full"
            }
          >
            <Chat
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
