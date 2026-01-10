import { useSelector } from "react-redux";
// import FloatingMessageButton from "./components/FloatingMessageButton";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* <FloatingMessageButton handleContactClick={handleContactClick}></FloatingMessageButton> */}
    </div>
  );
}

export default App;
