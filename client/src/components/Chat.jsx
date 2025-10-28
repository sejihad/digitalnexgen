import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Message from "./Message";

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [buyerNames, setBuyerNames] = useState({});
  const [counterpartNames, setCounterpartNames] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      toast("You aren't authenticated");
      return;
    }
    setIsAdmin(userData.isAdmin === true);
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/conversations`,
          { withCredentials: true }
        );
        setConversations(response.data);
        if (response.data?.length && !selectedId) {
          setSelectedId(response.data[0]._id);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Error fetching conversations, please try again.");
      }
    };

    fetchConversations();
  }, []);

  // Load buyer usernames for admin
  useEffect(() => {
    const loadBuyerNames = async () => {
      const namesMap = {};
      for (const conv of conversations) {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/users/${conv.buyerId}`,
            { withCredentials: true }
          );
          namesMap[conv._id] = res.data.username;
        } catch (error) {
          namesMap[conv._id] = "Unknown";
        }
      }
      setBuyerNames(namesMap);
    };

    if (isAdmin && conversations.length > 0) {
      loadBuyerNames();
    }
  }, [conversations, isAdmin]);

  // Load counterpart usernames for non-admin (admin or seller)
  useEffect(() => {
    const loadCounterparts = async () => {
      const namesMap = {};
      for (const conv of conversations) {
        const targetId = conv.adminId || conv.sellerId;
        if (!targetId) continue;
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/users/${targetId}`,
            { withCredentials: true }
          );
          const u = res?.data || {};
          namesMap[conv._id] = u.fullName || u.name || u.username || "Admin";
        } catch {
          namesMap[conv._id] = "Admin";
        }
      }
      setCounterpartNames(namesMap);
    };

    if (!isAdmin && conversations.length > 0) {
      loadCounterparts();
    }
  }, [conversations, isAdmin]);

  const handleSelect = (id) => {
    setSelectedId(id);
  };


  return (
    <div className="h-[calc(100vh-80px)] bg-slate-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 flex">
      <aside className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-3 flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="font-semibold">Conversations</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No conversations yet.</div>
          ) : (
            <ul>
              {conversations.map((conv) => {
                const title = isAdmin
                  ? (buyerNames[conv._id] || "Loading...")
                  : (counterpartNames[conv._id] || "Loading...");
                const active = selectedId === conv._id;
                return (
                  <li key={conv._id}>
                    <button
                      onClick={() => handleSelect(conv._id)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 ${active ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                    >
                      <div className="text-sm font-medium truncate">{title}</div>
                      <div className="text-xs text-gray-500 truncate">{conv.lastMessage}</div>
                      <div className="text-[10px] text-gray-400">{new Date(conv.updatedAt).toLocaleString()}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <main className="flex flex-1 min-h-0 overflow-y-auto">
        {selectedId ? (
          <div className="flex-1 min-h-0">
            <Message conversationId={selectedId} />
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex items-center justify-center text-gray-500">
            Select a conversation from the left.
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
