import {useState} from "react";
import {SimpleInteractive} from "../chat/interactive/SimpleInteractive";
import {
  BleakElementConfigEditor,
  type CustomBleakElementConfig
} from "../chat/config/BleakConfigEditor";

const ChatPage = () => {
  const [customConfig, setCustomConfig] =
    useState<CustomBleakElementConfig | null>(null);
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(true);

  const handleConfigChange = (config: CustomBleakElementConfig) => {
    setCustomConfig(config);
  };

  const handleToggleCollapse = () => {
    setIsConfigCollapsed(!isConfigCollapsed);
  };

  return (
    <div className="min-h-screen bg-black text-white py-12">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-900/5 to-rose-800/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            AI{" "}
            <span className="bg-gradient-to-r from-rose-500 to-rose-700 bg-clip-text text-transparent">
              Assistant
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Experience our interactive AI assistant that asks questions through
            dynamic UI components.
          </p>
        </div>

        {/* How it works section */}
        <div className="max-w-4xl mx-auto mb-8 p-6">
          <div className="bg-white/5 rounded-lg border border-white/10 p-6">
            <div className="space-y-3">
              <p className="text-xl font-semibold text-white">How it works</p>
              <div className="space-y-2 text-white/80 leading-relaxed">
                <p>
                  <span className="text-rose-400 font-medium">1.</span>{" "}
                  <strong className="text-white">
                    Configure Question Types:
                  </strong>{" "}
                  Customize how the AI generates questions using the
                  configuration panel below
                </p>
                <p>
                  <span className="text-rose-400 font-medium">2.</span>{" "}
                  <strong className="text-white">Ask Your Question:</strong>{" "}
                  Make a general question to see personalized UI elements appear
                </p>
                <p>
                  <span className="text-rose-400 font-medium">3.</span>{" "}
                  <strong className="text-white">Answer Questions:</strong>{" "}
                  Interact with the AI-generated questions in predesigned or
                  custom UI components
                </p>
                <p>
                  <span className="text-rose-400 font-medium">4.</span>{" "}
                  <strong className="text-white">Get Your Answer:</strong>{" "}
                  Receive a comprehensive response based on your interactions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Question Configuration Editor */}
        <div className="mb-8">
          <BleakElementConfigEditor
            onConfigChange={handleConfigChange}
            isCollapsed={isConfigCollapsed}
            onToggleCollapse={handleToggleCollapse}
          />
        </div>

        {/* Interactive Chat Component */}
        <SimpleInteractive customConfig={customConfig} />
      </div>
    </div>
  );
};

export default ChatPage;
