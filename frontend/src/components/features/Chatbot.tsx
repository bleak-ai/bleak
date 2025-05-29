import React, {useState, useRef, useEffect} from "react";
import {useMutation, useQuery} from "@tanstack/react-query";
import {Send, Bot, User, Loader, History, Edit2, RotateCcw} from "lucide-react";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {Avatar, AvatarFallback} from "../ui/avatar";
import {Card} from "../ui/card";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  checkpointId?: string;
}

interface ChatResponse {
  response: string;
  conversation_id: string;
}

interface Checkpoint {
  checkpoint_id: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: string | null;
  }>;
  next_nodes: string[];
  created_at: string | null;
}

interface ConversationHistory {
  conversation_id: string;
  checkpoints: Checkpoint[];
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

const getConversationHistory = async (
  conversationId: string
): Promise<ConversationHistory> => {
  const response = await fetch(
    `http://0.0.0.0:8008/chat/${conversationId}/history`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get conversation history");
  }

  return response.json();
};

const resumeFromCheckpoint = async (
  conversationId: string,
  checkpointId: string,
  newMessage?: string
): Promise<ChatResponse> => {
  const response = await fetch(
    "http://0.0.0.0:8008/chat/resume-from-checkpoint",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        checkpoint_id: checkpointId,
        new_message: newMessage
      })
    }
  );

  if (!response.ok) {
    throw new Error("Failed to resume from checkpoint");
  }

  return response.json();
};

const editMessage = async (
  conversationId: string,
  checkpointId: string,
  editedMessage: string
): Promise<ChatResponse> => {
  const response = await fetch("http://0.0.0.0:8008/chat/edit-message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      checkpoint_id: checkpointId,
      edited_message: editedMessage
    })
  });

  if (!response.ok) {
    throw new Error("Failed to edit message");
  }

  return response.json();
};

export const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
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

  // Time travel queries and mutations
  const historyQuery = useQuery({
    queryKey: ["conversation-history", conversationId],
    queryFn: () => getConversationHistory(conversationId!),
    enabled: !!conversationId && showHistory
  });

  const resumeMutation = useMutation<
    ChatResponse,
    Error,
    {checkpointId: string; newMessage?: string}
  >({
    mutationFn: ({checkpointId, newMessage}) =>
      resumeFromCheckpoint(conversationId!, checkpointId, newMessage),
    onSuccess: (data) => {
      // Refresh history and update messages
      historyQuery.refetch();
      // You might want to update the current messages view here
    }
  });

  const editMutation = useMutation<
    ChatResponse,
    Error,
    {checkpointId: string; editedMessage: string}
  >({
    mutationFn: ({checkpointId, editedMessage}) =>
      editMessage(conversationId!, checkpointId, editedMessage),
    onSuccess: (data) => {
      // Refresh history and update messages
      historyQuery.refetch();
      setEditingMessageId(null);
      setEditingText("");

      // If we edited a message, the response contains the new conversation state
      // Add the new assistant response to current messages
      const assistantMessage: Message = {
        id: Date.now().toString() + "-assistant-edited",
        content: data.response,
        role: "assistant",
        timestamp: new Date()
      };

      // Replace messages from the edit point forward
      setMessages((prev) => {
        // For simplicity, we'll just add the new response
        // In a more sophisticated implementation, you'd want to replace from the edit point
        return [...prev, assistantMessage];
      });
    },
    onError: (error) => {
      console.error("Edit error:", error);
      setEditingMessageId(null);
      setEditingText("");
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

  const handleEditMessage = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditingText(currentContent);
  };

  const handleSaveEdit = (checkpointId: string) => {
    if (editingText.trim() && conversationId) {
      editMutation.mutate({
        checkpointId,
        editedMessage: editingText.trim()
      });
    }
  };

  const handleSaveCurrentMessageEdit = (messageId: string) => {
    if (editingText.trim() && conversationId) {
      // For current messages, we need to find the checkpoint ID
      // This is a simplified approach - in a real app you might want to store checkpoint IDs with messages
      // For now, we'll use the conversation history to find the right checkpoint
      if (historyQuery.data && historyQuery.data.checkpoints.length > 0) {
        // Use the most recent checkpoint that contains this message
        const latestCheckpoint = historyQuery.data.checkpoints[0];
        editMutation.mutate({
          checkpointId: latestCheckpoint.checkpoint_id,
          editedMessage: editingText.trim()
        });
      } else {
        // If we don't have history data, fetch it first
        historyQuery.refetch().then(() => {
          if (historyQuery.data && historyQuery.data.checkpoints.length > 0) {
            const latestCheckpoint = historyQuery.data.checkpoints[0];
            editMutation.mutate({
              checkpointId: latestCheckpoint.checkpoint_id,
              editedMessage: editingText.trim()
            });
          }
        });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleResumeFromCheckpoint = (checkpointId: string) => {
    if (conversationId) {
      resumeMutation.mutate({checkpointId});
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[600px] flex flex-col bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-rose-600 text-white">
                <Bot className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-white">AI Assistant</h3>
              <p className="text-sm text-gray-400">Online</p>
            </div>
          </div>
          {conversationId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <History className="w-4 h-4 mr-2" />
              {showHistory ? "Hide History" : "Show History"}
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showHistory && conversationId ? (
          // History View
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Conversation History
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Back to Chat
              </Button>
            </div>

            {historyQuery.isLoading && (
              <div className="text-center text-gray-400">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p>Loading conversation history...</p>
              </div>
            )}

            {historyQuery.error && (
              <div className="text-center text-red-400">
                <p>Error loading history: {historyQuery.error.message}</p>
              </div>
            )}

            {historyQuery.data && (
              <div className="space-y-6">
                {historyQuery.data.checkpoints.map((checkpoint, index) => (
                  <div
                    key={checkpoint.checkpoint_id}
                    className="border border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-gray-400">
                        Checkpoint{" "}
                        {historyQuery.data.checkpoints.length - index}
                        {checkpoint.created_at && (
                          <span className="ml-2">
                            ({new Date(checkpoint.created_at).toLocaleString()})
                          </span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleResumeFromCheckpoint(checkpoint.checkpoint_id)
                        }
                        disabled={resumeMutation.isPending}
                        className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Resume Here
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {checkpoint.messages.map((msg, msgIndex) => (
                        <div
                          key={`${checkpoint.checkpoint_id}-${msgIndex}`}
                          className="flex items-start space-x-2"
                        >
                          <Avatar className="w-6 h-6">
                            <AvatarFallback
                              className={
                                msg.role === "user"
                                  ? "bg-blue-600 text-white"
                                  : "bg-rose-600 text-white"
                              }
                            >
                              {msg.role === "user" ? (
                                <User className="w-3 h-3" />
                              ) : (
                                <Bot className="w-3 h-3" />
                              )}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            {editingMessageId ===
                            `${checkpoint.checkpoint_id}-${msgIndex}` ? (
                              <div className="space-y-2">
                                <Input
                                  value={editingText}
                                  onChange={(e) =>
                                    setEditingText(e.target.value)
                                  }
                                  className="bg-gray-800 border-gray-600 text-white"
                                  placeholder="Edit message..."
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSaveEdit(checkpoint.checkpoint_id);
                                    } else if (e.key === "Escape") {
                                      handleCancelEdit();
                                    }
                                  }}
                                />
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleSaveEdit(checkpoint.checkpoint_id)
                                    }
                                    disabled={editMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    className="border-gray-600 text-gray-300"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="group">
                                <Card className="p-2 bg-gray-800 border-gray-700">
                                  <p className="text-sm text-white">
                                    {msg.content}
                                  </p>
                                </Card>
                                {msg.role === "user" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleEditMessage(
                                        `${checkpoint.checkpoint_id}-${msgIndex}`,
                                        msg.content
                                      )
                                    }
                                    className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-gray-400 hover:text-white"
                                  >
                                    <Edit2 className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Normal Chat View
          <>
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-lg font-medium">Welcome to AI Assistant</p>
                <p className="text-sm">
                  Send a message to start the conversation
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex group ${
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
                          : "bg-rose-600 text-white"
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
                    {editingMessageId === message.id ? (
                      <div className="space-y-2 w-full max-w-md">
                        <Input
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                          placeholder="Edit message..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSaveCurrentMessageEdit(message.id);
                            } else if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleSaveCurrentMessageEdit(message.id)
                            }
                            disabled={editMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="border-gray-600 text-gray-300"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.role === "user" && conversationId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleEditMessage(message.id, message.content)
                              }
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white p-1 h-auto"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <Avatar className="w-8 h-8 mr-2">
                    <AvatarFallback className="bg-rose-600 text-white">
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
          </>
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
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-rose-500"
            disabled={chatMutation.isPending}
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || chatMutation.isPending}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
