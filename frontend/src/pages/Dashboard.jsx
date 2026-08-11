import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Loading from "../components/Loading";

function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, readingsResponse] = await Promise.all([
          api.get("/profile-stats"),
          api.get("/my-readings"),
        ]);

        setStats(statsResponse.data.stats);
        setReadings(readingsResponse.data.readings || []);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Could not load your dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const typeLabel = {
    palm: "Palm Reading",
    tarot: "Tarot Reading",
    combined: "Combined Reading",
  };

  const getReadingPreview = (reading) => {
    if (reading.reading_type === "palm") {
      return reading.data?.reading || "Palm reading generated.";
    }

    if (reading.reading_type === "tarot") {
      return reading.data?.reading || "Tarot reading generated.";
    }

    if (reading.reading_type === "combined") {
      return (
        reading.data?.combined_reading ||
        "Combined reading generated."
      );
    }

    return "Reading generated.";
  };

  if (loading) {
    return <Loading text="Loading your dashboard..." />;
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <p className="dashboard-welcome">Welcome back,</p>
          <h1>{user?.name || "User"} 👋</h1>
          <p>
            Explore your palmistry and tarot insights from one place.
          </p>
        </div>

        <Link to="/profile" className="dashboard-profile-btn">
          My Profile
        </Link>
      </div>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* Statistics */}
      <section className="dashboard-section">
        <h2>Your Reading Activity</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">✋</div>
            <div>
              <p>Palm Readings</p>
              <h3>{stats?.palm ?? 0}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔮</div>
            <div>
              <p>Tarot Readings</p>
              <h3>{stats?.tarot ?? 0}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✨</div>
            <div>
              <p>Combined Readings</p>
              <h3>{stats?.combined ?? 0}</h3>
            </div>
          </div>

          <div className="stat-card total-stat">
            <div className="stat-icon">📊</div>
            <div>
              <p>Total Readings</p>
              <h3>{stats?.total ?? 0}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Reading Actions */}
      <section className="dashboard-section">
        <h2>Start a New Reading</h2>

        <div className="reading-options">
          <Link to="/palm-reading" className="reading-card">
            <div className="reading-card-icon">✋</div>
            <h3>Palm Reading</h3>
            <p>
              Upload your palm image and discover your palmistry insights.
            </p>
            <span>Start Reading →</span>
          </Link>

          <Link to="/tarot-reading" className="reading-card">
            <div className="reading-card-icon">🔮</div>
            <h3>Tarot Reading</h3>
            <p>
              Choose a tarot spread and receive an AI-generated reading.
            </p>
            <span>Start Reading →</span>
          </Link>

          <Link to="/combined-reading" className="reading-card">
            <div className="reading-card-icon">✨</div>
            <h3>Combined Reading</h3>
            <p>
              Combine palmistry and tarot for a broader personalized insight.
            </p>
            <span>Start Reading →</span>
          </Link>
        </div>
      </section>

      {/* Recent Readings */}
      <section className="dashboard-section">
        <div className="section-heading-row">
          <h2>Recent Readings</h2>

          <Link to="/my-readings" className="view-all-link">
            View All
          </Link>
        </div>

        {readings.length === 0 ? (
          <div className="empty-readings">
            <div className="empty-icon">🔮</div>
            <h3>No readings yet</h3>
            <p>
              Start your first palm or tarot reading to see it here.
            </p>
          </div>
        ) : (
          <div className="recent-readings">
            {readings.slice(0, 5).map((reading) => (
              <div className="recent-reading-card" key={reading._id}>
                <div className="recent-reading-top">
                  <div>
                    <h3>
                      {typeLabel[reading.reading_type] ||
                        reading.reading_type}
                    </h3>

                    <p className="reading-date">
                      {new Date(
                        reading.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <span className="reading-badge">
                    {reading.reading_type}
                  </span>
                </div>

                <p className="reading-preview">
                  {getReadingPreview(reading).slice(0, 180)}
                  {getReadingPreview(reading).length > 180
                    ? "..."
                    : ""}
                </p>

                {reading.data?.pdf_url && (
                  <a
                    href={`http://127.0.0.1:8000${reading.data.pdf_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dashboard-pdf-btn"
                  >
                    📄 View Report
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;