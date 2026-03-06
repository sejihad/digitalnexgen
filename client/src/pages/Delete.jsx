import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";

const Delete = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    report: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    const name = String(form.name || "").trim();
    const email = String(form.email || "").trim();
    const report = String(form.report || "").trim();

    if (!name || !email || !report) {
      setError("Name, email, and reason are required");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/contact/account/delete-request`,
        { name, email, report },
        { withCredentials: true },
      );

      const msg = data?.message || "Delete request submitted.";
      setSuccess(msg);
      toast.success(msg);

      setForm((p) => ({ ...p, report: "" })); // name/email রাখলাম
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Failed to send delete request";
      const text =
        typeof msg === "string" ? msg : "Failed to send delete request";
      setError(text);
      toast.error(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-white text-black dark:bg-black dark:text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl border shadow-[0_.14px_2.29266px_rgba(0,0,0,0.03),_0_.37px_4.42626px_rgba(0,0,0,0.047),_0_3px_7px_rgba(0,0,0,0.09)] border-black/10 dark:border-white/10 rounded-2xl p-8 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold tracking-tight">
          Delete Account Request
        </h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          We will review your request and process it accordingly (within 60
          days).
        </p>

        {/* ✅ optional inline message like Contact page */}
        {error ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : success ? (
          <p className="mt-4 text-sm text-green-600">{success}</p>
        ) : null}

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm">
                Name
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={onChange}
                type="text"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-white text-black border border-black/20 focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:text-white dark:border-white/20 dark:focus:ring-white disabled:opacity-60"
                placeholder="Your name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm">
                Email
              </label>
              <input
                id="email"
                name="email"
                value={form.email}
                onChange={onChange}
                type="email"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-white text-black border border-black/20 focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:text-white dark:border-white/20 dark:focus:ring-white disabled:opacity-60"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="report" className="text-sm">
              Reason for Deletion
            </label>
            <textarea
              id="report"
              name="report"
              value={form.report}
              onChange={onChange}
              rows={6}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-white text-black border border-black/20 focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:text-white dark:border-white/20 dark:focus:ring-white disabled:opacity-60"
              placeholder="Why do you want to delete your account?"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 rounded-lg border border-red-600 bg-red-600 text-white hover:bg-red-700 hover:text-white transition-colors disabled:opacity-60 dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
            >
              {loading ? "Submitting..." : "Submit Delete Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Delete;
