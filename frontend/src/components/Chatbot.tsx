import React, {useState, useRef, useEffect} from "react";
import {useMutation} from "@tanstack/react-query";
import {Send, Bot, User, Loader} from "lucide-react";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {Avatar, AvatarFallback} from "./ui/avatar";
import {Card} from "./ui/card";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatResponse {
  response: string;
  conversation_id: string;
}

const sendChatMessage = async (
  message: string,
  conversationId?: string
): Promise<ChatResponse> => {
  const response = await fetch("http://0.0.0.0:8008/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      conversation_id: conversationId
    })
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
};

export const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation<ChatResponse, Error, string>({
    mutationFn: (message: string) =>
      sendChatMessage(message, conversationId || undefined),
    onSuccess: (data) => {
      setConversationId(data.conversation_id);

      // Add assistant message
      const assistantMessage: Message = {
        id: Date.now().toString() + "-assistant",
        content: data.response,
        role: "assistant",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (error) => {
      console.error("Chat error:", error);

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || chatMutation.isPending) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      content: inputValue.trim(),
      role: "user",
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(inputValue.trim());
    setInputValue("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
  };

  return (
    <div className="max-w-4xl mx-auto h-[600px] flex flex-col bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-red-600 text-white">
              <Bot className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-white">AI Assistant</h3>
            <p className="text-sm text-gray-400">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-lg font-medium">Welcome to AI Assistant</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex max-w-[80%] ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              } items-start space-x-2`}
            >
              <Avatar
                className={`w-8 h-8 ${
                  message.role === "user" ? "ml-2" : "mr-2"
                }`}
              >
                <AvatarFallback
                  className={
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-red-600 text-white"
                  }
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </AvatarFallback>
              </Avatar>

              <div
                className={`flex flex-col ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <Card
                  className={`p-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-800 text-white border-gray-700"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </Card>
                <span className="text-xs text-gray-500 mt-1">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <Avatar className="w-8 h-8 mr-2">
                <AvatarFallback className="bg-red-600 text-white">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="p-3 bg-gray-800 text-white border-gray-700">
                <div className="flex items-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-red-500"
            disabled={chatMutation.isPending}
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || chatMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
