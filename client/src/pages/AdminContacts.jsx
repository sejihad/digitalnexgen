import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "archived", label: "Archived" },
];

const AdminContacts = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, user, navigate]);

  const fetchList = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${apiBaseUrl}/api/contact/admin`, {
        params: { status, page, limit },
        withCredentials: true,
      });
      setItems(res.data?.items || []);
      setTotal(res.data?.total || 0);
    } catch (e) {
      setError(e?.response?.data || "Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, limit, isAuthenticated, user]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.name, it.email, it.subject, it.message].some((v) => String(v || "").toLowerCase().includes(q))
    );
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        `${apiBaseUrl}/api/contact/admin/${id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      // optimistic: update local
      setItems((prev) => prev.map((it) => (String(it._id) === String(id) ? { ...it, status: newStatus } : it)));
    } catch (e) {
      setError(e?.response?.data || "Failed to update status");
    }
  };

  const deleteItem = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this message?");
    if (!ok) return;
    try {
      await axios.delete(`${apiBaseUrl}/api/contact/admin/${id}`, { withCredentials: true });
      setItems((prev) => prev.filter((it) => String(it._id) !== String(id)));
      setTotal((t) => Math.max(0, t - 1));
    } catch (e) {
      setError(e?.response?.data || "Failed to delete message");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl w-11/12 mx-auto py-6">
        <h1 className="text-2xl font-semibold text-primaryRgb mb-4">Contact Messages</h1>

        {error && <div className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</div>}

        <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between mb-4">
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-black/10 dark:border-white/10 focus:outline-none"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Per page</label>
              <select
                value={limit}
                onChange={(e) => {
                  setPage(1);
                  setLimit(Number(e.target.value));
                }}
                className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-black/10 dark:border-white/10 focus:outline-none"
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 md:max-w-sm">
            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Search</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, subject, message"
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60"
            />
          </div>

          <button
            onClick={fetchList}
            className="px-4 py-2 rounded-md bg-[rgb(12,187,20)] text-white hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-800/70 backdrop-blur">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Subject</th>
                <th className="text-left px-4 py-2">Message</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Created</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-600 dark:text-gray-300">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-600 dark:text-gray-300">No messages found.</td>
                </tr>
              ) : (
                filtered.map((it) => (
                  <tr key={it._id} className="border-t border-black/10 dark:border-gray-700">
                    <td className="px-4 py-2 align-top whitespace-nowrap max-w-[160px] truncate" title={it.name}>{it.name}</td>
                    <td className="px-4 py-2 align-top whitespace-nowrap max-w-[200px] truncate" title={it.email}>{it.email}</td>
                    <td className="px-4 py-2 align-top whitespace-nowrap max-w-[200px] truncate" title={it.subject}>{it.subject}</td>
                    <td className="px-4 py-2 align-top max-w-[420px]">
                      <div className="line-clamp-3" title={it.message}>{it.message}</div>
                    </td>
                    <td className="px-4 py-2 align-top">
                      <select
                        value={it.status}
                        onChange={(e) => updateStatus(it._id, e.target.value)}
                        className="px-2 py-1 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-black/10 dark:border-white/10"
                      >
                        {STATUS_OPTIONS.filter((o) => o.value !== "").map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 align-top whitespace-nowrap">
                      {new Date(it.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 align-top whitespace-nowrap">
                      <button
                        onClick={() => deleteItem(it._id)}
                        className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/40"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Page {page} of {totalPages} · {total} total
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContacts;
