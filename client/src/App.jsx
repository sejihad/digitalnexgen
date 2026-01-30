import { useSelector } from "react-redux";
// import FloatingMessageButton from "./components/FloatingMessageButton";
import { useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import OfferModal from "./components/OfferModal";
import Spinner from "./components/Spinner";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  const handleContactClick = () => {
    if (!isAuthenticated) {
      navigate("/auth/sign-in");
      return;
    }
    // Navigate to a default chat with Admin
    navigate(`/messages/admin`);
  };

  return (
    <div className="dark:bg-black ">
      <Spinner />
      <AppRoutes />
      <OfferModal />
      <Toaster
        position="top-center" // top-middle equivalent
        richColors // colorful success/error/info
        toastOptions={{
          duration: 2000, // auto dismiss 2s
          style: {
            borderRadius: "0.5rem", // rounded corners
            padding: "0.75rem 1rem",
            fontSize: "0.95rem",
            fontWeight: 500,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            backdropFilter: "blur(4px)",
          },
          success: { icon: "✅" },
          error: { icon: "❌" },
          warning: { icon: "⚠️" },
          info: { icon: "ℹ️" },
        }}
      />
    </div>
  );
}

export default App;
