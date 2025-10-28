import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!currentUser?._id) {
      // Disconnect if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
      }
      return;
    }

    // Connect to Socket.IO server
    const newSocket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:8800", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);

      // Join with user ID
      newSocket.emit("user:join", currentUser._id);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      setIsConnected(false);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    // Listen for online users
    newSocket.on("users:online", (users) => {
      setOnlineUsers(users);
      console.log("👥 Online users:", users);
    });

    setSocket(newSocket);

    // Cleanup on unmount or user change
    return () => {
      newSocket.close();
    };
  }, [currentUser?._id]); // Only depend on currentUser._id

  const sendMessage = (data) => {
    if (socket && isConnected) {
      socket.emit("message:send", data);
    }
  };

  const startTyping = (conversationId) => {
    if (socket && isConnected && currentUser) {
      socket.emit("typing:start", { conversationId, userId: currentUser._id });
    }
  };

  const stopTyping = (conversationId) => {
    if (socket && isConnected && currentUser) {
      socket.emit("typing:stop", { conversationId, userId: currentUser._id });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        sendMessage,
        startTyping,
        stopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
