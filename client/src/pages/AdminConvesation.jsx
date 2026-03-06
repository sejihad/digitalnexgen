// src/pages/AdminConversation.jsx
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext.jsx";

const safeStr = (v) => String(v ?? "");

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

  // ✅ Delete modal + loading
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Avoid calling refresh repeatedly (burst of socket events)
  const refreshCooldownRef = useRef(false);

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

        // ✅ normalize array + sort by updatedAt desc
        const list = Array.isArray(res.data) ? res.data : [];
        list.sort((a, b) => {
          const ta = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
          const tb = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
          return tb - ta;
        });

        setConversations(list);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [apiBaseUrl, isAuthenticated, user, refreshKey]);

  /**
   * ✅ Real-time update:
   * - Update lastMessage + updatedAt
   * - Set readByAdmins=false (show dot) when message is from someone else
   * - Move updated conversation to TOP
   * - If conversation not in list => trigger a refresh (cooldown to prevent spam)
   */
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (payload) => {
      console.log("📩 ADMIN UPDATE EVENT:", payload);
      const cid = safeStr(payload?.conversationId);
      const msgObj = payload?.message;
      const senderId = safeStr(payload?.senderId);

      if (!cid) return;

      // মেসেজ টেক্সট বের করা
      const msgText =
        typeof msgObj === "string"
          ? msgObj
          : safeStr(msgObj?.message || msgObj?.text || msgObj?.content || "");

      const msgCreatedAt = msgObj?.createdAt || new Date().toISOString();
      const fromMe = senderId && safeStr(user?._id || user?.id) === senderId;

      setConversations((prev) => {
        const idx = prev.findIndex((c) => safeStr(c?._id) === cid);

        // যদি কনভারসেশন লিস্টে না থাকে (নতুন কাস্টমার মেসেজ দিলে)
        if (idx === -1) {
          if (!refreshCooldownRef.current) {
            refreshCooldownRef.current = true;
            setRefreshKey((k) => k + 1);
            setTimeout(() => {
              refreshCooldownRef.current = false;
            }, 2000);
          }
          return prev;
        }

        const existing = prev[idx];
        const updated = {
          ...existing,
          lastMessage: msgText,
          updatedAt: msgCreatedAt,
          readByAdmins: fromMe ? true : false, // যদি আমি না পাঠাই, তবে আনরিড (ডট দেখাবে)
        };

        const next = [...prev];
        next.splice(idx, 1); // পুরোনো পজিশন থেকে সরাও
        return [updated, ...next]; // সবার উপরে দাও
      });
    };

    // শুধুমাত্র এই একটি ইভেন্ট লিসেন করাই যথেষ্ট অ্যাডমিন লিস্টের জন্য
    socket.on("admin:conversation:update", handleReceive);

    // ব্যাকআপ হিসেবে যদি ওপেন চ্যাটে থাকে
    socket.on("message:receive", handleReceive);

    return () => {
      socket.off("admin:conversation:update", handleReceive);
      socket.off("message:receive", handleReceive);
    };
  }, [socket, user?._id]); // query সরিয়ে ফেলো এখান থেকে
  // search filter
  const filtered = useMemo(() => {
    if (!query) return conversations;

    const q = query.toLowerCase();

    return conversations.filter((c) => {
      const buyer =
        c?.customerId?.name ||
        c?.customerId?.username ||
        c?.customerId?.email ||
        "";

      const last = c?.lastMessage || "";

      return (
        buyer.toLowerCase().includes(q) ||
        last.toLowerCase().includes(q) ||
        safeStr(c._id).toLowerCase().includes(q)
      );
    });
  }, [query, conversations]);

  const openConversation = (id) => {
    // ✅ Optimistic: hide dot immediately in list
    setConversations((prev) =>
      prev.map((c) =>
        safeStr(c._id) === safeStr(id) ? { ...c, readByAdmins: true } : c,
      ),
    );

    navigate(`/admin/messages/${id}`);
    // ✅ Real DB read flag should be set in /admin/messages/:id page via PUT /read
  };

  // ✅ open confirm modal
  const askDelete = (conv) => {
    setError("");
    setDeleteTarget(conv);
    setDeleteModalOpen(true);
  };

  // ✅ confirm delete
  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;

    const id = deleteTarget._id;
    setDeletingId(id);
    setError("");

    try {
      await axios.delete(`${apiBaseUrl}/api/conversations/${id}`, {
        withCredentials: true,
      });

      // instant UI update
      setConversations((prev) => prev.filter((c) => c._id !== id));

      setDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete conversation");
    } finally {
      setDeletingId(null);
    }
  };

  const closeDeleteModal = () => {
    if (deletingId) return;
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-5">Conversations</h1>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search buyer or message..."
          className="flex-1 px-4 py-2 rounded-md border bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
        />

        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      {loading ? (
        <div className="text-gray-500 dark:text-gray-300">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-300">
          No conversations found.
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Buyer</th>
                  <th className="px-4 py-3 text-left">Last Message</th>
                  <th className="px-4 py-3 text-left">Updated</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((c) => {
                  const isDeleting = deletingId === c._id;
                  const isUnread = c?.readByAdmins === false;

                  return (
                    <tr
                      key={c._id}
                      className={`border-t border-gray-200 dark:border-gray-700 ${
                        isUnread ? "bg-blue-50/60 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      {/* ✅ Buyer + dot */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                          )}
                          <span>
                            {c?.customerId?.name ||
                              c?.customerId?.username ||
                              c?.customerId?.email ||
                              "Unknown"}
                          </span>
                        </div>
                      </td>

                      {/* ✅ Last message (bold when unread) */}
                      <td
                        className={`px-4 py-3 max-w-[400px] truncate ${
                          isUnread ? "font-semibold" : ""
                        }`}
                      >
                        {c?.lastMessage || "No message"}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {c?.updatedAt
                          ? new Date(c.updatedAt).toLocaleString()
                          : ""}
                      </td>

                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => openConversation(c._id)}
                          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                          disabled={isDeleting}
                        >
                          Open
                        </button>

                        <button
                          onClick={() => askDelete(c)}
                          className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((c) => {
              const isDeleting = deletingId === c._id;
              const isUnread = c?.readByAdmins === false;

              return (
                <div
                  key={c._id}
                  className={`border rounded-lg p-4 bg-white dark:bg-gray-800 dark:border-gray-700 ${
                    isUnread ? "ring-1 ring-blue-200 dark:ring-blue-900" : ""
                  }`}
                >
                  <div className="flex justify-between mb-1">
                    {/* ✅ Buyer + dot */}
                    <div className="font-medium flex items-center gap-2">
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                      )}
                      {c?.customerId?.name ||
                        c?.customerId?.username ||
                        c?.customerId?.email ||
                        "Unknown"}
                    </div>

                    <div className="text-xs text-gray-400">
                      {c?.updatedAt
                        ? new Date(c.updatedAt).toLocaleDateString()
                        : ""}
                    </div>
                  </div>

                  <div
                    className={`text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 ${
                      isUnread ? "font-semibold" : ""
                    }`}
                  >
                    {c?.lastMessage || "No messages yet"}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openConversation(c._id)}
                      className="flex-1 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
                      disabled={isDeleting}
                    >
                      Open
                    </button>

                    <button
                      onClick={() => askDelete(c)}
                      className="flex-1 py-2 rounded bg-red-600 text-white disabled:opacity-60"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ✅ Confirm Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeDeleteModal}
          />

          {/* modal */}
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl p-5">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Delete conversation?
            </div>

            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              This action cannot be undone. Are you sure you want to delete this
              conversation with{" "}
              <span className="font-semibold">
                {deleteTarget?.customerId?.name ||
                  deleteTarget?.customerId?.username ||
                  deleteTarget?.customerId?.email ||
                  "this user"}
              </span>
              ?
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={closeDeleteModal}
                disabled={Boolean(deletingId)}
                className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700
                disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={Boolean(deletingId)}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deletingId ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConversation;
