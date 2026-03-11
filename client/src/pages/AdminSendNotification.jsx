import axios from "axios";
import { Bell, Image as ImageIcon, Link as LinkIcon, Send } from "lucide-react";
import { useState } from "react";

const AdminSendNotification = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState({ type: "", text: "" });

  const apiBase = import.meta.env.VITE_API_BASE_URL;

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

    try {
      setSending(true);
      setResult({ type: "", text: "" });

      const formData = new FormData();
      formData.append("title", trimmedTitle);
      formData.append("message", trimmedMessage);

      if (trimmedLink) {
        formData.append("link", trimmedLink);
      }

      if (image) {
        formData.append("image", image);
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
                Send a manual notification with optional image and link.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
