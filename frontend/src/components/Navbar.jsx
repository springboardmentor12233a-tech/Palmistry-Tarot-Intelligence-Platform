import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo">
        🔮 AI Palmistry & Tarot
      </div>

      <div className="nav-links">

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
          to="/about"
          className={({ isActive }) =>
            isActive ? "active-link" : ""
          }
        >
          About
        </NavLink>

      </div>

    </nav>
  );
}

export default Navbar;