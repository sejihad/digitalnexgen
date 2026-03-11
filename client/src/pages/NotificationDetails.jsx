import axios from "axios";
import { Bell, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const NotificationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNotification = async () => {
      try {
        const res = await axios.get(`${apiBase}/api/notifies/${id}`, {
          withCredentials: true,
        });

        const item = res?.data?.notification || null;
        setNotification(item);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Failed to load notification details.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadNotification();
    } else {
      setError("Notification id is missing.");
      setLoading(false);
    }
  }, [apiBase, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 px-4 py-5">
        <div className="mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white/70 p-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Loading notification...
          </div>
        </div>
      </div>
    );
  }

  if (error || !notification?.notify) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 px-4 py-5">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-4 shadow-lg dark:border-red-500/20 dark:bg-red-500/10">
          <div className="text-sm text-red-600 dark:text-red-300">
            {error || "Notification not found."}
          </div>
        </div>
      </div>
    );
  }

  const notify = notification.notify;
  const link = String(notify.link || "").trim();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 px-4 py-5">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 flex items-center gap-3 border-b border-black/10 pb-3 dark:border-white/10">
            <Bell className="w-5 h-5 text-[rgb(12,187,20)]" />
            <h1 className="text-lg font-bold text-[rgb(12,187,20)]">
              Notification Details
            </h1>
          </div>

          {notify?.image?.url && (
            <div className="mb-4 overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
              <img
                src={notify.image.url}
                alt={notify.title || "Notification"}
                className="w-full max-h-[360px] object-cover"
              />
            </div>
          )}

          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Title
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {notify.title || "Notification"}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Message
              </div>
              <div className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
                {notify.message || ""}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Type
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {notify.type || "system"}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Created
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {notification?.createdAt
                  ? new Date(notification.createdAt).toLocaleString()
                  : ""}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/notifications")}
              className="rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            >
              Back
            </button>

            {link && (
              <button
                onClick={() => navigate(link)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[rgb(12,187,20)] px-4 py-2 text-sm font-medium text-white hover:brightness-95 transition"
              >
                <ExternalLink size={16} />
                Open Link
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetails;
