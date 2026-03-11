import axios from "axios";
import { Bell, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { setHasUnreadNotifications } from "../redux/notifySlice";

const DIRECT_LINK_TYPES = ["message", "offer", "order", "review-request"];

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const apiBase = import.meta.env.VITE_API_BASE_URL;

  const notificationIds = useMemo(
    () => new Set(notifications.map((item) => String(item._id))),
    [notifications],
  );

  const fetchNotifications = async (pageNumber = 1, append = false) => {
    try {
      if (!append) setLoading(true);

      const res = await axios.get(`${apiBase}/api/notifies`, {
        params: { page: pageNumber, limit: 10 },
        withCredentials: true,
      });

      const list = Array.isArray(res.data?.notifications)
        ? res.data.notifications
        : [];

      setNotifications((prev) => {
        if (!append) return list;

        const prevIds = new Set(prev.map((item) => String(item._id)));
        const merged = [...prev];

        for (const item of list) {
          if (!prevIds.has(String(item._id))) {
            merged.push(item);
          }
        }

        return merged;
      });

      setHasMore(Boolean(res.data?.hasMore));
    } catch {
      if (!append) {
        setNotifications([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${apiBase}/api/notifies/read-all`,
        {},
        { withCredentials: true },
      );

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        })),
      );

      dispatch(setHasUnreadNotifications(false));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiBase}/api/notifies/${id}`, {
        withCredentials: true,
      });

      setNotifications((prev) =>
        prev.filter((item) => String(item._id) !== String(id)),
      );
    } catch {}
  };

  const handleOpen = async (item) => {
    try {
      if (!item?.isRead) {
        await axios.put(
          `${apiBase}/api/notifies/${item._id}/read`,
          {},
          { withCredentials: true },
        );

        setNotifications((prev) =>
          prev.map((n) =>
            String(n._id) === String(item._id) ? { ...n, isRead: true } : n,
          ),
        );
      }
    } catch {}

    const type = String(item?.notify?.type || "");
    const link = String(item?.notify?.link || "").trim();

    if (DIRECT_LINK_TYPES.includes(type) && link) {
      navigate(link);
      return;
    }

    navigate(`/notifications/${item._id}`);
  };

  useEffect(() => {
    fetchNotifications(1, false);
    markAllAsRead();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingNotification = (payload) => {
      if (!payload?._id) return;

      setNotifications((prev) => {
        const exists = prev.some(
          (item) => String(item._id) === String(payload._id),
        );
        if (exists) return prev;
        return [payload, ...prev];
      });
    };

    socket.off("notification:new", handleIncomingNotification);
    socket.on("notification:new", handleIncomingNotification);

    return () => {
      socket.off("notification:new", handleIncomingNotification);
    };
  }, [socket, notificationIds]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 px-4 py-5">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 flex items-center gap-3 border-b border-black/10 pb-3 dark:border-white/10">
            <Bell className="w-5 h-5 text-[rgb(12,187,20)]" />
            <h1 className="text-lg font-bold text-[rgb(12,187,20)]">
              Notifications
            </h1>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No notifications found.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => (
                <div
                  key={item._id}
                  className={`rounded-xl border p-4 transition ${
                    item.isRead
                      ? "border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/5"
                      : "border-green-200 bg-green-50/70 dark:border-green-500/20 dark:bg-green-500/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => handleOpen(item)}
                      className="flex-1 text-left"
                    >
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item?.notify?.title || "Notification"}
                      </div>

                      <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {item?.notify?.message || ""}
                      </div>

                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Type: {item?.notify?.type || "system"}
                      </div>

                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {item?.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : ""}
                      </div>
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-500 hover:text-red-600"
                      title="Delete notification"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  fetchNotifications(nextPage, true);
                }}
                className="rounded-lg bg-[rgb(12,187,20)] px-4 py-2 text-sm font-medium text-white hover:brightness-95"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;