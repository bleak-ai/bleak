import {SimpleInteractive} from "../chat/interactive/SimpleInteractive";

const ChatPage = () => {
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
            Experience our interactive AI assistant that provides personalized
            responses through dynamic UI components.
          </p>
        </div>

        <SimpleInteractive />
      </div>
    </div>
  );
};

export default ChatPage;
