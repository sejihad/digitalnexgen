import { MessageCircle } from "lucide-react";
import { useState } from "react";
import ChatPopup from "./ChatPopup";

const FloatingMessageButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-all z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {isOpen && <ChatPopup onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default FloatingMessageButton;
