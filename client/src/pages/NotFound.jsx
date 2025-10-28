import { ArrowLeftCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white px-4">
      <h1 className="text-[10rem] font-extrabold text-red-500 drop-shadow-lg">
        404
      </h1>
      <p className="text-3xl md:text-4xl font-semibold mb-4">
        Oops! Page Not Found
      </p>
      <p className="text-lg text-gray-300 mb-8 max-w-md text-center">
        The page you're looking for doesn't exist or has been moved. Please
        check the URL or go back to the homepage.
      </p>
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition duration-300"
      >
        <ArrowLeftCircle className="w-5 h-5" />
        Back to Home
      </button>
    </div>
  );
};

export default NotFound;
