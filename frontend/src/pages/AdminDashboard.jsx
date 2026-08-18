import React, { useEffect, useState } from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import { updateUserStatus } from "../services/api";
import "./AdminDashboard.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

function AdminDashboard() {
  const [statistics, setStatistics] = useState(null);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // User action state
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  // ======================================================
  // LOAD ADMIN DATA
  // ======================================================

  async function loadAdminData() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "Please log in again."
        );
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        statsResponse,
        usersResponse,
      ] = await Promise.all([
        fetch(
          `${API_BASE_URL}/api/admin/statistics`,
          {
            headers,
          }
        ),

        fetch(
          `${API_BASE_URL}/api/admin/users`,
          {
            headers,
          }
        ),
      ]);

      const statsData =
        await statsResponse.json();

      const usersData =
        await usersResponse.json();

      if (!statsResponse.ok) {
        throw new Error(
          statsData.detail ||
          "Unable to load admin statistics."
        );
      }

      if (!usersResponse.ok) {
        throw new Error(
          usersData.detail ||
          "Unable to load users."
        );
      }

      setStatistics(
        statsData.statistics
      );

      setUsers(
        usersData.users || []
      );

    } catch (err) {
      setError(
        err.message ||
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // ACTIVATE / DEACTIVATE USER
  // ======================================================

  async function handleUserStatusChange(user) {
    // ----------------------------------------------------
    // Prevent admin from deactivating themselves
    // ----------------------------------------------------

    if (user.role === "admin") {
      alert(
        "Admin accounts cannot be deactivated."
      );

      return;
    }

    const action =
      user.is_active
        ? "deactivate"
        : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingUserId(user.id);

      await updateUserStatus(
        user.id,
        !user.is_active
      );

      // --------------------------------------------------
      // Update user immediately in UI
      // --------------------------------------------------

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id
            ? {
                ...currentUser,
                is_active:
                  !currentUser.is_active,
              }
            : currentUser
        )
      );

      // --------------------------------------------------
      // Refresh statistics
      // --------------------------------------------------

      await refreshStatistics();

    } catch (err) {
      alert(
        err.message ||
        "Unable to update user status."
      );
    } finally {
      setUpdatingUserId(null);
    }
  }

  // ======================================================
  // REFRESH ONLY STATISTICS
  // ======================================================

  async function refreshStatistics() {
    try {
      const token =
        localStorage.getItem(
          "access_token"
        );

      if (!token) {
        return;
      }

      const response =
        await fetch(
          `${API_BASE_URL}/api/admin/statistics`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (response.ok) {
        setStatistics(
          data.statistics
        );
      }

    } catch (err) {
      console.error(
        "Unable to refresh statistics:",
        err
      );
    }
  }

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <>
        <DashboardNavbar />

        <main className="admin-main">

          <div className="admin-loading">

            <div className="admin-loading-symbol">
              ✦
            </div>

            <h2>
              Loading admin dashboard...
            </h2>

            <p>
              Gathering platform statistics.
            </p>

          </div>

        </main>
      </>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <>
        <DashboardNavbar />

        <main className="admin-main">

          <div className="admin-error">

            <div className="admin-error-symbol">
              !
            </div>

            <h2>
              Access denied
            </h2>

            <p>
              {error}
            </p>

            <button
              className="admin-retry-button"
              onClick={loadAdminData}
            >
              Try Again
            </button>

          </div>

        </main>
      </>
    );
  }

  // ======================================================
  // DASHBOARD
  // ======================================================

  return (
    <>
      <DashboardNavbar />

      <main className="admin-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="admin-header">

          <div>

            <span className="admin-eyebrow">
              ADMINISTRATION
            </span>

            <h1>
              Platform{" "}
              <span>
                overview.
              </span>
            </h1>

            <p>
              Monitor users, readings and
              activity across the P&T
              Intelligence platform.
            </p>

          </div>

          <div className="admin-symbol">
            ✦
          </div>

        </section>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="admin-stats-grid">

          <article className="admin-stat-card">

            <div className="admin-stat-icon">
              👥
            </div>

            <span>
              Total Users
            </span>

            <strong>
              {statistics?.total_users ?? 0}
            </strong>

          </article>


          <article className="admin-stat-card">

            <div className="admin-stat-icon">
              🟢
            </div>

            <span>
              Active Users
            </span>

            <strong>
              {statistics?.active_users ?? 0}
            </strong>

          </article>


          <article className="admin-stat-card">

            <div className="admin-stat-icon">
              👑
            </div>

            <span>
              Admin Users
            </span>

            <strong>
              {statistics?.admin_users ?? 0}
            </strong>

          </article>


          <article className="admin-stat-card">

            <div className="admin-stat-icon">
              📊
            </div>

            <span>
              Total Readings
            </span>

            <strong>
              {statistics?.total_readings ?? 0}
            </strong>

          </article>

        </section>


        {/* =================================================
            READING STATISTICS
        ================================================= */}

        <section className="admin-reading-grid">

          <article className="admin-reading-card">

            <span className="admin-card-label">
              PALMISTRY
            </span>

            <h2>
              {statistics?.total_palmistry_readings ?? 0}
            </h2>

            <p>
              Total palmistry readings
              created by users.
            </p>

          </article>


          <article className="admin-reading-card">

            <span className="admin-card-label">
              TAROT
            </span>

            <h2>
              {statistics?.total_tarot_readings ?? 0}
            </h2>

            <p>
              Total tarot readings
              created by users.
            </p>

          </article>


          <article className="admin-reading-card">

            <span className="admin-card-label">
              USERS
            </span>

            <h2>
              {statistics?.normal_users ?? 0}
            </h2>

            <p>
              Registered users with
              standard access.
            </p>

          </article>

        </section>


        {/* =================================================
            USER MANAGEMENT
        ================================================= */}

        <section className="admin-users-section">

          <div className="admin-section-heading">

            <div>

              <span className="admin-eyebrow">
                USER MANAGEMENT
              </span>

              <h2>
                Registered users
              </h2>

              <p>
                View and manage accounts
                registered on the platform.
              </p>

            </div>


            <button
              className="admin-refresh-button"
              onClick={loadAdminData}
              disabled={updatingUserId !== null}
            >
              ↻ Refresh
            </button>

          </div>


          <div className="admin-table-wrapper">

            <table className="admin-users-table">

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    User
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Created
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {users.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                      }}
                    >
                      No users found.
                    </td>

                  </tr>

                ) : (

                  users.map((user) => {

                    const isUpdating =
                      updatingUserId ===
                      user.id;

                    const isAdmin =
                      user.role ===
                      "admin";

                    return (

                      <tr
                        key={user.id}
                      >

                        {/* ID */}

                        <td>
                          #{user.id}
                        </td>


                        {/* USER */}

                        <td>

                          <div className="admin-user-name">

                            <div className="admin-user-avatar">

                              {user.name
                                ?.charAt(0)
                                ?.toUpperCase()}

                            </div>

                            <strong>
                              {user.name}
                            </strong>

                          </div>

                        </td>


                        {/* EMAIL */}

                        <td>
                          {user.email}
                        </td>


                        {/* ROLE */}

                        <td>

                          <span
                            className={
                              user.role ===
                              "admin"
                                ? "role-badge admin-role"
                                : "role-badge user-role"
                            }
                          >
                            {user.role}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={
                              user.is_active
                                ? "status-badge active-status"
                                : "status-badge inactive-status"
                            }
                          >
                            {user.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>


                        {/* CREATED */}

                        <td>

                          {user.created_at
                            ? new Date(
                                user.created_at
                              ).toLocaleDateString()
                            : "—"}

                        </td>


                        {/* ACTION */}

                        <td>

                          {isAdmin ? (

                            <span className="admin-protected-label">
                              Protected
                            </span>

                          ) : (

                            <button
                              type="button"
                              className={
                                user.is_active
                                  ? "user-status-button deactivate-button"
                                  : "user-status-button activate-button"
                              }
                              onClick={() =>
                                handleUserStatusChange(
                                  user
                                )
                              }
                              disabled={
                                isUpdating
                              }
                            >

                              {isUpdating
                                ? "Updating..."
                                : user.is_active
                                  ? "Deactivate"
                                  : "Activate"}

                            </button>

                          )}

                        </td>

                      </tr>

                    );

                  })

                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* =================================================
            DISCLAIMER
        ================================================= */}

        <p className="admin-disclaimer">

          ✦ Administrative information is
          restricted to authorized platform
          administrators.

        </p>

      </main>
    </>
  );
}

export default AdminDashboard;