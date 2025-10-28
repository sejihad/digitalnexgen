import { useState, useEffect, useRef } from "react";
import { Send, X, MessageCircle, Minimize2 } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import axios from "axios";

const ChatBox = ({ currentUser, adminId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const { socket, isConnected, sendMessage: socketSendMessage } = useSocket();

  // Get API base URL with fallback
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8800";

  useEffect(() => {
    // Validate required props
    if (!currentUser?._id || !adminId) {
      setError("Missing required user information");
      return;
    }

    if (!socket || !isConnected) {
      setError("Chat connection not available");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/chats/${currentUser._id}/${adminId}`,
          { withCredentials: true }
        );
        setMessages(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError("Failed to load chat history");
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Listen for new messages from others
    const handleReceiveMessage = (data) => {
      if (data?.message && data.message.receiverId === currentUser._id) {
        // Only add messages that are meant for this user AND not sent by this user
        if (data.message.senderId !== currentUser._id) {
          setMessages((prev) => {
            // Check for duplicates
            const exists = prev.some(msg =>
              msg._id === data.message._id ||
              msg.timestamp === data.message.timestamp ||
              (msg.tempId && msg.tempId === data.message.tempId)
            );
            if (!exists) {
              return [...prev, data.message];
            }
            return prev;
          });
        }
      }
    };

    socket.on("message:receive", handleReceiveMessage);

    return () => {
      socket.off("message:receive", handleReceiveMessage);
    };
  }, [currentUser?._id, adminId, socket, isConnected, API_BASE_URL]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Validate all required data
    if (!socket || !isConnected || !currentUser?._id || !adminId) {
      setError("Unable to send message. Please check your connection.");
      return;
    }

    const messageText = input.trim();
    setInput("");
    setError(null);

    const message = {
      senderId: currentUser._id,
      receiverId: adminId,
      text: messageText,
      timestamp: new Date(),
      tempId: `temp_${Date.now()}_${Math.random()}`
    };

    // Add to local state immediately for better UX
    setMessages((prev) => [...prev, message]);

    try {
      // Send via Socket.IO
      socketSendMessage({
        conversationId: `${currentUser._id}-${adminId}`,
        receiverId: adminId,
        message,
      });

      // Save to database
      await axios.post(
        `${API_BASE_URL}/api/chats`,
        message,
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");

      // Remove failed message from local state
      setMessages((prev) => prev.filter(msg => msg.tempId !== message.tempId));

      // Restore input text on error
      setInput(messageText);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleRetry = () => {
    setError(null);
    // Re-trigger the useEffect to refetch messages
    window.location.reload();
  };

  // Show error state
  if (error) {
    return (
      <div className="fixed bottom-5 right-5 w-80 h-96 bg-white dark:bg-gray-900 border border-red-300 dark:border-red-700 rounded-lg shadow-xl z-50 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
          <button
            onClick={handleRetry}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed bottom-5 right-5 w-80 h-96 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryRgb mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-primaryRgb hover:bg-primaryRgb/90 text-white p-3 rounded-full shadow-lg transition-all"
          title="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-80 h-96 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center bg-primaryRgb text-white px-4 py-3 rounded-t-lg">
        <span className="font-semibold">Digital NexGen Support</span>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white hover:text-gray-200 transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start a conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg._id || msg.tempId || `${msg.timestamp}-${index}`}
              className={`p-2 rounded-lg max-w-[75%] text-sm ${
                msg.senderId === currentUser._id
                  ? "bg-primaryRgb text-white ml-auto"
                  : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
              }`}
            >
              {msg.text}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex p-3 border-t border-gray-300 dark:border-gray-700">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded-md border dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryRgb text-sm"
          disabled={!isConnected}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || !isConnected}
          className="ml-2 bg-primaryRgb text-white p-2 rounded-md hover:bg-primaryRgb/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Connection Status */}
      <div className="px-3 pb-2">
        <div className={`text-xs text-center ${
          isConnected ? "text-green-600" : "text-red-500"
        }`}>
          {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
