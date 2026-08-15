import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useAuth,
} from "../auth/AuthContext";

import {
  getAdminAnalyticsSummary,
  getAdminOverview,
  getAdminReadingHistory,
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
} from "../services/authApi";

import "./AdminDashboardPage.css";


// ============================================================
// CONSTANTS
// ============================================================

const USER_ROLES = [

  "user",

  "tarot_reader",

  "spiritual_consultant",

  "administrator",

];


// ============================================================
// HELPERS
// ============================================================

function formatRole(
  role
) {

  return String(
    role || "user"
  )
    .replaceAll(
      "_",
      " "
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}


function formatDate(
  value
) {

  if (!value) {
    return "N/A";
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(
      value
    );

  }


  return date.toLocaleString();
}


function convertDistribution(
  distribution
) {

  if (
    !distribution ||
    typeof distribution !==
      "object"
  ) {

    return [];

  }


  return Object.entries(
    distribution
  )
    .map(
      ([name, value]) => ({

        name,

        value:
          Number(value) || 0,

      })
    )
    .filter(
      (item) =>
        item.value > 0
    );
}


// ============================================================
// METRIC CARD
// ============================================================

function AdminMetricCard({
  label,
  value,
  description,
}) {

  return (
    <article className="admin-metric-card">

      <p className="admin-metric-label">
        {label}
      </p>

      <strong className="admin-metric-value">
        {value}
      </strong>

      <p className="admin-metric-description">
        {description}
      </p>

    </article>
  );
}


// ============================================================
// EMPTY STATE
// ============================================================

function AdminEmptyState({
  message,
}) {

  return (
    <div className="admin-empty-state">
      {message}
    </div>
  );
}


// ============================================================
// ADMIN DASHBOARD
// ============================================================

function AdminDashboardPage() {

  const {
    user,
  } = useAuth();


  // ==========================================================
  // DATA
  // ==========================================================

  const [
    overview,
    setOverview,
  ] = useState(null);


  const [
    users,
    setUsers,
  ] = useState([]);


  const [
    analytics,
    setAnalytics,
  ] = useState(null);


  const [
    readingHistory,
    setReadingHistory,
  ] = useState([]);


  // ==========================================================
  // UI STATE
  // ==========================================================

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  const [
    searchText,
    setSearchText,
  ] = useState("");


  const [
    roleFilter,
    setRoleFilter,
  ] = useState("all");


  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");


  const [
    updatingUserId,
    setUpdatingUserId,
  ] = useState(null);


  // ==========================================================
  // LOAD ADMIN DATA
  // ==========================================================

  const loadAdminDashboard =
    useCallback(
      async () => {

        setIsLoading(
          true
        );

        setError("");


        try {

          const [
            overviewResponse,
            usersResponse,
            analyticsResponse,
            historyResponse,
          ] =
            await Promise.all([

              getAdminOverview(),

              getAdminUsers(),

              getAdminAnalyticsSummary(),

              getAdminReadingHistory(
                20
              ),

            ]);


          setOverview(
            overviewResponse
          );


          setUsers(
            Array.isArray(
              usersResponse
            )
              ? usersResponse
              : []
          );


          setAnalytics(
            analyticsResponse
          );


          setReadingHistory(
            Array.isArray(
              historyResponse
            )
              ? historyResponse
              : []
          );


        } catch (
          dashboardError
        ) {

          console.error(
            "ADMIN DASHBOARD ERROR:",
            dashboardError
          );


          setError(
            dashboardError?.message ||
            "Administrator dashboard could not be loaded."
          );


        } finally {

          setIsLoading(
            false
          );

        }
      },
      []
    );


  useEffect(() => {

    loadAdminDashboard();

  }, [loadAdminDashboard]);


  // ==========================================================
  // FILTER USERS
  // ==========================================================

  const filteredUsers =
    useMemo(
      () => {

        const normalizedSearch =
          searchText
            .trim()
            .toLowerCase();


        return users.filter(
          (account) => {

            const matchesSearch =
              !normalizedSearch ||
              account.full_name
                ?.toLowerCase()
                .includes(
                  normalizedSearch
                ) ||
              account.email
                ?.toLowerCase()
                .includes(
                  normalizedSearch
                );


            const matchesRole =
              roleFilter ===
                "all" ||
              account.role ===
                roleFilter;


            const matchesStatus =
              statusFilter ===
                "all" ||
              (
                statusFilter ===
                  "active" &&
                account.is_active
              ) ||
              (
                statusFilter ===
                  "inactive" &&
                !account.is_active
              );


            return (
              matchesSearch &&
              matchesRole &&
              matchesStatus
            );

          }
        );

      },
      [
        users,
        searchText,
        roleFilter,
        statusFilter,
      ]
    );


  // ==========================================================
  // ROLE UPDATE
  // ==========================================================

  const handleRoleChange =
    async (
      targetUser,
      newRole
    ) => {

      if (
        targetUser.role ===
        newRole
      ) {
        return;
      }


      setUpdatingUserId(
        targetUser.id
      );

      setError("");

      setSuccessMessage("");


      try {

        const updatedUser =
          await updateUserRole(
            targetUser.id,
            newRole
          );


        setUsers(
          (previous) =>
            previous.map(
              (account) =>
                account.id ===
                updatedUser.id
                  ? updatedUser
                  : account
            )
        );


        setSuccessMessage(
          `Role updated for ${updatedUser.full_name}.`
        );


        const updatedOverview =
          await getAdminOverview();


        setOverview(
          updatedOverview
        );


      } catch (
        updateError
      ) {

        console.error(
          "ROLE UPDATE ERROR:",
          updateError
        );


        setError(
          updateError?.message ||
          "The user role could not be updated."
        );


      } finally {

        setUpdatingUserId(
          null
        );

      }
    };


  // ==========================================================
  // STATUS UPDATE
  // ==========================================================

  const handleStatusChange =
    async (
      targetUser
    ) => {

      setUpdatingUserId(
        targetUser.id
      );

      setError("");

      setSuccessMessage("");


      try {

        const updatedUser =
          await updateUserStatus(
            targetUser.id,
            !targetUser.is_active
          );


        setUsers(
          (previous) =>
            previous.map(
              (account) =>
                account.id ===
                updatedUser.id
                  ? updatedUser
                  : account
            )
        );


        setSuccessMessage(

          updatedUser.is_active
            ? `${updatedUser.full_name} has been enabled.`
            : `${updatedUser.full_name} has been disabled.`

        );


        const updatedOverview =
          await getAdminOverview();


        setOverview(
          updatedOverview
        );


      } catch (
        updateError
      ) {

        console.error(
          "STATUS UPDATE ERROR:",
          updateError
        );


        setError(
          updateError?.message ||
          "The user status could not be updated."
        );


      } finally {

        setUpdatingUserId(
          null
        );

      }
    };


  // ==========================================================
  // CHART DATA
  // ==========================================================

  const roleData =
    useMemo(
      () =>
        convertDistribution(
          overview?.roles
        ),
      [
        overview?.roles,
      ]
    );


  const categoryData =
    useMemo(
      () =>
        convertDistribution(
          analytics
            ?.category_distribution
        ),
      [
        analytics
          ?.category_distribution,
      ]
    );


  const spreadData =
    useMemo(
      () =>
        convertDistribution(
          analytics
            ?.spread_distribution
        ),
      [
        analytics
          ?.spread_distribution,
      ]
    );


  const orientationData =
    useMemo(
      () =>
        convertDistribution(
          analytics
            ?.orientation_distribution
        ),
      [
        analytics
          ?.orientation_distribution,
      ]
    );


  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    isLoading
  ) {

    return (
      <section className="admin-dashboard-page">

        <div className="admin-loading-card">

          <h2>
            Loading administrator dashboard...
          </h2>

          <p>
            Preparing users and platform analytics.
          </p>

        </div>

      </section>
    );
  }


  // ==========================================================
  // FULL LOAD ERROR
  // ==========================================================

  if (
    error &&
    !overview
  ) {

    return (
      <section className="admin-dashboard-page">

        <div className="admin-error-card">

          <h2>
            Administrator dashboard unavailable
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={
              loadAdminDashboard
            }
          >
            Retry
          </button>

        </div>

      </section>
    );
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <section className="admin-dashboard-page">

      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <div className="admin-dashboard-header">

        <div>

          <p className="admin-eyebrow">
            ADMINISTRATION
          </p>

          <h1>
            Administrator Dashboard
          </h1>

          <p className="admin-header-description">

            Manage platform users,
            roles, account access and
            platform-wide reading
            analytics.

          </p>

        </div>


        <button
          type="button"
          className="admin-refresh-button"
          onClick={
            loadAdminDashboard
          }
        >
          Refresh Dashboard
        </button>

      </div>


      {/* ==================================================== */}
      {/* CURRENT ADMIN */}
      {/* ==================================================== */}

      <section className="admin-current-user">

        <div className="admin-avatar">

          {
            user?.full_name
              ?.charAt(0)
              ?.toUpperCase() ||
            "A"
          }

        </div>


        <div>

          <strong>
            {
              user?.full_name
            }
          </strong>

          <p>
            {
              user?.email
            }
          </p>

          <span>
            Administrator
          </span>

        </div>

      </section>


      {/* ==================================================== */}
      {/* MESSAGES */}
      {/* ==================================================== */}

      {successMessage && (

        <div className="admin-success-message">

          <strong>
            Success
          </strong>

          <p>
            {successMessage}
          </p>

        </div>

      )}


      {error && (

        <div className="admin-error-message">

          <strong>
            Operation failed
          </strong>

          <p>
            {error}
          </p>

        </div>

      )}


      {/* ==================================================== */}
      {/* USER OVERVIEW */}
      {/* ==================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p className="admin-eyebrow">
              PLATFORM USERS
            </p>

            <h2>
              Account Overview
            </h2>

          </div>

        </div>


        <div className="admin-metric-grid">

          <AdminMetricCard
            label="Total Users"
            value={
              overview
                ?.total_users ??
              0
            }
            description="Registered accounts on the platform."
          />


          <AdminMetricCard
            label="Active Users"
            value={
              overview
                ?.active_users ??
              0
            }
            description="Accounts currently allowed to access the platform."
          />


          <AdminMetricCard
            label="Inactive Users"
            value={
              overview
                ?.inactive_users ??
              0
            }
            description="Accounts currently disabled."
          />


          <AdminMetricCard
            label="Administrators"
            value={
              overview
                ?.roles
                ?.administrator ??
              0
            }
            description="Accounts with administrator privileges."
          />

        </div>

      </section>


      {/* ==================================================== */}
      {/* PLATFORM READING METRICS */}
      {/* ==================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p className="admin-eyebrow">
              PLATFORM ANALYTICS
            </p>

            <h2>
              Reading Overview
            </h2>

          </div>

        </div>


        <div className="admin-metric-grid">

          <AdminMetricCard
            label="Total Readings"
            value={
              analytics
                ?.total_readings ??
              0
            }
            description="Completed readings across the complete platform."
          />


          <AdminMetricCard
            label="Palm Analyses"
            value={
              analytics
                ?.total_palm_analyses ??
              0
            }
            description="Platform readings containing palm analysis."
          />


          <AdminMetricCard
            label="Tarot Readings"
            value={
              analytics
                ?.total_tarot_readings ??
              0
            }
            description="Completed tarot readings across the platform."
          />


          <AdminMetricCard
            label="Average Guidance Score"
            value={
              `${Number(
                analytics
                  ?.average_guidance_score ||
                0
              ).toFixed(2)} / 100`
            }
            description="Average guidance score across all recorded readings."
          />

        </div>

      </section>


      {/* ==================================================== */}
      {/* USER ROLE DISTRIBUTION */}
      {/* ==================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p className="admin-eyebrow">
              ACCESS CONTROL
            </p>

            <h2>
              Users by Role
            </h2>

          </div>

        </div>


        <article className="admin-chart-card">

          {
            roleData.length > 0
              ? (

              <div className="admin-chart">

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <BarChart
                    data={
                      roleData
                    }
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="name"
                      tickFormatter={
                        formatRole
                      }
                    />

                    <YAxis
                      allowDecimals={
                        false
                      }
                    />

                    <Tooltip
                      labelFormatter={
                        formatRole
                      }
                    />

                    <Bar
                      dataKey="value"
                      name="Users"
                      fill="#9b5de5"
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            )
            : (

              <AdminEmptyState
                message="No role statistics are available."
              />

            )
          }

        </article>

      </section>


      {/* ==================================================== */}
      {/* USER MANAGEMENT */}
      {/* ==================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p className="admin-eyebrow">
              USER MANAGEMENT
            </p>

            <h2>
              Manage Accounts
            </h2>

          </div>


          <span className="admin-record-count">

            {
              filteredUsers.length
            }{" "}

            of{" "}

            {
              users.length
            }{" "}

            users

          </span>

        </div>


        {/* FILTERS */}

        <div className="admin-user-filters">

          <input
            type="search"
            value={
              searchText
            }
            onChange={
              (event) =>
                setSearchText(
                  event.target.value
                )
            }
            placeholder="Search by name or email..."
          />


          <select
            value={
              roleFilter
            }
            onChange={
              (event) =>
                setRoleFilter(
                  event.target.value
                )
            }
          >

            <option value="all">
              All Roles
            </option>

            {USER_ROLES.map(
              (role) => (

                <option
                  key={
                    role
                  }
                  value={
                    role
                  }
                >
                  {
                    formatRole(
                      role
                    )
                  }
                </option>

              )
            )}

          </select>


          <select
            value={
              statusFilter
            }
            onChange={
              (event) =>
                setStatusFilter(
                  event.target.value
                )
            }
          >

            <option value="all">
              All Statuses
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>

          </select>

        </div>


        {/* USER TABLE */}

        <article className="admin-table-card">

          {
            filteredUsers.length > 0
              ? (

              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>

                    <tr>

                      <th>
                        User
                      </th>

                      <th>
                        Age Group
                      </th>

                      <th>
                        Role
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Registered
                      </th>

                      <th>
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {
                      filteredUsers.map(
                        (account) => {

                          const isSelf =
                            Number(
                              account.id
                            ) ===
                            Number(
                              user?.id
                            );


                          const isUpdating =
                            updatingUserId ===
                            account.id;


                          return (
                            <tr
                              key={
                                account.id
                              }
                            >

                              <td>

                                <div className="admin-user-cell">

                                  <strong>
                                    {
                                      account.full_name
                                    }
                                  </strong>

                                  <span>
                                    {
                                      account.email
                                    }
                                  </span>

                                  {isSelf && (

                                    <small>
                                      Current administrator
                                    </small>

                                  )}

                                </div>

                              </td>


                              <td>
                                {
                                  account.age_group ||
                                  "Not provided"
                                }
                              </td>


                              <td>

                                <select
                                  className="admin-role-select"
                                  value={
                                    account.role
                                  }
                                  disabled={
                                    isUpdating ||
                                    isSelf
                                  }
                                  onChange={
                                    (event) =>
                                      handleRoleChange(
                                        account,
                                        event.target.value
                                      )
                                  }
                                >

                                  {USER_ROLES.map(
                                    (role) => (

                                      <option
                                        key={
                                          role
                                        }
                                        value={
                                          role
                                        }
                                      >
                                        {
                                          formatRole(
                                            role
                                          )
                                        }
                                      </option>

                                    )
                                  )}

                                </select>

                              </td>


                              <td>

                                <span
                                  className={
                                    account.is_active
                                      ? "admin-status admin-status-active"
                                      : "admin-status admin-status-inactive"
                                  }
                                >

                                  {
                                    account.is_active
                                      ? "Active"
                                      : "Inactive"
                                  }

                                </span>

                              </td>


                              <td>
                                {
                                  formatDate(
                                    account.created_at
                                  )
                                }
                              </td>


                              <td>

                                <button
                                  type="button"
                                  className={
                                    account.is_active
                                      ? "admin-disable-button"
                                      : "admin-enable-button"
                                  }
                                  disabled={
                                    isUpdating ||
                                    isSelf
                                  }
                                  onClick={
                                    () =>
                                      handleStatusChange(
                                        account
                                      )
                                  }
                                >

                                  {
                                    isUpdating
                                      ? "Updating..."
                                      : account.is_active
                                        ? "Disable"
                                        : "Enable"
                                  }

                                </button>

                              </td>

                            </tr>
                          );
                        }
                      )
                    }

                  </tbody>

                </table>

              </div>

            )
            : (

              <AdminEmptyState
                message="No users match the selected filters."
              />

            )
          }

        </article>

      </section>


      {/* ==================================================== */}
      {/* CATEGORY / SPREAD */}
      {/* ==================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p className="admin-eyebrow">
              READING ACTIVITY
            </p>

            <h2>
              Platform Reading Patterns
            </h2>

          </div>

        </div>


        <div className="admin-chart-grid">


          {/* CATEGORY */}

          <article className="admin-chart-card">

            <h3>
              Reading Categories
            </h3>


            {
              categoryData.length > 0
                ? (

                <div className="admin-chart">

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >

                    <BarChart
                      data={
                        categoryData
                      }
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="name"
                      />

                      <YAxis
                        allowDecimals={
                          false
                        }
                      />

                      <Tooltip />

                      <Bar
                        dataKey="value"
                        name="Readings"
                        fill="#9b5de5"
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              )
              : (

                <AdminEmptyState
                  message="No category statistics available."
                />

              )
            }

          </article>


          {/* SPREAD */}

          <article className="admin-chart-card">

            <h3>
              Tarot Spread Usage
            </h3>


            {
              spreadData.length > 0
                ? (

                <div className="admin-chart">

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >

                    <PieChart>

                      <Pie
                        data={
                          spreadData
                        }
                        dataKey="value"
                        nameKey="name"
                        outerRadius={100}
                        fill="#b26be2"
                        label={({
                          name,
                          value,
                        }) =>
                          `${name}: ${value}`
                        }
                      />

                      <Tooltip />

                      <Legend />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

              )
              : (

                <AdminEmptyState
                  message="No tarot spread statistics available."
                />

              )
            }

          </article>

        </div>

      </section>


      {/* ==================================================== */}
      {/* ORIENTATION / COMMON TAROT */}
      {/* ==================================================== */}

      <section className="admin-section">

        <div className="admin-chart-grid">


          <article className="admin-chart-card">

            <h3>
              Tarot Card Orientation
            </h3>


            {
              orientationData.length > 0
                ? (

                <div className="admin-chart">

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >

                    <PieChart>

                      <Pie
                        data={
                          orientationData
                        }
                        dataKey="value"
                        nameKey="name"
                        outerRadius={100}
                        fill="#7654c4"
                        label={({
                          name,
                          value,
                        }) =>
                          `${name}: ${value}`
                        }
                      />

                      <Tooltip />

                      <Legend />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

              )
              : (

                <AdminEmptyState
                  message="No orientation data available."
                />

              )
            }

          </article>


          <article className="admin-chart-card">

            <h3>
              Most Common Tarot Cards
            </h3>


            {
              Array.isArray(
                analytics
                  ?.most_common_tarot_cards
              ) &&
              analytics
                .most_common_tarot_cards
                .length > 0
                ? (

                <div className="admin-common-cards">

                  {
                    analytics
                      .most_common_tarot_cards
                      .map(
                        (
                          card,
                          index
                        ) => (

                          <div
                            className="admin-common-card-row"
                            key={
                              `${card.name}-${index}`
                            }
                          >

                            <span>
                              #{index + 1}
                            </span>

                            <strong>
                              {card.name}
                            </strong>

                            <small>
                              {card.count} draws
                            </small>

                          </div>

                        )
                      )
                  }

                </div>

              )
              : (

                <AdminEmptyState
                  message="No tarot card statistics available."
                />

              )
            }

          </article>

        </div>

      </section>


      {/* ==================================================== */}
      {/* RECENT PLATFORM READINGS */}
      {/* ==================================================== */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>

            <p className="admin-eyebrow">
              RECENT PLATFORM ACTIVITY
            </p>

            <h2>
              Recent Readings
            </h2>

          </div>

        </div>


        <p className="admin-section-note">

          The current analytics API does
          not expose the owner of each
          reading, so this table shows
          platform activity without user
          identity.

        </p>


        <article className="admin-table-card">

          {
            readingHistory.length > 0
              ? (

              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>

                    <tr>

                      <th>
                        ID
                      </th>

                      <th>
                        Created
                      </th>

                      <th>
                        Category
                      </th>

                      <th>
                        Spread
                      </th>

                      <th>
                        Tarot Cards
                      </th>

                      <th>
                        Upright
                      </th>

                      <th>
                        Reversed
                      </th>

                      <th>
                        Score
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {
                      readingHistory.map(
                        (reading) => (

                          <tr
                            key={
                              reading.id
                            }
                          >

                            <td>
                              #{reading.id}
                            </td>


                            <td>
                              {
                                formatDate(
                                  reading.created_at
                                )
                              }
                            </td>


                            <td>
                              {
                                reading.category ||
                                "N/A"
                              }
                            </td>


                            <td>
                              {
                                reading.spread ||
                                "N/A"
                              }
                            </td>


                            <td>

                              {
                                Array.isArray(
                                  reading.tarot_cards
                                ) &&
                                reading.tarot_cards.length > 0
                                  ? reading.tarot_cards.join(
                                      ", "
                                    )
                                  : "N/A"
                              }

                            </td>


                            <td>
                              {
                                reading.upright_count ??
                                0
                              }
                            </td>


                            <td>
                              {
                                reading.reversed_count ??
                                0
                              }
                            </td>


                            <td>

                              {
                                reading
                                  .overall_insight_score !==
                                  null &&
                                reading
                                  .overall_insight_score !==
                                  undefined
                                  ? `${Number(
                                      reading
                                        .overall_insight_score
                                    ).toFixed(2)} / 100`
                                  : "N/A"
                              }

                            </td>

                          </tr>

                        )
                      )
                    }

                  </tbody>

                </table>

              </div>

            )
            : (

              <AdminEmptyState
                message="No platform reading history is available yet."
              />

            )
          }

        </article>

      </section>


      {/* ==================================================== */}
      {/* DISCLAIMER */}
      {/* ==================================================== */}

      <p className="admin-disclaimer">

        Administrator analytics summarize
        platform usage and prototype reading
        activity. Palmistry and tarot outputs
        remain symbolic and are intended for
        entertainment and personal reflection.

      </p>

    </section>
  );
}


export default AdminDashboardPage;