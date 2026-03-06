import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({
  isAdminRoute = false,
  requiresAuth = true,
  children,
}) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (isAuthenticated && location.pathname === "/") {
    if (user?.isAdmin) {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/service-list" replace />;
    }
  }

  if (isAdminRoute && (!isAuthenticated || !user?.isAdmin)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
