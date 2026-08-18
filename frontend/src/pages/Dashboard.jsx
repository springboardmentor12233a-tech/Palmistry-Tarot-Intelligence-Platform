import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";
import { getSavedUser } from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const user = getSavedUser();

  // =========================
  // DASHBOARD STATISTICS
  // =========================
  const [stats, setStats] = useState({
    total_readings: 0,
    palmistry_readings: 0,
    tarot_readings: 0,
  });

  const [latestReading, setLatestReading] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(false);

  // =========================
  // FETCH DASHBOARD STATS
  // =========================
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          console.log("No access token found.");
          setStatsError(true);
          setLoadingStats(false);
          return;
        }

        const response = await fetch(
          "http://127.0.0.1:8000/api/dashboard/stats",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Dashboard stats request failed: ${response.status}`
          );
        }

        const data = await response.json();

        console.log("Dashboard statistics:", data);

        setStats({
          total_readings: data.statistics?.total_readings || 0,
          palmistry_readings:
            data.statistics?.palmistry_readings || 0,
          tarot_readings:
            data.statistics?.tarot_readings || 0,
        });

        setLatestReading(data.latest_reading || null);
        setStatsError(false);
      } catch (error) {
        console.error("Failed to load dashboard statistics:", error);
        setStatsError(true);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // =========================
  // LATEST READING TEXT
  // =========================
  const getLatestReadingText = () => {
    if (!latestReading) {
      return "No readings yet";
    }

    const type = latestReading.type || "Reading";

    if (latestReading.created_at) {
      const date = new Date(latestReading.created_at);

      if (!Number.isNaN(date.getTime())) {
        return `${type} reading • ${date.toLocaleDateString()}`;
      }
    }

    return `${type} reading`;
  };

  return (
    <>
      {/* =========================
          REUSABLE DASHBOARD NAVBAR
      ========================= */}
      <DashboardNavbar />

      {/* =========================
          MAIN DASHBOARD
      ========================= */}
      <main className="dashboard-main">

        {/* =========================
            WELCOME
        ========================= */}
        <section className="dashboard-welcome">

          <div>
            <span className="dashboard-eyebrow">
              YOUR PERSONAL JOURNEY
            </span>

            <h1>
              Welcome back,
              <span> {user?.name || "User"} ✨</span>
            </h1>

            <p>
              Explore your palmistry, tarot and intelligent
              self-discovery insights.
            </p>
          </div>

          <div className="welcome-symbol">
            ✨
          </div>

        </section>


        {/* =========================
            READING CARDS
        ========================= */}
        <section className="reading-options">

          {/* Palmistry */}
          <article className="reading-card palm-card">

            <div className="reading-icon">
              ✋
            </div>

            <span className="card-label">
              PALMISTRY
            </span>

            <h2>
              Discover what
              <span> your hands reveal.</span>
            </h2>

            <p>
              Upload a clear image of your palm and
              explore symbolic interpretations of your
              major palm lines.
            </p>

            <div className="dashboard-reading-count">
              {loadingStats
                ? "Loading..."
                : `${stats.palmistry_readings} ${
                    stats.palmistry_readings === 1
                      ? "Reading"
                      : "Readings"
                  }`}
            </div>

            <Link
              to="/palmistry"
              className="reading-button"
            >
              Start Palm Reading →
            </Link>

          </article>


          {/* Tarot */}
          <article className="reading-card tarot-card">

            <div className="reading-icon tarot-icon">
              🃏
            </div>

            <span className="card-label">
              TAROT
            </span>

            <h2>
              Explore the
              <span> cards.</span>
            </h2>

            <p>
              Draw tarot cards and explore symbolic
              meanings related to your question or
              current journey.
            </p>

            <div className="dashboard-reading-count">
              {loadingStats
                ? "Loading..."
                : `${stats.tarot_readings} ${
                    stats.tarot_readings === 1
                      ? "Reading"
                      : "Readings"
                  }`}
            </div>

            <Link
              to="/tarot"
              className="reading-button"
            >
              Start Tarot Reading →
            </Link>

          </article>

        </section>


        {/* =========================
            LATEST INSIGHT
        ========================= */}
        <section className="latest-insight">

          <div className="section-heading">

            <div>
              <span className="dashboard-eyebrow">
                YOUR JOURNEY
              </span>

              <h2>
                Latest Insight
              </h2>
            </div>

            <span className="insight-status">
              {loadingStats
                ? "Loading..."
                : latestReading
                  ? latestReading.type
                  : "Coming soon"}
            </span>

          </div>


          <div className="insight-placeholder">

            <div className="insight-star">
              ✦
            </div>

            <div>
              <h3>
                {latestReading
                  ? `Your latest ${latestReading.type?.toLowerCase() || "reading"}`
                  : "Your personal insights will appear here"}
              </h3>

              <p>
                {latestReading
                  ? getLatestReadingText()
                  : "Once you complete a palmistry or tarot reading, your interpretations and recommendations will be displayed here."}
              </p>
            </div>

          </div>

        </section>


        {/* =========================
            RECENT READINGS
        ========================= */}
        <section className="recent-section">

          <div className="section-heading">

            <div>
              <span className="dashboard-eyebrow">
                HISTORY
              </span>

              <h2>
                Recent Readings
              </h2>
            </div>

            <span className="history-count">
              {loadingStats
                ? "Loading..."
                : `${stats.total_readings} ${
                    stats.total_readings === 1
                      ? "reading"
                      : "readings"
                  }`}
            </span>

          </div>


          <div className="empty-history">

            <span className="empty-icon">
              ◇
            </span>

            <h3>
              {stats.total_readings > 0
                ? "Your reading history is available"
                : "No readings yet"}
            </h3>

            <p>
              {stats.total_readings > 0
                ? `${stats.palmistry_readings} palmistry and ${stats.tarot_readings} tarot ${
                    stats.total_readings === 1
                      ? "reading has"
                      : "readings have"
                  } been completed.`
                : "Your completed readings will appear here."}
            </p>

            {stats.total_readings > 0 && (
              <Link
                to="/readings"
                className="reading-button"
              >
                View Reading History →
              </Link>
            )}

          </div>

        </section>


        {/* =========================
            DISCLAIMER
        ========================= */}
        <div className="dashboard-disclaimer">
          ✦ For self-reflection and entertainment purposes only.
          This platform does not provide medical, financial,
          legal or professional advice.
        </div>

      </main>
    </>
  );
}

export default Dashboard;