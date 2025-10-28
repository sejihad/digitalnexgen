import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:8800");

const ChatPopup = ({ userId, adminId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit("register", userId);

    // Fetch existing messages
    axios
      .get(`http://localhost:8800/api/chats/${userId}/${adminId}`)
      .then((res) => setMessages(res.data))
      .catch(console.error);

    // Listen for new messages
    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [userId, adminId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const message = { senderId: userId, receiverId: adminId, text: input };

    socket.emit("sendMessage", message);
    await axios.post("http://localhost:8800/api/chats", message);

    setMessages((prev) => [...prev, message]);
    setInput("");
  };

  return (
    <div className="fixed bottom-20 right-5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl w-80 h-96 flex flex-col z-50">
      <div className="flex justify-between items-center bg-green-600 text-white px-4 py-2 rounded-t-lg">
        <span>Digital NexGen Support</span>
        <button onClick={onClose} className="font-bold text-lg">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg max-w-[75%] ${
              msg.senderId === userId
                ? "bg-green-500 text-white ml-auto"
                : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex p-2 border-t border-gray-300 dark:border-gray-700">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded-md border dark:bg-gray-800 dark:text-white focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPopup;
