import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

function Profile() {
  const { user, login } = useAuth();

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
        console.error(err);
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
      await api.put("auth/profile", { name });
      const token = localStorage.getItem("token");
      login && (() => {})(); // no-op guard, real update below
      const updatedUser = { name, email: user.email };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">My Profile</h1>

      <div className="upload-card" style={{ maxWidth: "450px", margin: "0 auto 30px" }}>
        <h2>Account Details</h2>

        <form onSubmit={handleSave}>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "15px" }}
          />

          <label>Email</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            style={{ width: "100%", marginBottom: "15px", backgroundColor: "#f0f0f0" }}
          />

          {message && <p>{message}</p>}

          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="upload-card" style={{ maxWidth: "450px", margin: "0 auto" }}>
        <h2>Your Reading Activity</h2>

        {loading && <Loading text="Loading stats..." />}

        {stats && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>Palm Readings: {stats.palm}</li>
            <li>Tarot Readings: {stats.tarot}</li>
            <li>Combined Readings: {stats.combined}</li>
            <li style={{ marginTop: "10px", fontWeight: "bold" }}>
              Total Readings: {stats.total}
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

export default Profile;