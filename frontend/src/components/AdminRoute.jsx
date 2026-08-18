import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem("access_token");
  const storedUser = localStorage.getItem("user");

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  // ==========================================
  // READ CURRENT USER
  // ==========================================

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // ==========================================
  // NORMAL USER
  // ==========================================

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // ==========================================
  // ADMIN
  // ==========================================

  return children;
}

export default AdminRoute;