import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();

  const userPages = [
    "/dashboard",
    "/palmistry",
    "/tarot",
    "/insights",
    "/profile",
    "/readings",
    "/reports",
  ];

  const isUserPage = userPages.includes(location.pathname);

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  // =========================================================
  // USER / DASHBOARD NAVBAR
  // =========================================================

  if (isUserPage) {
    return (
      <header className="navbar user-navbar">
        <div className="navbar-container">

          {/* Logo */}
          <Link to="/dashboard" className="navbar-logo">
            <span className="logo-symbol">✦</span>
            <span>P&T Intelligence</span>
          </Link>


          {/* User Navigation */}
          <nav className="nav-links user-nav-links">

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


          {/* User Actions */}
          <div className="navbar-actions user-actions">

            <Link
              to="/profile"
              className={`user-profile-link ${isActive("/profile")}`}
            >
              <span className="user-avatar">
                U
              </span>

              <span className="user-name">
                User
              </span>
            </Link>

            <Link
              to="/"
              className="logout-link"
            >
              Logout
            </Link>

          </div>

        </div>
      </header>
    );
  }


  // =========================================================
  // PUBLIC NAVBAR
  // =========================================================

  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-symbol">✦</span>

          <span>
            P&T Intelligence
          </span>
        </Link>


        {/* Public Navigation */}
        <nav className="nav-links">

          <Link
            to="/"
            className={isActive("/")}
          >
            Home
          </Link>

          <a href="/#about">
            About
          </a>

          <a href="/#features">
            Features
          </a>

          <a href="/#how-it-works">
            How It Works
          </a>

        </nav>


        {/* Public Actions */}
        <div className="navbar-actions">

          <Link
            to="/login"
            className="login-link"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="nav-button"
          >
            Get Started
          </Link>

        </div>

      </div>
    </header>
  );
}


// =========================================================
// EXPORT
// =========================================================

export default Navbar;