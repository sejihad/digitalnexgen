import { useEffect, useState } from "react";
import io from "socket.io-client";
import { Send, UserCircle2 } from "lucide-react";

const socket = io(import.meta.env.VITE_API_BASE_URL);

const AdminChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receive_message");
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      const adminMsg = { text: input, sender: "admin" };
      socket.emit("send_message", adminMsg);
      setMessages((prev) => [...prev, adminMsg]);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F17] flex justify-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#101828] rounded-2xl shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <UserCircle2 />
            <span className="font-semibold">Digital NexGen Admin Panel</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50 dark:bg-[#0E141F]">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm mt-10">
              💬 Waiting for user messages...
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "admin" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-2xl max-w-[75%] text-sm ${
                  msg.sender === "admin"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
                    : "bg-gray-200 dark:bg-[#1B2433] text-gray-900 dark:text-gray-100 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0B0F17] px-3 py-2 rounded-b-2xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your reply..."
            className="flex-1 bg-transparent outline-none px-2 text-sm text-gray-700 dark:text-gray-200"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white p-2 rounded-full transition"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
