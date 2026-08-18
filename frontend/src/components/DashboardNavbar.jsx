import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  getCurrentUser,
  getSavedUser,
  logoutUser,
} from "../services/api";

import "./DashboardNavbar.css";

function DashboardNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(
    getSavedUser()
  );

  // =====================================================
  // LOAD REAL LOGGED-IN USER
  // =====================================================

  useEffect(() => {
    const loadUser = async () => {
      const token =
        localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const currentUser =
          await getCurrentUser();

        setUser(currentUser);

        // Keep localStorage updated
        localStorage.setItem(
          "user",
          JSON.stringify(currentUser)
        );

      } catch (error) {
        console.error(
          "Unable to load current user:",
          error
        );

        // Token may be expired/invalid
        logoutUser();
        navigate("/login");
      }
    };

    loadUser();
  }, [navigate]);


  // =====================================================
  // ACTIVE NAVIGATION
  // =====================================================

  const isActive = (path) => {
    return location.pathname === path
      ? "active"
      : "";
  };


  // =====================================================
  // USER DISPLAY
  // =====================================================

  const displayName =
    user?.name?.trim() || "User";

  const userInitial =
    displayName.charAt(0).toUpperCase();


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <header className="dashboard-navbar">

      <div className="dashboard-nav-container">

        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          to="/dashboard"
          className="dashboard-logo"
        >
          <span className="dashboard-logo-icon">
            ✦
          </span>

          <span>
            P&T Intelligence
          </span>
        </Link>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="dashboard-nav-links">

          <Link
            to="/dashboard"
            className={isActive("/dashboard")}
          >
            Dashboard
          </Link>

          <Link
            to="/palmistry"
            className={isActive("/palmistry")}
          >
            Palmistry
          </Link>

          <Link
            to="/tarot"
            className={isActive("/tarot")}
          >
            Tarot
          </Link>

          <Link
            to="/insights"
            className={isActive("/insights")}
          >
            Insights
          </Link>

          <Link
            to="/readings"
            className={isActive("/readings")}
          >
            Readings
          </Link>

          <Link
            to="/reports"
            className={isActive("/reports")}
          >
            Reports
          </Link>

        </nav>


        {/* =================================================
            USER
        ================================================= */}

        <div className="dashboard-user">

          <Link
            to="/profile"
            className="dashboard-user-profile"
          >

            <div className="user-avatar">
              {userInitial}
            </div>

            <span>
              {displayName}
            </span>

          </Link>


          <button
            type="button"
            className="logout-link"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>

    </header>
  );
}

export default DashboardNavbar;