import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext.jsx";

const AdminConversation = () => {
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { socket } = useSocket();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState([]);
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [buyerNames, setBuyerNames] = useState({});
  const [adminNames, setAdminNames] = useState({});

  // Auth check
  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch conversations
  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) return;

    const fetchConversations = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `${apiBaseUrl}/api/conversations/admin/all`,
          { withCredentials: true },
        );
        setConversations(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [apiBaseUrl, isAuthenticated, user, refreshKey]);

  // Load buyer/admin names
  useEffect(() => {
    const loadNames = async () => {
      const bMap = {};
      const aMap = {};

      for (const c of conversations) {
        try {
          const buyerId =
            typeof c?.buyerId === "string" ? c.buyerId : c?.buyerId?._id;

          if (buyerId) {
            const res = await axios.get(`${apiBaseUrl}/api/users/${buyerId}`, {
              withCredentials: true,
            });
            bMap[c._id] = res.data?.name || res.data?.email || buyerId;
          }
        } catch {}

        try {
          const adminId =
            typeof c?.adminId === "string" ? c.adminId : c?.adminId?._id;

          if (adminId) {
            const res = await axios.get(`${apiBaseUrl}/api/users/${adminId}`, {
              withCredentials: true,
            });
            aMap[c._id] = res.data?.name || res.data?.email || adminId;
          }
        } catch {}
      }

      setBuyerNames((p) => ({ ...p, ...bMap }));
      setAdminNames((p) => ({ ...p, ...aMap }));
    };

    if (conversations.length) loadNames();
  }, [conversations, apiBaseUrl]);

  // Realtime last message update
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg) => {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msg.conversationId
            ? {
                ...c,
                lastMessage: msg.message,
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
      );
    };

    socket.on("message:receive", handleReceive);
    return () => socket.off("message:receive", handleReceive);
  }, [socket]);

  // Filter
  const filtered = useMemo(() => {
    if (!query) return conversations;
    const q = query.toLowerCase();

    return conversations.filter((c) => {
      const buyer = buyerNames[c._id] || "";
      const admin = adminNames[c._id] || "";
      const last = c?.lastMessage || "";

      return (
        buyer.toLowerCase().includes(q) ||
        admin.toLowerCase().includes(q) ||
        last.toLowerCase().includes(q) ||
        String(c._id).toLowerCase().includes(q)
      );
    });
  }, [query, conversations, buyerNames, adminNames]);

  const openConversation = (id) => {
    if (id) navigate(`/admin/messages/${id}`);
  };

  const deleteConversation = async (conv) => {
    if (!conv?._id) return;
    try {
      await axios.delete(`${apiBaseUrl}/api/conversations/${conv._id}`, {
        withCredentials: true,
      });
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete conversation");
    }
  };

  return (
    <div className="max-w-[1200px] w-11/12 mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Conversations
      </h1>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by buyer, admin, message, or id"
          className="flex-1 px-3 py-2 rounded-md border bg-white text-gray-900
          focus:ring-2 focus:ring-primaryRgb
          dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
        />
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="px-4 py-2 rounded-md bg-primaryRgb text-white"
        >
          Refresh
        </button>
      </div>

      {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500">No conversations found.</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-md border bg-white dark:bg-[#1f1f1f] dark:border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-[#2a2a2a]">
                <tr>
                  <th className="px-4 py-2 text-left dark:text-white">Buyer</th>
                  <th className="px-4 py-2 text-left dark:text-white">
                    Last Message
                  </th>
                  <th className="px-4 py-2 text-left dark:text-white">
                    Updated
                  </th>
                  <th className="px-4 py-2 text-left dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id} className="border-t dark:border-gray-700">
                    <td className="px-4 py-2 dark:text-gray-300">
                      {buyerNames[c._id] || c?.buyerId}
                    </td>
                    <td className="px-4 py-2 max-w-[420px] truncate dark:text-gray-300">
                      {c?.lastMessage || ""}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap dark:text-gray-300">
                      {c?.updatedAt
                        ? new Date(c.updatedAt).toLocaleString()
                        : ""}
                    </td>
                    <td className="px-4 py-2 flex gap-2 dark:text-gray-300">
                      <button
                        onClick={() => openConversation(c._id)}
                        className="px-3 py-1 rounded bg-primaryRgb text-white"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => deleteConversation(c)}
                        className="px-3 py-1 rounded bg-red-600 text-white"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((c) => (
              <div
                key={c._id}
                className="border rounded-lg p-4 bg-white dark:bg-[#1f1f1f] dark:border-gray-700"
              >
                <div className="flex justify-between mb-1">
                  <div className="font-medium">
                    {buyerNames[c._id] || c?.buyerId}
                  </div>
                  <div className="text-xs text-gray-400">
                    {c?.updatedAt
                      ? new Date(c.updatedAt).toLocaleDateString()
                      : ""}
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                  {c?.lastMessage || "No messages yet"}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openConversation(c._id)}
                    className="flex-1 py-2 rounded bg-primaryRgb text-white text-sm"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => deleteConversation(c)}
                    className="flex-1 py-2 rounded bg-red-600 text-white text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminConversation;
