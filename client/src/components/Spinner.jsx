
import { useSelector } from "react-redux";

const Spinner = () => {
  const { isLoading } = useSelector((state) => state.loading);

  if (!isLoading) return null;

  return (
    <div className="spinner-overlay">
      <div className="spinner"></div>
    </div>
  );
};

export default Spinner;
