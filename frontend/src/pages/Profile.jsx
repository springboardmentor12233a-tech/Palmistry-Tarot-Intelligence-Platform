import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

function Profile() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/profile-stats");
        setStats(response.data.stats);
      } catch (err) {
        console.error("Failed to load profile stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

        {/* Account Summary */}
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

      </div>
    </div>
  );
}

export default Profile;