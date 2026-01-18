import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useSocket } from "../context/SocketContext.jsx";
import Message from "./Message";

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarRef = useRef(null);
  const { socket, joinConversation } = useSocket();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        window.innerWidth < 768 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        sidebarOpen
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  // Load conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/conversations`,
          { withCredentials: true }
        );
        setConversations(res.data);
        if (res.data?.length && !selectedId) {
          setSelectedId(res.data[0]._id);
        }
      } catch (err) {
        toast.error("Error fetching conversations.");
      }
    };

    fetchConversations();
  }, []);

  // Handle conversation select
  const handleSelect = (id) => {
    setSelectedId(id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Join conversation room & listen for messages + typing
  useEffect(() => {
    if (!socket || !selectedId) return;

    // join conversation room
    joinConversation(selectedId);

    // Listener for incoming messages
    const handleReceive = (msg) => {
      if (msg.conversationId === selectedId) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on("message:receive", handleReceive);

    // Listener for typing indicator
    const handleTyping = ({ conversationId, userId, isTyping }) => {
      if (conversationId !== selectedId) return;
      setTypingUsers((prev) => {
        if (isTyping && !prev.includes(userId)) return [...prev, userId];
        if (!isTyping) return prev.filter((id) => id !== userId);
        return prev;
      });
    };
    socket.on("typing:update", handleTyping);

    return () => {
      socket.off("message:receive", handleReceive);
      socket.off("typing:update", handleTyping);
    };
  }, [socket, selectedId]);

  // Responsive design - adjust on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-[calc(100vh-80px)] bg-slate-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex overflow-hidden">
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-20 left-4 z-50 bg-blue-500 text-white p-2 rounded-lg shadow-lg"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          w-full md:w-80 border-r border-gray-200 dark:border-gray-800 
          flex flex-col bg-white dark:bg-gray-900 absolute md:relative 
          z-40 transform transition-transform duration-300 ease-in-out
          h-full ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <div className="p-3 flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="font-semibold text-lg">Conversations</div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              No conversations yet.
            </div>
          ) : (
            <ul className="h-full">
              {conversations.map((conv) => {
                const active = selectedId === conv._id;
                return (
                  <li
                    key={conv._id}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  >
                    <button
                      onClick={() => handleSelect(conv._id)}
                      className={`
                        w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 
                        transition-colors duration-200
                        ${
                          active
                            ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                            : ""
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate mb-1">
                            {conv.title ||
                              conv.counterpartName ||
                              "Conversation"}
                          </div>
                          <div className="text-xs text-gray-500 truncate mb-1">
                            {conv.lastMessage || "No messages yet"}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {new Date(conv.updatedAt).toLocaleString()}
                          </div>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Chat Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-4">
            <div className="text-center">
              <div className="text-xl mb-2">Welcome to Chat</div>
              <p className="text-sm text-gray-400">
                {conversations.length === 0
                  ? "Start a new conversation"
                  : "Select a conversation to start chatting"}
              </p>
            </div>
          </div>
        ) : (
          <Message
            conversationId={selectedId}
            messages={messages}
            typingUsers={typingUsers}
          />
        )}
      </main>
    </div>
  );
};

export default Chat;
