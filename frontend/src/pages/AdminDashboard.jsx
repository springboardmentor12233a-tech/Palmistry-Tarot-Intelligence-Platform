import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Loading from "../components/Loading";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [readings, setReadings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [deletingId, setDeletingId] = useState(null);
  const [deletingReadingId, setDeletingReadingId] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserReadings, setSelectedUserReadings] = useState([]);
  const [loadingUserReadings, setLoadingUserReadings] = useState(false);


  // =========================================================
  // FETCH ADMIN DATA
  // =========================================================

  const fetchAdminData = async () => {
    try {
      setError("");

      const [
        statsResponse,
        usersResponse,
        readingsResponse
      ] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/readings"),
      ]);

      setStats(statsResponse.data);
      setUsers(usersResponse.data.users || []);
      setReadings(readingsResponse.data.readings || []);

    } catch (err) {
      console.error("Admin dashboard error:", err);

      const message =
        err.response?.data?.detail ||
        "Could not load admin dashboard.";

      setError(message);

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAdminData();
  }, []);


  // =========================================================
  // READING COUNTS PER USER
  // =========================================================

  const readingCounts = useMemo(() => {
    const counts = {};

    readings.forEach((reading) => {
      const email = reading.user_email;

      if (!counts[email]) {
        counts[email] = {
          palm: 0,
          tarot: 0,
          combined: 0,
          total: 0,
        };
      }

      const type = reading.reading_type;

      if (counts[email][type] !== undefined) {
        counts[email][type] += 1;
      }

      counts[email].total += 1;
    });

    return counts;
  }, [readings]);


  // =========================================================
  // SEARCH + ROLE FILTER
  // =========================================================

  const filteredUsers = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return users.filter((user) => {
      const matchesSearch =
        !search ||
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search);

      const matchesRole =
        roleFilter === "all" ||
        (user.role || "user") === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);


  // =========================================================
  // VIEW USER READINGS
  // =========================================================

  const handleViewReadings = async (user) => {
    try {
      setLoadingUserReadings(true);
      setError("");

      const response = await api.get(
        `/admin/users/${user._id}/readings`
      );

      setSelectedUser(user);
      setSelectedUserReadings(
        response.data.readings || []
      );

    } catch (err) {
      console.error("User readings error:", err);

      const message =
        err.response?.data?.detail ||
        "Could not load user readings.";

      setError(message);

    } finally {
      setLoadingUserReadings(false);
    }
  };


  // =========================================================
  // DELETE USER
  // =========================================================

  const handleDeleteUser = async (userId, userName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${userName}?\n\nThis will also delete all readings belonging to this user.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(userId);
      setError("");

      await api.delete(
        `/admin/users/${userId}`
      );

      // Remove user
      setUsers((currentUsers) =>
        currentUsers.filter(
          (user) => user._id !== userId
        )
      );

      // Refresh readings locally
      const userToDelete = users.find(
        (user) => user._id === userId
      );

      if (userToDelete) {
        setReadings((currentReadings) =>
          currentReadings.filter(
            (reading) =>
              reading.user_email !== userToDelete.email
          )
        );
      }

      // Update total users
      setStats((currentStats) => {
        if (!currentStats) {
          return currentStats;
        }

        return {
          ...currentStats,
          total_users: Math.max(
            0,
            currentStats.total_users - 1
          ),
        };
      });

      // Close modal if deleted user was selected
      if (selectedUser?._id === userId) {
        setSelectedUser(null);
        setSelectedUserReadings([]);
      }

    } catch (err) {
      console.error("Delete user error:", err);

      const message =
        err.response?.data?.detail ||
        "Could not delete the user.";

      setError(message);

    } finally {
      setDeletingId(null);
    }
  };


  // =========================================================
  // DELETE READING
  // =========================================================

  const handleDeleteReading = async (readingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reading?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingReadingId(readingId);
      setError("");

      await api.delete(
        `/admin/readings/${readingId}`
      );

      // Remove from main readings
      setReadings((currentReadings) =>
        currentReadings.filter(
          (reading) => reading._id !== readingId
        )
      );

      // Remove from modal
      setSelectedUserReadings(
        (currentReadings) =>
          currentReadings.filter(
            (reading) =>
              reading._id !== readingId
          )
      );

      // Update total reading count
      setStats((currentStats) => {
        if (!currentStats) {
          return currentStats;
        }

        const deletedReading =
          readings.find(
            (reading) =>
              reading._id === readingId
          );

        if (!deletedReading) {
          return currentStats;
        }

        const updatedStats = {
          ...currentStats,
          total_readings: Math.max(
            0,
            currentStats.total_readings - 1
          ),
        };

        if (
          deletedReading.reading_type === "palm"
        ) {
          updatedStats.palm_readings =
            Math.max(
              0,
              currentStats.palm_readings - 1
            );
        }

        if (
          deletedReading.reading_type === "tarot"
        ) {
          updatedStats.tarot_readings =
            Math.max(
              0,
              currentStats.tarot_readings - 1
            );
        }

        if (
          deletedReading.reading_type === "combined"
        ) {
          updatedStats.combined_readings =
            Math.max(
              0,
              currentStats.combined_readings - 1
            );
        }

        return updatedStats;
      });

    } catch (err) {
      console.error(
        "Delete reading error:",
        err
      );

      const message =
        err.response?.data?.detail ||
        "Could not delete reading.";

      setError(message);

    } finally {
      setDeletingReadingId(null);
    }
  };


  // =========================================================
  // HELPERS
  // =========================================================

  const getReadingLabel = (type) => {
    const labels = {
      palm: "Palm Reading",
      tarot: "Tarot Reading",
      combined: "Combined Reading",
    };

    return labels[type] || type;
  };


  const getReadingIcon = (type) => {
    const icons = {
      palm: "✋",
      tarot: "🔮",
      combined: "✨",
    };

    return icons[type] || "📖";
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <Loading text="Loading admin dashboard..." />
    );
  }


  // =========================================================
  // ADMIN DASHBOARD
  // =========================================================

  return (
    <div className="admin-dashboard-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-header">
        <div>
          <p className="admin-eyebrow">
            ADMINISTRATION
          </p>

          <h1>
            Admin Dashboard 👋
          </h1>

          <p>
            Monitor users, readings and platform
            activity from one place.
          </p>
        </div>
      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}


      {/* =====================================================
          PLATFORM OVERVIEW
      ===================================================== */}

      <section className="admin-section">

        <div className="admin-section-title">
          <div>
            <p>OVERVIEW</p>
            <h2>Platform Statistics</h2>
          </div>
        </div>

        <div className="admin-stats-grid">

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              👥
            </div>

            <div>
              <span>Total Users</span>
              <strong>
                {stats?.total_users ?? 0}
              </strong>
            </div>
          </div>


          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              📊
            </div>

            <div>
              <span>Total Readings</span>
              <strong>
                {stats?.total_readings ?? 0}
              </strong>
            </div>
          </div>


          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              ✋
            </div>

            <div>
              <span>Palm Readings</span>
              <strong>
                {stats?.palm_readings ?? 0}
              </strong>
            </div>
          </div>


          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              🔮
            </div>

            <div>
              <span>Tarot Readings</span>
              <strong>
                {stats?.tarot_readings ?? 0}
              </strong>
            </div>
          </div>


          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              ✨
            </div>

            <div>
              <span>Combined Readings</span>
              <strong>
                {stats?.combined_readings ?? 0}
              </strong>
            </div>
          </div>

        </div>
      </section>


      {/* =====================================================
          USER MANAGEMENT
      ===================================================== */}

      <section className="admin-section">

        <div className="admin-section-title">

          <div>
            <p>MANAGEMENT</p>

            <h2>
              Users
            </h2>
          </div>

          <span className="admin-user-count">
            {filteredUsers.length} / {users.length}
          </span>

        </div>


        {/* SEARCH + FILTER */}

        <div className="admin-filters">

          <input
            type="text"
            placeholder="🔎 Search by name or email..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="admin-search"
          />


          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            className="admin-role-filter"
          >
            <option value="all">
              All Roles
            </option>

            <option value="user">
              Users
            </option>

            <option value="admin">
              Admins
            </option>
          </select>

        </div>


        {/* USERS */}

        {filteredUsers.length === 0 ? (

          <div className="admin-empty">
            <div>👥</div>

            <h3>
              No users found
            </h3>

            <p>
              Try changing your search or filter.
            </p>
          </div>

        ) : (

          <div className="admin-users-list">

            {filteredUsers.map((user) => {

              const counts =
                readingCounts[user.email] || {
                  palm: 0,
                  tarot: 0,
                  combined: 0,
                  total: 0,
                };

              return (
                <div
                  className="admin-user-card"
                  key={user._id}
                >

                  {/* USER INFO */}

                  <div className="admin-user-info">

                    <div className="admin-user-avatar">
                      {user.name
                        ? user.name
                            .charAt(0)
                            .toUpperCase()
                        : "U"}
                    </div>

                    <div>

                      <h3>
                        {user.name ||
                          "Unnamed User"}
                      </h3>

                      <p>
                        {user.email}
                      </p>

                      {user.created_at && (
                        <small>
                          Joined{" "}
                          {new Date(
                            user.created_at
                          ).toLocaleString()}
                        </small>
                      )}

                    </div>

                  </div>


                  {/* ROLE */}

                  <span
                    className={
                      user.role === "admin"
                        ? "admin-role-badge admin-role"
                        : "admin-role-badge user-role"
                    }
                  >
                    {user.role === "admin"
                      ? "ADMIN"
                      : "USER"}
                  </span>


                  {/* READING COUNTS */}

                  <div className="admin-reading-counts">

                    <span>
                      ✋ {counts.palm}
                    </span>

                    <span>
                      🔮 {counts.tarot}
                    </span>

                    <span>
                      ✨ {counts.combined}
                    </span>

                    <strong>
                      {counts.total} total
                    </strong>

                  </div>


                  {/* ACTIONS */}

                  <div className="admin-user-actions">

                    <button
                      className="admin-view-btn"
                      onClick={() =>
                        handleViewReadings(user)
                      }
                    >
                      📋 View Readings
                    </button>


                    {user.role === "admin" ? (

                      <span className="admin-protected">
                        🔐 Protected
                      </span>

                    ) : (

                      <button
                        className="admin-delete-btn"
                        onClick={() =>
                          handleDeleteUser(
                            user._id,
                            user.name ||
                              user.email
                          )
                        }
                        disabled={
                          deletingId ===
                          user._id
                        }
                      >
                        {deletingId === user._id
                          ? "Deleting..."
                          : "🗑️ Delete"}
                      </button>

                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </section>


      {/* =====================================================
          ALL READINGS
      ===================================================== */}

      <section className="admin-section">

        <div className="admin-section-title">

          <div>
            <p>ACTIVITY</p>

            <h2>
              Recent Readings
            </h2>
          </div>

          <span className="admin-user-count">
            {readings.length} total
          </span>

        </div>


        {readings.length === 0 ? (

          <div className="admin-empty">
            <div>📊</div>

            <h3>
              No readings yet
            </h3>

            <p>
              No readings have been generated.
            </p>
          </div>

        ) : (

          <div className="admin-readings-list">

            {readings.slice(0, 10).map(
              (reading) => (

                <div
                  className="admin-reading-row"
                  key={reading._id}
                >

                  <div className="admin-reading-icon">
                    {getReadingIcon(
                      reading.reading_type
                    )}
                  </div>

                  <div className="admin-reading-info">

                    <h3>
                      {getReadingLabel(
                        reading.reading_type
                      )}
                    </h3>

                    <p>
                      {reading.user_email}
                    </p>

                    <small>
                      {new Date(
                        reading.created_at
                      ).toLocaleString()}
                    </small>

                  </div>

                  <button
                    className="admin-delete-reading-btn"
                    onClick={() =>
                      handleDeleteReading(
                        reading._id
                      )
                    }
                    disabled={
                      deletingReadingId ===
                      reading._id
                    }
                  >
                    {deletingReadingId ===
                    reading._id
                      ? "Deleting..."
                      : "🗑️ Delete"}
                  </button>

                </div>

              )
            )}

          </div>
        )}

      </section>


      {/* =====================================================
          READING DETAILS MODAL
      ===================================================== */}

      {(selectedUser || loadingUserReadings) && (

        <div
          className="admin-modal-overlay"
          onClick={() => {
            if (!loadingUserReadings) {
              setSelectedUser(null);
              setSelectedUserReadings([]);
            }
          }}
        >

          <div
            className="admin-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="admin-modal-header">

              <div>
                <p>
                  READING HISTORY
                </p>

                <h2>
                  {selectedUser?.name ||
                    "Loading..."}
                </h2>

                {selectedUser && (
                  <span>
                    {selectedUser.email}
                  </span>
                )}
              </div>

              <button
                className="admin-modal-close"
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedUserReadings([]);
                }}
              >
                ✕
              </button>

            </div>


            {loadingUserReadings ? (

              <Loading
                text="Loading readings..."
              />

            ) : selectedUserReadings.length === 0 ? (

              <div className="admin-modal-empty">
                <div>📖</div>

                <h3>
                  No readings found
                </h3>

                <p>
                  This user has not generated
                  any readings yet.
                </p>
              </div>

            ) : (

              <div className="admin-modal-readings">

                {selectedUserReadings.map(
                  (reading) => (

                    <div
                      className="admin-modal-reading"
                      key={reading._id}
                    >

                      <div>

                        <h3>
                          {getReadingIcon(
                            reading.reading_type
                          )}{" "}
                          {getReadingLabel(
                            reading.reading_type
                          )}
                        </h3>

                        <p>
                          {new Date(
                            reading.created_at
                          ).toLocaleString()}
                        </p>

                      </div>


                      <button
                        className="admin-delete-reading-btn"
                        onClick={() =>
                          handleDeleteReading(
                            reading._id
                          )
                        }
                        disabled={
                          deletingReadingId ===
                          reading._id
                        }
                      >
                        {deletingReadingId ===
                        reading._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>

                  )
                )}

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminDashboard;