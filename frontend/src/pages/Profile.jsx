import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

function Profile() {
  const { user, updateUser } = useAuth();

  const isAdmin = user?.role === "admin";

  const [name, setName] = useState(user?.name || "");
  const [stats, setStats] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isAdmin) {
          const response = await api.get("/admin/stats");
          setPlatformStats(response.data);
        } else {
          const response = await api.get("/profile-stats");
          setStats(response.data.stats);
        }
      } catch (err) {
        console.error("Failed to load profile stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      await api.put("/auth/profile", {
        name,
      });

      const updatedUser = {
        name,
        email: user?.email,
      };

      updateUser(updatedUser);

      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Profile update error:", err);
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Page Header */}
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>
            Manage your account and view your reading activity.
          </p>
        </div>

        {/* Account Details */}
        <div className="profile-card">
          <h2>Account Details</h2>

          <form onSubmit={handleSave}>

            <div className="profile-form-group">
              <label htmlFor="name">
                Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
              />

              <small>
                Email cannot be changed.
              </small>
            </div>

            {message && (
              <p className="profile-message">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </form>
        </div>

        {isAdmin ? (
          /* Platform Overview (admin only) */
          <div className="profile-card platform-overview-card">
            <h2>Platform Overview</h2>

            {loading ? (
              <Loading text="Loading platform overview..." />
            ) : (
              <>
                <div className="platform-overview-grid">
                  <div className="platform-overview-stat">
                    <span>Total Users</span>
                    <strong>{platformStats?.total_users ?? 0}</strong>
                  </div>

                  <div className="platform-overview-stat">
                    <span>Total Readings</span>
                    <strong>{platformStats?.total_readings ?? 0}</strong>
                  </div>
                </div>

                <div className="platform-breakdown">
                  <div className="platform-breakdown-label">
                    Reading Type Breakdown
                  </div>

                  {(() => {
                    const total = platformStats?.total_readings ?? 0;
                    const palm = platformStats?.palm_readings ?? 0;
                    const tarot = platformStats?.tarot_readings ?? 0;
                    const combined = platformStats?.combined_readings ?? 0;

                    const pct = (n) =>
                      total > 0 ? Math.round((n / total) * 1000) / 10 : 0;

                    const palmPct = pct(palm);
                    const tarotPct = pct(tarot);
                    const combinedPct = pct(combined);

                    return (
                      <>
                        <div className="platform-breakdown-bar">
                          <div
                            className="platform-breakdown-segment segment-palm"
                            style={{ width: `${palmPct}%` }}
                          />
                          <div
                            className="platform-breakdown-segment segment-tarot"
                            style={{ width: `${tarotPct}%` }}
                          />
                          <div
                            className="platform-breakdown-segment segment-combined"
                            style={{ width: `${combinedPct}%` }}
                          />
                        </div>

                        <div className="platform-breakdown-legend">
                          <div className="legend-item">
                            <span className="legend-dot segment-palm" />
                            Palm ({palm} · {palmPct}%)
                          </div>
                          <div className="legend-item">
                            <span className="legend-dot segment-tarot" />
                            Tarot ({tarot} · {tarotPct}%)
                          </div>
                          <div className="legend-item">
                            <span className="legend-dot segment-combined" />
                            Combined ({combined} · {combinedPct}%)
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <p className="account-summary-description">
                  Aggregated activity across every user on the platform.
                </p>
              </>
            )}
          </div>
        ) : (
          /* Account Summary (regular users) */
          <div className="profile-card account-summary-card">
            <h2>Account Summary</h2>

            {loading ? (
              <Loading text="Loading account summary..." />
            ) : (
              <>
                <div className="account-summary-row">
                  <span>Total Readings</span>

                  <strong>
                    {stats?.total ?? 0}
                  </strong>
                </div>

                <p className="account-summary-description">
                  Your generated palm, tarot, and combined readings
                  are securely saved in your account.
                </p>

                <div className="profile-member-since">
                  Using AI Palmistry & Tarot since{" "}
                  <strong>
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </strong>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Profile;