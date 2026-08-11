import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo">🔮 AI Palmistry & Tarot</div>

      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => (isActive ? "active-link" : "")}>
          Home
        </NavLink>
        <NavLink to="/palm-reading" className={({ isActive }) => (isActive ? "active-link" : "")}>
          Palm Reading
        </NavLink>
        <NavLink to="/tarot-reading" className={({ isActive }) => (isActive ? "active-link" : "")}>
          Tarot Reading
        </NavLink>
        <NavLink to="/combined-reading" className={({ isActive }) => (isActive ? "active-link" : "")}>
          Combined Reading
        </NavLink>

        {isAuthenticated && (
            <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
            Dashboard
            </NavLink>

            <NavLink
              to="/my-readings"
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
            My Readings
            </NavLink>
            </>
          )}

        {isAuthenticated ? (
          <>
            <NavLink to="/profile" style={{ marginLeft: "10px" }}>
              Hi, {user.name}
            </NavLink>
            <button onClick={handleLogout} className="primary-btn" style={{ marginLeft: "10px" }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => (isActive ? "active-link" : "")}>
              Login
            </NavLink>
            <NavLink to="/signup" className={({ isActive }) => (isActive ? "active-link" : "")}>
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;