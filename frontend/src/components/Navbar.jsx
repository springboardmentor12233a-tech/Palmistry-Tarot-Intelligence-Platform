import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
  logout();
  window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="logo">🔮 AI Palmistry & Tarot</div>

      <div className="nav-links">

        {/* =========================
            NOT LOGGED IN
            ========================= */}
        {!isAuthenticated && (
          <>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
            >
              Login
            </NavLink>

            <NavLink
              to="/signup"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
            >
              Sign Up
            </NavLink>
          </>
        )}

        {/* =========================
            LOGGED IN AS NORMAL USER
            ========================= */}
        {isAuthenticated && user?.role === "user" && (
          <>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/palm-reading"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
            >
              Palm Reading
            </NavLink>

            <NavLink
              to="/tarot-reading"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
            >
              Tarot Reading
            </NavLink>

            <NavLink
              to="/combined-reading"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
            >
              Combined Reading
            </NavLink>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/my-readings"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
            >
              My Readings
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
              style={{ marginLeft: "10px" }}
            >
              Hi, {user.name}
            </NavLink>

            <button
              onClick={handleLogout}
              className="primary-btn"
              style={{ marginLeft: "10px" }}
            >
              Logout
            </button>
          </>
        )}

        {/* =========================
            LOGGED IN AS ADMIN
            ========================= */}
        {isAuthenticated && user?.role === "admin" && (
          <>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
            >
              Admin Dashboard
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
              style={{ marginLeft: "10px" }}
            >
              Hi, {user.name}
            </NavLink>

            <button
              onClick={handleLogout}
              className="primary-btn"
              style={{ marginLeft: "10px" }}
            >
              Logout
            </button>
          </>
        )}

        <ThemeToggle />

      </div>
    </nav>
  );
}

export default Navbar;