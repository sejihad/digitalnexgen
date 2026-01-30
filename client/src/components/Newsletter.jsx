import axios from "axios";
import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/newsletters`, {
        email,
      });
      toast.success("Subscribed successfully!");
      setEmail("");
    } catch (error) {
      if (error.response?.status === 409) {
        toast.warning("This email is already subscribed.");
      } else {
        toast.error("Failed to subscribe. Please try again.");
      }
    }
  };

  return (
    <div className="mt-[-20px] sm:mt-[-40px] ml-[0px] text-white  border-primaryRgb">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-2">
        {/* Input Section */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 w-full items-center gap-2"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Subscribe with your email"
            required
            className="flex-1 px-3 py-2 rounded-md border border-green-400 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 transition text-sm"
          />
          <button
            type="submit"
            className="p-2 rounded-md bg-green-500 hover:bg-green-600 text-white transition shadow-sm hover:shadow-md flex items-center justify-center dark:bg-black dark:border dark:border-green-400"
            aria-label="Send Newsletter"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Newsletter;
