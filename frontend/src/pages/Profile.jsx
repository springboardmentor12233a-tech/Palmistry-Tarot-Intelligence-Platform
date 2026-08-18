import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import DashboardNavbar from "../components/DashboardNavbar";

import {
  getCurrentUser,
  getSavedUser,
  logoutUser,
} from "../services/api";

import "./Profile.css";


function Profile() {

  const navigate = useNavigate();


  // =====================================================
  // USER STATE
  // =====================================================

  const [user, setUser] = useState(
    getSavedUser()
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =====================================================
  // STATISTICS
  // =====================================================

  const [stats, setStats] = useState({
    total_readings: 0,
    palmistry_readings: 0,
    tarot_readings: 0,
  });


  // =====================================================
  // LOAD USER + STATISTICS
  // =====================================================

  useEffect(() => {

    const loadProfile = async () => {

      const token =
        localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {

        setLoading(true);
        setError("");


        // -----------------------------------------------
        // GET REAL USER FROM BACKEND
        // -----------------------------------------------

        const currentUser =
          await getCurrentUser();

        setUser(currentUser);


        // Keep local storage synchronized

        localStorage.setItem(
          "user",
          JSON.stringify(currentUser)
        );


        // -----------------------------------------------
        // GET DASHBOARD STATISTICS
        // -----------------------------------------------

        const statsResponse =
          await fetch(
            "http://127.0.0.1:8000/api/dashboard/stats",
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );


        if (statsResponse.ok) {

          const statsData =
            await statsResponse.json();

          setStats({
            total_readings:
              statsData.statistics
                ?.total_readings || 0,

            palmistry_readings:
              statsData.statistics
                ?.palmistry_readings || 0,

            tarot_readings:
              statsData.statistics
                ?.tarot_readings || 0,
          });
        }

      } catch (err) {

        console.error(
          "Profile loading error:",
          err
        );

        setError(
          err.message ||
          "Unable to load profile."
        );

      } finally {

        setLoading(false);

      }

    };


    loadProfile();

  }, [navigate]);


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    logoutUser();

    navigate("/login");

  };


  // =====================================================
  // USER DISPLAY VALUES
  // =====================================================

  const displayName =
    user?.name?.trim() || "User";

  const displayEmail =
    user?.email || "Email unavailable";

  const userInitial =
    displayName
      .charAt(0)
      .toUpperCase();


  // =====================================================
  // LOADING
  // =====================================================

  if (loading && !user) {

    return (
      <>
        <DashboardNavbar />

        <main className="profile-main">

          <section className="profile-header">

            <div>

              <span className="profile-eyebrow">
                YOUR PROFILE
              </span>

              <h1>
                Loading <span>profile.</span>
              </h1>

              <p>
                Retrieving your account information...
              </p>

            </div>

            <div
              className="profile-symbol"
              aria-hidden="true"
            >
              ✦
            </div>

          </section>

        </main>
      </>
    );

  }


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>

      {/* =================================================
          NAVBAR
      ================================================= */}

      <DashboardNavbar />


      {/* =================================================
          MAIN PROFILE
      ================================================= */}

      <main className="profile-main">


        {/* =================================================
            HEADER
        ================================================= */}

        <section className="profile-header">

          <div>

            <span className="profile-eyebrow">
              YOUR PROFILE
            </span>

            <h1>
              Your <span>profile.</span>
            </h1>

            <p>
              Manage your account details and keep track
              of your personal self-discovery journey.
            </p>

          </div>


          <div
            className="profile-symbol"
            aria-hidden="true"
          >
            ✦
          </div>

        </section>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div
            className="profile-error"
            role="alert"
          >
            {error}
          </div>

        )}


        {/* =================================================
            PROFILE OVERVIEW
        ================================================= */}

        <section className="profile-content">


          {/* =================================================
              ACCOUNT CARD
          ================================================= */}

          <article className="profile-card">

            <div className="profile-card-top">

              <div className="profile-avatar-large">
                {userInitial}
              </div>


              <div>

                <span className="profile-card-label">
                  ACCOUNT
                </span>

                <h2>
                  {displayName}
                </h2>

                <p>
                  Your personal P&T Intelligence account
                </p>

              </div>

            </div>


            {/* =================================================
                ACCOUNT DETAILS
            ================================================= */}

            <div className="profile-details">


              {/* FULL NAME */}

              <div className="profile-detail">

                <span>
                  FULL NAME
                </span>

                <strong>
                  {displayName}
                </strong>

              </div>


              {/* EMAIL */}

              <div className="profile-detail">

                <span>
                  EMAIL ADDRESS
                </span>

                <strong>
                  {displayEmail}
                </strong>

              </div>


              {/* ACCOUNT STATUS */}

              <div className="profile-detail">

                <span>
                  ACCOUNT STATUS
                </span>

                <strong
                  className={
                    user?.is_active
                      ? "status-active"
                      : "status-inactive"
                  }
                >
                  {user?.is_active
                    ? "Active"
                    : "Inactive"}
                </strong>

              </div>

              {/* ACCOUNT ROLE */}

<div className="profile-detail">

  <span>
    ACCOUNT ROLE
  </span>

  <strong>
    {user?.role === "admin"
      ? "Administrator"
      : "Standard User"}
  </strong>

</div>

            </div>

          </article>


          {/* =================================================
              JOURNEY CARD
          ================================================= */}

          <article className="profile-journey-card">

            <span className="profile-card-label">
              YOUR JOURNEY
            </span>

            <h2>
              Explore your journey.
            </h2>

            <p>
              Your readings, reports and personal insights
              will be collected here as you use the platform.
            </p>


            <div className="profile-stats">


              {/* TOTAL */}

              <div className="profile-stat">

                <strong>
                  {stats.total_readings}
                </strong>

                <span>
                  Readings
                </span>

              </div>


              {/* PALMISTRY */}

              <div className="profile-stat">

                <strong>
                  {stats.palmistry_readings}
                </strong>

                <span>
                  Palm
                </span>

              </div>


              {/* TAROT */}

              <div className="profile-stat">

                <strong>
                  {stats.tarot_readings}
                </strong>

                <span>
                  Tarot
                </span>

              </div>

            </div>

          </article>

        </section>


        {/* =================================================
            QUICK ACCESS
        ================================================= */}

        <section className="profile-quick-section">

          <div className="profile-section-heading">

            <div>

              <span className="profile-eyebrow">
                QUICK ACCESS
              </span>

              <h2>
                Continue your journey
              </h2>

            </div>

          </div>


          <div className="profile-quick-grid">


            {/* READINGS */}

            <Link
              to="/readings"
              className="profile-quick-card"
            >

              <div className="quick-icon">
                ✧
              </div>

              <div>

                <span>
                  READINGS
                </span>

                <h3>
                  View your readings
                </h3>

                <p>
                  Revisit your palmistry and tarot
                  experiences.
                </p>

              </div>

              <strong>
                →
              </strong>

            </Link>


            {/* REPORTS */}

            <Link
              to="/reports"
              className="profile-quick-card"
            >

              <div className="quick-icon">
                ◇
              </div>

              <div>

                <span>
                  REPORTS
                </span>

                <h3>
                  View your reports
                </h3>

                <p>
                  Access reports generated from
                  your readings.
                </p>

              </div>

              <strong>
                →
              </strong>

            </Link>


            {/* INSIGHTS */}

            <Link
              to="/insights"
              className="profile-quick-card"
            >

              <div className="quick-icon">
                ✦
              </div>

              <div>

                <span>
                  INSIGHTS
                </span>

                <h3>
                  Explore your insights
                </h3>

                <p>
                  Discover patterns across your
                  personal journey.
                </p>

              </div>

              <strong>
                →
              </strong>

            </Link>

          </div>

        </section>


        {/* =================================================
            ACCOUNT INFORMATION
        ================================================= */}

        <section className="profile-note">

          <div className="profile-note-icon">
            ✦
          </div>

          <div>

            <span className="profile-card-label">
              ACCOUNT INFORMATION
            </span>

            <p>
              Your account information is securely
              retrieved from the P&T Intelligence
              authentication system.
            </p>

          </div>

        </section>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <div className="profile-actions">

          <button
            type="button"
            className="profile-logout-button"
            onClick={handleLogout}
          >
            Logout →
          </button>

        </div>


        {/* =================================================
            DISCLAIMER
        ================================================= */}

        <p className="profile-disclaimer">
          ✦ Your profile is used to organize your
          self-discovery experience. Readings are intended
          for self-reflection and entertainment purposes only.
        </p>

      </main>

    </>
  );
}

export default Profile;