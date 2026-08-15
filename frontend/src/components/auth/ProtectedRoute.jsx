import {
  Navigate,
  useLocation,
} from "react-router";

import {
  useAuth,
} from "../../auth/AuthContext";


function ProtectedRoute({
  children,
  roles,
}) {
  const {
    user,
    isAuthenticated,
    isAuthLoading,
  } = useAuth();

  const location =
    useLocation();


  if (isAuthLoading) {
    return (
      <div className="auth-loading-screen">
        <div>
          <h2>
            Palmistry & Tarot
          </h2>

          <p>
            Checking your session...
          </p>
        </div>
      </div>
    );
  }


  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }


  if (
    Array.isArray(roles) &&
    roles.length > 0 &&
    !roles.includes(
      user?.role
    )
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }


  return children;
}


export default ProtectedRoute;