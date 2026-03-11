import axios from "axios";
import {
  Bell,
  Image as ImageIcon,
  Link as LinkIcon,
  Search,
  Send,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const AdminSendNotification = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState({ type: "", text: "" });

  const [sendType, setSendType] = useState("all");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const apiBase = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await axios.get(`${apiBase}/api/users`, {
          withCredentials: true,
        });

        setUsers(res?.data?.users || []);
      } catch (err) {
        setResult({
          type: "error",
          text: err?.response?.data?.message || "Failed to load users list.",
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [apiBase]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) => {
      const username = String(user?.username || "").toLowerCase();
      const email = String(user?.email || "").toLowerCase();
      const country = String(user?.country || "").toLowerCase();
      const phone = String(user?.phone || "").toLowerCase();

      return (
        username.includes(query) ||
        email.includes(query) ||
        country.includes(query) ||
        phone.includes(query)
      );
    });
  }, [users, userSearch]);

  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredUsers.map((user) => user._id);

    const allAlreadySelected = filteredIds.every((id) =>
      selectedUsers.includes(id),
    );

    if (allAlreadySelected) {
      setSelectedUsers((prev) =>
        prev.filter((id) => !filteredIds.includes(id)),
      );
    } else {
      setSelectedUsers((prev) => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const clearSelectedUsers = () => {
    setSelectedUsers([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = String(title || "").trim();
    const trimmedMessage = String(message || "").trim();
    const trimmedLink = String(link || "").trim();

    if (!trimmedTitle || !trimmedMessage) {
      setResult({
        type: "error",
        text: "Title and message are required.",
      });
      return;
    }

    if (sendType === "selected" && selectedUsers.length === 0) {
      setResult({
        type: "error",
        text: "Please select at least one user.",
      });
      return;
    }

    try {
      setSending(true);
      setResult({ type: "", text: "" });

      const formData = new FormData();
      formData.append("title", trimmedTitle);
      formData.append("message", trimmedMessage);
      formData.append("type", "system");

      if (trimmedLink) {
        formData.append("link", trimmedLink);
      }

      if (image) {
        formData.append("image", image);
      }

      if (sendType === "selected") {
        formData.append("users", JSON.stringify(selectedUsers));
      }

      const res = await axios.post(`${apiBase}/api/notifies/send`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult({
        type: "success",
        text: res?.data?.message || "Notification sent successfully.",
      });

      setTitle("");
      setMessage("");
      setLink("");
      setImage(null);
      setUserSearch("");
      setSelectedUsers([]);
      setSendType("all");
    } catch (err) {
      setResult({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Failed to send notification. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  const allFilteredSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((user) => selectedUsers.includes(user._id));

  return (
    <div className="min-h-screen bg-white px-4 py-5 text-gray-900 dark:bg-black dark:text-gray-100">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-5">
          <div className="mb-4 flex items-center gap-3 border-b border-black/10 pb-3 dark:border-white/10">
            <Bell className="h-5 w-5 text-[rgb(12,187,20)]" />
            <div>
              <h1 className="text-lg font-bold text-[rgb(12,187,20)] sm:text-xl">
                Send Notification
              </h1>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                Send notification to all users or search and select specific
                users.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Send To
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${
                    sendType === "all"
                      ? "border-[rgb(12,187,20)] bg-[rgb(12,187,20)]/5"
                      : "border-black/10 dark:border-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="sendType"
                    value="all"
                    checked={sendType === "all"}
                    onChange={(e) => setSendType(e.target.value)}
                  />
                  <div>
                    <p className="font-medium">All Users</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Broadcast notification to everyone
                    </p>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${
                    sendType === "selected"
                      ? "border-[rgb(12,187,20)] bg-[rgb(12,187,20)]/5"
                      : "border-black/10 dark:border-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="sendType"
                    value="selected"
                    checked={sendType === "selected"}
                    onChange={(e) => setSendType(e.target.value)}
                  />
                  <div>
                    <p className="font-medium">Specific Users</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Search and select one or more users
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {sendType === "selected" && (
              <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                  <Users className="h-4 w-4" />
                  Search & Select Users
                </label>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by username, email, country, or phone"
                    className="w-full rounded-xl border border-black/10 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-[rgb(12,187,20)] dark:border-white/10 dark:bg-black dark:text-white"
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                  >
                    {allFilteredSelected
                      ? "Unselect Filtered"
                      : "Select Filtered"}
                  </button>

                  <button
                    type="button"
                    onClick={clearSelectedUsers}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/20 dark:text-red-300 dark:hover:bg-red-500/10"
                  >
                    Clear Selected
                  </button>

                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Selected: {selectedUsers.length}
                  </span>
                </div>

                <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-black">
                  {loadingUsers ? (
                    <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                      Loading users...
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                      No users found.
                    </div>
                  ) : (
                    <div className="divide-y divide-black/5 dark:divide-white/10">
                      {filteredUsers.map((user) => {
                        const checked = selectedUsers.includes(user._id);

                        return (
                          <label
                            key={user._id}
                            className="flex cursor-pointer items-center justify-between gap-3 px-3 py-3 transition hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                {user?.username || "No username"}
                              </p>
                              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                {user?.email || "No email"}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {user?.country && (
                                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-white/10 dark:text-gray-300">
                                    {user.country}
                                  </span>
                                )}
                                {user?.phone && (
                                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-white/10 dark:text-gray-300">
                                    {user.phone}
                                  </span>
                                )}
                              </div>
                            </div>

                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleUserToggle(user._id)}
                              className="h-4 w-4 accent-[rgb(12,187,20)]"
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notification title"
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[rgb(12,187,20)] dark:border-white/10 dark:bg-black dark:text-white"
              />
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Message
              </label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your notification message..."
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[rgb(12,187,20)] dark:border-white/10 dark:bg-black dark:text-white"
              />
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                <LinkIcon className="h-4 w-4" />
                Optional Link
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Example: /admin/orders or /orders/123"
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[rgb(12,187,20)] dark:border-white/10 dark:bg-black dark:text-white"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Leave empty if you do not want to attach a link.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                <ImageIcon className="h-4 w-4" />
                Optional Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-[rgb(12,187,20)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:brightness-95"
              />

              {image && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Selected: {image.name}
                </p>
              )}
            </div>

            {result.text && (
              <div
                className={`rounded-xl border px-3 py-2 text-sm ${
                  result.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300"
                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                }`}
              >
                {result.text}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-xl bg-[rgb(12,187,20)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSendNotification;
