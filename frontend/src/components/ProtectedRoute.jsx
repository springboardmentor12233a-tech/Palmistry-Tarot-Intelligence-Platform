import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const location = useLocation();

  const token = localStorage.getItem("access_token");

  // --------------------------------------------------
  // User is not authenticated
  // --------------------------------------------------

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // --------------------------------------------------
  // User is authenticated
  // --------------------------------------------------

  return children;
}

export default ProtectedRoute;