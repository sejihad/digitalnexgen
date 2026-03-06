import PropTypes from "prop-types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { setHasUnread } from "../redux/chatSlice";

const SocketContext = createContext(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Simple refs
  const pendingJoins = useRef(new Set());
  const socketInitialized = useRef(false);

  const dispatch = useDispatch();
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8800";
  const pathnameRef = useRef(window.location.pathname);

  // Route change tracking
  useEffect(() => {
    const onRouteChange = () => {
      pathnameRef.current = window.location.pathname;
    };
    window.addEventListener("popstate", onRouteChange);
    return () => window.removeEventListener("popstate", onRouteChange);
  }, []);

  // Initialize socket - ONLY ONCE
  useEffect(() => {
    if (socketInitialized.current) return;
    socketInitialized.current = true;

    console.log("🔌 Initializing socket connection to:", apiBase);

    const s = io(apiBase, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    s.on("connect", () => {
      console.log("✅ Socket connected! ID:", s.id);
      setIsConnected(true);

      // Process any queued joins
      if (pendingJoins.current.size > 0) {
        console.log(
          "🔄 Processing queued joins:",
          Array.from(pendingJoins.current),
        );
        pendingJoins.current.forEach((convId) => {
          s.emit("conversation:join", String(convId));
        });
        pendingJoins.current.clear();
      }
    });

    s.on("connect_error", (error) => {
      console.log("❌ Socket connection error:", error.message);
      setIsConnected(false);
    });

    s.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
      setIsConnected(false);
    });

    s.on("users:online", (payload) => {
      setOnlineCount(payload?.count || 0);
    });

    const handleIncoming = () => {
      const path = String(pathnameRef.current || "");
      const isOnChat =
        path === "/chat" ||
        path.startsWith("/chat/") ||
        path.startsWith("/admin/messages");
      if (!isOnChat) dispatch(setHasUnread(true));
    };

    s.on("message:receive", handleIncoming);
    s.on("admin:conversation:update", handleIncoming);

    setSocket(s);

    return () => {
      console.log("🧹 Cleaning up socket");
      s.off("connect");
      s.off("connect_error");
      s.off("disconnect");
      s.off("users:online");
      s.off("message:receive", handleIncoming);
      s.off("admin:conversation:update", handleIncoming);
      s.disconnect();
    };
  }, [apiBase, dispatch]); // Empty dependency array - runs once

  const joinConversation = useCallback(
    (conversationId) => {
      if (!conversationId) return;

      const convId = String(conversationId);

      if (socket?.connected) {
        console.log("🔊 Joining room:", convId);
        socket.emit("conversation:join", convId);
      } else {
        console.log("⏳ Queuing join for later:", convId);
        pendingJoins.current.add(convId);
      }
    },
    [socket],
  );

  const leaveConversation = useCallback(
    (conversationId) => {
      if (!conversationId) return;

      const convId = String(conversationId);
      pendingJoins.current.delete(convId);

      if (socket?.connected) {
        socket.emit("conversation:leave", convId);
      }
    },
    [socket],
  );

  const sendMessage = useCallback(
    ({ conversationId, text }) => {
      if (!conversationId || !text?.trim()) return false;

      if (socket?.connected) {
        console.log("📤 Sending message:", { conversationId, text });
        socket.emit("message:send", {
          conversationId: String(conversationId),
          text: String(text).trim(),
        });
        return true;
      }
      console.log("❌ Cannot send - socket not connected");
      return false;
    },
    [socket],
  );

  const startTyping = useCallback(
    (conversationId) => {
      if (socket?.connected && conversationId) {
        socket.emit("typing:start", { conversationId: String(conversationId) });
      }
    },
    [socket],
  );

  const stopTyping = useCallback(
    (conversationId) => {
      if (socket?.connected && conversationId) {
        socket.emit("typing:stop", { conversationId: String(conversationId) });
      }
    },
    [socket],
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineCount,
        joinConversation,
        leaveConversation,
        sendMessage,
        startTyping,
        stopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = { children: PropTypes.node.isRequired };
