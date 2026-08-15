import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router";

import {
  useAuth,
} from "../auth/AuthContext";


const standardNavigation = [
  {
    to: "/dashboard",
    label: "Dashboard",
  },
  {
    to: "/reading",
    label: "Reading Studio",
  },
  {
    to: "/palm",
    label: "Palm Analysis",
  },
  {
    to: "/tarot",
    label: "Tarot Reading",
  },
  {
    to: "/insights",
    label: "AI Insights",
  },
  {
    to: "/personality",
    label: "Personality",
  },
  {
    to: "/trends",
    label: "Life Trends",
  },
  {
    to: "/guidance",
    label: "Guidance Scores",
  },
  {
    to: "/recommendations",
    label: "Recommendations",
  },
  {
    to: "/history",
    label: "Reading History",
  },
  {
    to: "/reports",
    label: "Reports",
  },
  {
    to: "/notifications",
    label: "Notifications",
  },
  {
    to: "/profile",
    label: "Profile",
  },
];


function DashboardLayout() {

  const {
    user,
    logout,
  } = useAuth();


  const navigate =
    useNavigate();


  // ==========================================================
  // ROLE ACCESS
  // ==========================================================

  const canAccessTarotReader =
    [
      "tarot_reader",
      "administrator",
    ].includes(
      user?.role
    );


  const canAccessConsultant =
    [
      "spiritual_consultant",
      "administrator",
    ].includes(
      user?.role
    );


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout =
    () => {

      logout();


      navigate(
        "/login",
        {
          replace: true,
        }
      );

    };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="dashboard-shell">

      {/* ==================================================== */}
      {/* SIDEBAR */}
      {/* ==================================================== */}

      <aside className="dashboard-sidebar">

        {/* BRAND */}

        <div className="sidebar-brand">

          <span className="sidebar-symbol">
            ✦
          </span>


          <div>

            <strong>
              Palmistry
            </strong>


            <small>
              & Tarot Intelligence
            </small>

          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="sidebar-navigation">

          {/* STANDARD USER MODULES */}

          {standardNavigation.map(
            (item) => (

              <NavLink
                key={
                  item.to
                }
                to={
                  item.to
                }
                className={
                  ({
                    isActive,
                  }) =>
                    isActive
                      ? "sidebar-link active"
                      : "sidebar-link"
                }
              >

                {item.label}

              </NavLink>

            )
          )}


          {/* =============================================== */}
          {/* TAROT READER ROLE */}
          {/* =============================================== */}

          {canAccessTarotReader && (

            <NavLink
              to="/tarot-reader"
              className={
                ({
                  isActive,
                }) =>
                  isActive
                    ? "sidebar-link active"
                    : "sidebar-link"
              }
            >

              Tarot Reader Dashboard

            </NavLink>

          )}


          {/* =============================================== */}
          {/* SPIRITUAL CONSULTANT ROLE */}
          {/* =============================================== */}

          {canAccessConsultant && (

            <NavLink
              to="/spiritual-consultant"
              className={
                ({
                  isActive,
                }) =>
                  isActive
                    ? "sidebar-link active"
                    : "sidebar-link"
              }
            >

              Spiritual Consultant

            </NavLink>

          )}


          {/* =============================================== */}
          {/* ADMINISTRATION */}
          {/* =============================================== */}

          {
            user?.role ===
            "administrator" && (

              <NavLink
                to="/admin"
                className={
                  ({
                    isActive,
                  }) =>
                    isActive
                      ? "sidebar-link active admin-link"
                      : "sidebar-link admin-link"
                }
              >

                Administration

              </NavLink>

            )
          }

        </nav>


        {/* ================================================= */}
        {/* USER INFORMATION */}
        {/* ================================================= */}

        <div className="sidebar-user">

          <strong>

            {
              user?.full_name ||
              "User"
            }

          </strong>


          <span>

            {
              user?.role
                ?.replaceAll(
                  "_",
                  " "
                ) ||
              "user"
            }

          </span>


          <button
            type="button"
            className="sidebar-logout"
            onClick={
              handleLogout
            }
          >

            Sign Out

          </button>

        </div>

      </aside>


      {/* ==================================================== */}
      {/* MAIN AREA */}
      {/* ==================================================== */}

      <div className="dashboard-main">

        {/* TOPBAR */}

        <header className="dashboard-topbar">

          <div>

            <strong>

              Palmistry & Tarot
              Intelligence Platform

            </strong>

          </div>


          <div className="topbar-user">

            {
              user?.email
            }

          </div>

        </header>


        {/* PAGE CONTENT */}

        <main className="dashboard-content">

          <Outlet />

        </main>

      </div>

    </div>
  );
}


export default DashboardLayout;