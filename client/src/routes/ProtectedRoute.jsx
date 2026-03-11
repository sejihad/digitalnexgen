import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

const ProtectedRoute = ({
  isAdminRoute = false,
  requiresAuth = true,
  children,
}) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  const profileIncomplete =
    isAuthenticated && user && (!user.phone || !user.country);

  useEffect(() => {
    if (
      profileIncomplete &&
      location.pathname !== "/settings" &&
      location.pathname !== "/admin/settings"
    ) {
      toast.success("Complete your Profile");
    }
  }, [profileIncomplete, location.pathname]);

  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (
    profileIncomplete &&
    location.pathname !== "/settings" &&
    location.pathname !== "/admin/settings"
  ) {
    if (user?.isAdmin) {
      return <Navigate to="/admin/settings" replace />;
    } else {
      return <Navigate to="/settings" replace />;
    }
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
