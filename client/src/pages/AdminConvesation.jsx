import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AdminConvesation = () => {
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState([]);
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [buyerNames, setBuyerNames] = useState({});
  const [adminNames, setAdminNames] = useState({});

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      navigate("/auth/login");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) return;
    const fetchConversations = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${apiBaseUrl}/api/conversations/admin/all`, {
          withCredentials: true,
        });
        setConversations(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [apiBaseUrl, isAuthenticated, user, refreshKey]);

  // Load usernames for buyer/admin if the API returned only IDs
  useEffect(() => {
    const loadNames = async () => {
      const bMap = {};
      const aMap = {};
      for (const c of conversations) {
        try {
          const buyer = c?.buyerId;
          if (buyer && (typeof buyer === "string" || !buyer.username)) {
            const r = await axios.get(`${apiBaseUrl}/api/users/${typeof buyer === "string" ? buyer : buyer._id || buyer.id}`, { withCredentials: true });
            bMap[c._id || c.id] = r.data?.username || r.data?.email || (buyer.username || buyer.email || buyer);
          }
        } catch {
          // ignore per item errors
        }
        try {
          const admin = c?.adminId;
          if (admin && (typeof admin === "string" || !admin.username)) {
            const r = await axios.get(`${apiBaseUrl}/api/users/${typeof admin === "string" ? admin : admin._id || admin.id}`, { withCredentials: true });
            aMap[c._id || c.id] = r.data?.username || r.data?.email || (admin.username || admin.email || admin);
          }
        } catch {
          // ignore per item errors
        }
      }
      if (Object.keys(bMap).length) setBuyerNames((prev) => ({ ...prev, ...bMap }));
      if (Object.keys(aMap).length) setAdminNames((prev) => ({ ...prev, ...aMap }));
    };
    if (conversations.length > 0) loadNames();
  }, [conversations, apiBaseUrl]);

  const filtered = useMemo(() => {
    if (!query) return conversations;
    const q = query.toLowerCase();
    return conversations.filter((c) => {
      const key = c?._id || c?.id;
      const buyer = buyerNames[key] || c?.buyerId?.username || c?.buyerId?.email || c?.buyerId || "";
      const admin = adminNames[key] || c?.adminId?.username || c?.adminId?.email || c?.adminId || "";
      const last = c?.lastMessage || "";
      const idStr = String(c?._id || c?.id || "");
      return (
        String(buyer).toLowerCase().includes(q) ||
        String(admin).toLowerCase().includes(q) ||
        String(last).toLowerCase().includes(q) ||
        idStr.toLowerCase().includes(q)
      );
    });
  }, [query, conversations, buyerNames, adminNames]);

  const openConversation = (id) => {
    if (!id) return;
    navigate(`/messages/${id}`);
  };

  const deleteConversation = async (conv) => {
    const id = conv?._id || conv?.id;
    if (!id) return;
    try {
      await axios.delete(`${apiBaseUrl}/api/conversations/${id}`, { withCredentials: true });
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete conversation");
    }
  };

  return (
    <div>
      <div className="max-w-[1200px] w-11/12 mx-auto py-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Conversations</h1>
      <div className="flex items-center gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by  email, id, or last message"
          className="flex-1 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primaryRgb dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
        />
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="px-4 py-2 rounded-md bg-primaryRgb text-white hover:opacity-90"
        >
          Refresh
        </button>
      </div>
      {error && <div className="mb-3 text-red-500 text-sm">{error}</div>}
      {loading ? (
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-600 dark:text-gray-300">No conversations found.</div>
      ) : (
        <div className="overflow-x-auto rounded-md border bg-white text-gray-900 border-gray-200 dark:bg-[#1f1f1f] dark:text-gray-100 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#2a2a2a]">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">Buyer Username</th>
                <th className="text-left px-4 py-2 font-semibold">Last Message</th>
                <th className="text-left px-4 py-2 font-semibold">Updated</th>
                <th className="text-left px-4 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={String(c?._id || c?.id)} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2 align-top">
                    <div className="text-sm">
                      {buyerNames[c?._id || c?.id] || c?.buyerId?.username || c?.buyerId?.email || c?.buyerId}
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top">
                    <div className="text-sm break-words max-w-[420px]">
                      {c?.lastMessage || ""}
                    </div>
                  </td>
                
                  <td className="px-4 py-2 align-top whitespace-nowrap">
                    {c?.updatedAt ? new Date(c.updatedAt).toLocaleString() : ""}
                  </td>
                  <td className="px-4 py-2 align-top flex gap-2">
                    <button
                      onClick={() => openConversation(c?._id)}
                      className="px-3 py-1 rounded bg-primaryRgb text-white hover:opacity-90"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => deleteConversation(c)}
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminConvesation;
