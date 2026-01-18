import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

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
  // ধরছি: currentUser.token এ JWT আছে

  useEffect(() => {
    // user logout হলে socket বন্ধ
    if (!currentUser?.token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setOnlineUsers([]);
      setIsConnected(false);
      return;
    }

    // socket connect
    const newSocket = io(
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8800",
      {
        withCredentials: true,
      }
    );

    newSocket.on("connect", () => {
      setIsConnected(true);

      // 🔑 backend token expect করে
      newSocket.emit("user:join", currentUser.token);
    });

    newSocket.on("disconnect", (reason) => {
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      setIsConnected(false);
    });

    // online users list
    newSocket.on("users:online", (users) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    // cleanup
    return () => {
      newSocket.disconnect();
    };
  }, [currentUser?.token]);

  /* =========================
     SOCKET HELPERS
  ==========================*/

  const joinConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit("conversation:join", conversationId);
    }
  };

  const sendMessage = ({ conversationId, receiverId, message }) => {
    if (socket && isConnected) {
      socket.emit("message:send", {
        conversationId,
        receiverId,
        message,
      });
    }
  };

  const startTyping = (conversationId) => {
    if (socket && isConnected) {
      socket.emit("typing:start", { conversationId });
    }
  };

  const stopTyping = (conversationId) => {
    if (socket && isConnected) {
      socket.emit("typing:stop", { conversationId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        joinConversation,
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
