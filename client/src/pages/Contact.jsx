import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
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
    const message = String(form.message || "").trim();
    if (!name || !email || !message) {
      setError("Name, email, and message are required");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/contact`, form, { withCredentials: false });
      setSuccess("Message sent successfully.");
      toast.success("Message sent successfully.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      const msg = err?.response?.data || "Failed to send message";
      setError(typeof msg === "string" ? msg : "Failed to send message");
      toast.error(typeof msg === "string" ? msg : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)]  bg-white text-black dark:bg-black dark:text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl border shadow-[0_.14px_2.29266px_rgba(0,0,0,0.03),_0_.37px_4.42626px_rgba(0,0,0,0.047),_0_3px_7px_rgba(0,0,0,0.09)]  border-black/10 dark:border-white/10 rounded-2xl p-8 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">We usually respond within 24 hours.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm">Name</label>
              <input id="name" name="name" value={form.name} onChange={onChange} type="text" className="w-full px-4 py-3 rounded-lg bg-white text-black border border-black/20 focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:text-white dark:border-white/20 dark:focus:ring-white" placeholder="Your name" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm">Email</label>
              <input id="email" name="email" value={form.email} onChange={onChange} type="email" className="w-full px-4 py-3 rounded-lg bg-white text-black border border-black/20 focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:text-white dark:border-white/20 dark:focus:ring-white" placeholder="you@example.com" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="subject" className="text-sm">Subject</label>
            <input id="subject" name="subject" value={form.subject} onChange={onChange} type="text" className="w-full px-4 py-3 rounded-lg bg-white text-black border border-black/20 focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:text-white dark:border-white/20 dark:focus:ring-white" placeholder="How can we help?" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-sm">Message</label>
            <textarea id="message" name="message" value={form.message} onChange={onChange} rows={6} className="w-full px-4 py-3 rounded-lg bg-white text-black border border-black/20 focus:outline-none focus:ring-2 focus:ring-black dark:bg-black dark:text-white dark:border-white/20 dark:focus:ring-white" placeholder="Write your message..." />
          </div>
          <div className="pt-2">
            <button type="submit" disabled={loading} className="w-full md:w-auto px-6 py-3 rounded-lg border border-black bg-black text-white hover:bg-white hover:text-black transition-colors disabled:opacity-60 dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white">
              {loading ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contact;
