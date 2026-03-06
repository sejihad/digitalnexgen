import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useSocket } from "../context/SocketContext.jsx";
import { setHasUnread } from "../redux/chatSlice";
import Message from "./Message";

const Chat = () => {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const dispatch = useDispatch();
  const { socket, joinConversation, leaveConversation } = useSocket();
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8800";

  // ✅ 1) Load or create conversation
  useEffect(() => {
    const loadConversation = async () => {
      try {
        const res = await axios.get(`${apiBase}/api/conversations`, {
          withCredentials: true,
        });

        const list = Array.isArray(res.data) ? res.data : [];
        if (list.length > 0) {
          setConversationId(list[0]._id);
        } else {
          const createRes = await axios.post(
            `${apiBase}/api/conversations`,
            {},
            { withCredentials: true },
          );
          if (createRes.data?._id) setConversationId(createRes.data._id);
        }
      } catch (e) {
        toast.error("Failed to load chat");
      }
    };

    loadConversation();
  }, [apiBase]);

  // ✅ 2) Load existing messages + mark read when conversationId ready
  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      try {
        const res = await axios.get(
          `${apiBase}/api/messages/${conversationId}`,
          {
            withCredentials: true,
          },
        );

        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        toast.error("Failed to load messages");
        setMessages([]);
      }
    };

    const markRead = async () => {
      try {
        await axios.put(
          `${apiBase}/api/conversations/${conversationId}/read`,
          {},
          { withCredentials: true },
        );
      } catch {
        // ignore
      }
    };

    setTypingUsers([]);
    loadMessages();
    markRead();

    // ✅ Chat open => unread dot off
    dispatch(setHasUnread(false));
  }, [conversationId, apiBase, dispatch]);

  // ✅ 3) Socket listeners
  useEffect(() => {
    if (!socket || !conversationId) return;

    joinConversation(conversationId);

    const handleReceive = (payload) => {
      if (payload?.conversationId !== conversationId) return;

      const incoming = payload?.message;
      if (!incoming?._id) return;

      setMessages((prev) => {
        if (prev.some((m) => m?._id === incoming._id)) return prev; // ✅ dedupe
        return [...prev, incoming];
      });

      // ✅ user is already on chat screen => keep dot off
      dispatch(setHasUnread(false));
    };

    const handleTyping = ({ conversationId: cid, userId, isTyping }) => {
      if (cid !== conversationId) return;

      setTypingUsers((prev) => {
        if (isTyping && !prev.includes(userId)) return [...prev, userId];
        if (!isTyping) return prev.filter((id) => id !== userId);
        return prev;
      });
    };

    socket.on("message:receive", handleReceive);
    socket.on("typing:update", handleTyping);

    return () => {
      leaveConversation(conversationId);
      socket.off("message:receive", handleReceive);
      socket.off("typing:update", handleTyping);
    };
  }, [socket, conversationId, joinConversation, dispatch]);

  return (
    <div className="w-full h-[calc(100vh-80px)] flex justify-center bg-slate-50 dark:bg-gray-900">
      <div className="w-full md:max-w-4xl lg:max-w-5xl h-full flex flex-col bg-white dark:bg-gray-900 shadow-sm">
        {!conversationId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Loading chat...
          </div>
        ) : (
          <Message
            conversationId={conversationId}
            messages={messages}
            typingUsers={typingUsers}
          />
        )}
      </div>
    </div>
  );
};

export default Chat;
