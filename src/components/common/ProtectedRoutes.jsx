import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function PrivateRoute() {
  const { currentUser, userProfile } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (userProfile?.role === "pending") return <Navigate to="/pending-approval" replace />;
  return <Outlet />;
}

export function RoleRoute({ roles }) {
  const { userProfile } = useAuth();
  if (!userProfile || !roles.includes(userProfile.role))
    return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
