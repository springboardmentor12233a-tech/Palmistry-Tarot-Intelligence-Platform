import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router";

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
  getAnalyticsSummary,
  getReadingHistory,
} from "../services/api";

import "./DashboardPage.css";


// ============================================================
// HELPERS
// ============================================================

function convertDistribution(
  distribution
) {
  if (
    !distribution ||
    typeof distribution !== "object"
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


function formatDate(
  value
) {
  if (!value) {
    return "N/A";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleString();
}


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


// ============================================================
// KPI CARD
// ============================================================

function MetricCard({
  label,
  value,
  description,
}) {
  return (
    <article className="user-dashboard-metric">

      <p className="user-dashboard-metric-label">
        {label}
      </p>

      <strong className="user-dashboard-metric-value">
        {value}
      </strong>

      <p className="user-dashboard-metric-description">
        {description}
      </p>

    </article>
  );
}


// ============================================================
// CHART EMPTY STATE
// ============================================================

function ChartEmptyState({
  message,
}) {
  return (
    <div className="user-dashboard-chart-empty">
      {message}
    </div>
  );
}


// ============================================================
// DASHBOARD
// ============================================================

function DashboardPage() {

  const {
    user,
  } = useAuth();


  const [
    summary,
    setSummary,
  ] = useState(null);


  const [
    history,
    setHistory,
  ] = useState([]);


  const [
    isLoading,
    setIsLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  // ==========================================================
  // LOAD USER ANALYTICS
  // ==========================================================

  const loadDashboard =
    useCallback(
      async () => {

        setIsLoading(
          true
        );

        setError("");


        try {

          const [
            summaryResponse,
            historyResponse,
          ] = await Promise.all([

            getAnalyticsSummary(),

            getReadingHistory(
              8
            ),

          ]);


          setSummary(
            summaryResponse
          );


          setHistory(
            Array.isArray(
              historyResponse
            )
              ? historyResponse
              : []
          );


        } catch (dashboardError) {

          console.error(
            "USER DASHBOARD ERROR:",
            dashboardError
          );


          setError(
            dashboardError?.message ||
            "Your dashboard could not be loaded."
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

    loadDashboard();

  }, [loadDashboard]);


  // ==========================================================
  // CHART DATA
  // ==========================================================

  const categoryData =
    useMemo(
      () =>
        convertDistribution(
          summary
            ?.category_distribution
        ),
      [
        summary
          ?.category_distribution,
      ]
    );


  const spreadData =
    useMemo(
      () =>
        convertDistribution(
          summary
            ?.spread_distribution
        ),
      [
        summary
          ?.spread_distribution,
      ]
    );


  const orientationData =
    useMemo(
      () =>
        convertDistribution(
          summary
            ?.orientation_distribution
        ),
      [
        summary
          ?.orientation_distribution,
      ]
    );


  const palmLineData =
    useMemo(
      () => {

        const heart =
          summary
            ?.heart_line_distribution ||
          {};

        const head =
          summary
            ?.head_line_distribution ||
          {};

        const life =
          summary
            ?.life_line_distribution ||
          {};


        const labels =
          new Set([
            ...Object.keys(
              heart
            ),
            ...Object.keys(
              head
            ),
            ...Object.keys(
              life
            ),
          ]);


        return Array.from(
          labels
        ).map(
          (name) => ({

            name,

            heart:
              Number(
                heart[name]
              ) || 0,

            head:
              Number(
                head[name]
              ) || 0,

            life:
              Number(
                life[name]
              ) || 0,

          })
        );

      },
      [summary]
    );


  // ==========================================================
  // PROFILE COMPLETENESS
  // ==========================================================

  const profileComplete =
    Boolean(
      user?.full_name &&
      user?.age_group &&
      user?.interests &&
      user?.spiritual_goal &&
      user?.reading_preference
    );


  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {

    return (
      <section className="user-dashboard-page">

        <div className="user-dashboard-loading">

          <h2>
            Loading your dashboard...
          </h2>

          <p>
            Preparing your personal
            reading analytics.
          </p>

        </div>

      </section>
    );
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (
      <section className="user-dashboard-page">

        <div className="user-dashboard-error">

          <h2>
            Dashboard unavailable
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={
              loadDashboard
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
    <section className="user-dashboard-page">

      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <div className="user-dashboard-header">

        <div>

          <p className="user-dashboard-eyebrow">
            PERSONAL DASHBOARD
          </p>

          <h1>
            Welcome, {
              user?.full_name ||
              "User"
            }
          </h1>

          <p className="user-dashboard-header-description">

            Review your personal reading
            activity, guidance scores,
            tarot patterns and recent
            sessions.

          </p>

        </div>


        <button
          type="button"
          className="user-dashboard-refresh"
          onClick={
            loadDashboard
          }
        >
          Refresh Dashboard
        </button>

      </div>


      {/* ==================================================== */}
      {/* USER SUMMARY */}
      {/* ==================================================== */}

      <section className="user-dashboard-user-card">

        <div className="user-dashboard-avatar">

          {
            user?.full_name
              ?.trim()
              ?.charAt(0)
              ?.toUpperCase()
            || "U"
          }

        </div>


        <div className="user-dashboard-user-details">

          <h2>
            {
              user?.full_name
            }
          </h2>

          <p>
            {
              user?.email
            }
          </p>


          <div className="user-dashboard-user-badges">

            <span>
              {
                formatRole(
                  user?.role
                )
              }
            </span>

            <span
              className={
                profileComplete
                  ? "profile-complete-badge"
                  : "profile-incomplete-badge"
              }
            >

              {
                profileComplete
                  ? "Profile Complete"
                  : "Profile Incomplete"
              }

            </span>

          </div>

        </div>


        <div className="user-dashboard-profile-action">

          <Link to="/profile">
            {
              profileComplete
                ? "Edit Profile"
                : "Complete Profile"
            }
          </Link>

        </div>

      </section>


      {/* ==================================================== */}
      {/* KPI METRICS */}
      {/* ==================================================== */}

      <section className="user-dashboard-section">

        <div className="user-dashboard-section-heading">

          <div>

            <p className="user-dashboard-eyebrow">
              MY ACTIVITY
            </p>

            <h2>
              Reading Overview
            </h2>

          </div>

        </div>


        <div className="user-dashboard-metric-grid">

          <MetricCard
            label="Total Readings"
            value={
              summary
                ?.total_readings ??
              0
            }
            description="Your completed personalized readings."
          />


          <MetricCard
            label="Palm Analyses"
            value={
              summary
                ?.total_palm_analyses ??
              0
            }
            description="Your readings containing palm analysis."
          />


          <MetricCard
            label="Tarot Readings"
            value={
              summary
                ?.total_tarot_readings ??
              0
            }
            description="Your completed tarot-based readings."
          />


          <MetricCard
            label="Average Guidance Score"
            value={
              `${Number(
                summary
                  ?.average_guidance_score ||
                0
              ).toFixed(2)} / 100`
            }
            description="Average score across your saved readings."
          />

        </div>

      </section>


      {/* ==================================================== */}
      {/* QUICK ACTIONS */}
      {/* ==================================================== */}

      <section className="user-dashboard-section">

        <div className="user-dashboard-section-heading">

          <div>

            <p className="user-dashboard-eyebrow">
              QUICK ACCESS
            </p>

            <h2>
              Continue Your Journey
            </h2>

          </div>

        </div>


        <div className="user-dashboard-action-grid">

          <Link
            to="/reading"
            className="user-dashboard-action-card"
          >

            <span>
              01
            </span>

            <h3>
              New Reading
            </h3>

            <p>
              Start a new palm and tarot
              reading with AI interpretation.
            </p>

          </Link>


          <Link
            to="/history"
            className="user-dashboard-action-card"
          >

            <span>
              02
            </span>

            <h3>
              Reading History
            </h3>

            <p>
              Reopen saved readings and
              continue previous conversations.
            </p>

          </Link>


          <Link
            to="/profile"
            className="user-dashboard-action-card"
          >

            <span>
              03
            </span>

            <h3>
              My Profile
            </h3>

            <p>
              Update interests, goals and
              reading preferences.
            </p>

          </Link>


          <Link
            to="/reports"
            className="user-dashboard-action-card"
          >

            <span>
              04
            </span>

            <h3>
              Reports
            </h3>

            <p>
              Access downloadable reading
              reports and exports.
            </p>

          </Link>

        </div>

      </section>


      {/* ==================================================== */}
      {/* CATEGORY + SPREAD */}
      {/* ==================================================== */}

      <section className="user-dashboard-section">

        <div className="user-dashboard-section-heading">

          <div>

            <p className="user-dashboard-eyebrow">
              MY READING PATTERNS
            </p>

            <h2>
              Categories & Tarot Spreads
            </h2>

          </div>

        </div>


        <div className="user-dashboard-chart-grid">


          {/* CATEGORY */}

          <article className="user-dashboard-chart-card">

            <h3>
              Reading Categories
            </h3>

            <p className="user-dashboard-card-note">
              Categories used across your
              completed readings.
            </p>


            {
              categoryData.length > 0
                ? (

                <div className="user-dashboard-chart">

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

                <ChartEmptyState
                  message="Generate readings to see your category distribution."
                />

              )
            }

          </article>


          {/* SPREAD */}

          <article className="user-dashboard-chart-card">

            <h3>
              Tarot Spread Usage
            </h3>

            <p className="user-dashboard-card-note">
              Tarot spreads used in your
              personal readings.
            </p>


            {
              spreadData.length > 0
                ? (

                <div className="user-dashboard-chart">

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
                        outerRadius={105}
                        fill="#9b5de5"
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

                <ChartEmptyState
                  message="No tarot spread statistics available yet."
                />

              )
            }

          </article>

        </div>

      </section>


      {/* ==================================================== */}
      {/* PALM + ORIENTATION */}
      {/* ==================================================== */}

      <section className="user-dashboard-section">

        <div className="user-dashboard-section-heading">

          <div>

            <p className="user-dashboard-eyebrow">
              SYMBOLIC PATTERNS
            </p>

            <h2>
              Palm & Tarot Insights
            </h2>

          </div>

        </div>


        <div className="user-dashboard-chart-grid">


          {/* PALM LINE DISTRIBUTION */}

          <article className="user-dashboard-chart-card">

            <h3>
              Palm Line Results
            </h3>

            <p className="user-dashboard-card-note">
              Distribution of your detected
              heart, head and life line results.
            </p>


            {
              palmLineData.length > 0
                ? (

                <div className="user-dashboard-chart">

                  <ResponsiveContainer
                    width="100%"
                    height={320}
                  >

                    <BarChart
                      data={
                        palmLineData
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

                      <Legend />

                      <Bar
                        dataKey="heart"
                        name="Heart Line"
                        fill="#b26be2"
                      />

                      <Bar
                        dataKey="head"
                        name="Head Line"
                        fill="#7654c4"
                      />

                      <Bar
                        dataKey="life"
                        name="Life Line"
                        fill="#d48ad7"
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              )
              : (

                <ChartEmptyState
                  message="No palm-line statistics available yet."
                />

              )
            }

          </article>


          {/* ORIENTATION */}

          <article className="user-dashboard-chart-card">

            <h3>
              Tarot Card Orientation
            </h3>

            <p className="user-dashboard-card-note">
              Upright and reversed cards
              drawn across your readings.
            </p>


            {
              orientationData.some(
                (item) =>
                  item.value > 0
              )
                ? (

                <div className="user-dashboard-chart">

                  <ResponsiveContainer
                    width="100%"
                    height={320}
                  >

                    <PieChart>

                      <Pie
                        data={
                          orientationData
                        }
                        dataKey="value"
                        nameKey="name"
                        outerRadius={105}
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

                <ChartEmptyState
                  message="No tarot orientation statistics available yet."
                />

              )
            }

          </article>

        </div>

      </section>


      {/* ==================================================== */}
      {/* COMMON TAROT CARDS */}
      {/* ==================================================== */}

      <section className="user-dashboard-section">

        <div className="user-dashboard-section-heading">

          <div>

            <p className="user-dashboard-eyebrow">
              TAROT ACTIVITY
            </p>

            <h2>
              Most Common Tarot Cards
            </h2>

          </div>

        </div>


        <article className="user-dashboard-table-card">

          {
            Array.isArray(
              summary
                ?.most_common_tarot_cards
            ) &&
            summary
              .most_common_tarot_cards
              .length > 0
              ? (

              <div className="user-dashboard-table-wrapper">

                <table className="user-dashboard-table">

                  <thead>

                    <tr>

                      <th>
                        Rank
                      </th>

                      <th>
                        Tarot Card
                      </th>

                      <th>
                        Times Drawn
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {
                      summary
                        .most_common_tarot_cards
                        .map(
                          (
                            card,
                            index
                          ) => (

                            <tr
                              key={
                                `${card.name}-${index}`
                              }
                            >

                              <td>
                                #{index + 1}
                              </td>

                              <td>
                                {
                                  card.name
                                }
                              </td>

                              <td>
                                {
                                  card.count
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

              <ChartEmptyState
                message="Your frequently drawn tarot cards will appear here after more readings."
              />

            )
          }

        </article>

      </section>


      {/* ==================================================== */}
      {/* RECENT READINGS */}
      {/* ==================================================== */}

      <section className="user-dashboard-section">

        <div className="user-dashboard-section-heading">

          <div>

            <p className="user-dashboard-eyebrow">
              RECENT ACTIVITY
            </p>

            <h2>
              Recent Readings
            </h2>

          </div>


          <Link
            to="/history"
            className="user-dashboard-view-link"
          >
            View Full History
          </Link>

        </div>


        <article className="user-dashboard-table-card">

          {
            history.length > 0
              ? (

              <div className="user-dashboard-table-wrapper">

                <table className="user-dashboard-table">

                  <thead>

                    <tr>

                      <th>
                        Date
                      </th>

                      <th>
                        Category
                      </th>

                      <th>
                        Spread
                      </th>

                      <th>
                        Palm
                      </th>

                      <th>
                        Tarot Cards
                      </th>

                      <th>
                        Score
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {
                      history.map(
                        (reading) => (

                          <tr
                            key={
                              reading.id
                            }
                          >

                            <td>
                              {
                                formatDate(
                                  reading
                                    .created_at
                                )
                              }
                            </td>


                            <td>
                              {
                                reading
                                  .category ||
                                "N/A"
                              }
                            </td>


                            <td>
                              {
                                reading
                                  .spread ||
                                "N/A"
                              }
                            </td>


                            <td>

                              <div className="user-dashboard-palm-summary">

                                <span>
                                  H:{" "}
                                  {
                                    reading
                                      .heart_line ||
                                    "N/A"
                                  }
                                </span>

                                <span>
                                  Hd:{" "}
                                  {
                                    reading
                                      .head_line ||
                                    "N/A"
                                  }
                                </span>

                                <span>
                                  L:{" "}
                                  {
                                    reading
                                      .life_line ||
                                    "N/A"
                                  }
                                </span>

                              </div>

                            </td>


                            <td>

                              {
                                Array.isArray(
                                  reading
                                    .tarot_cards
                                ) &&
                                reading
                                  .tarot_cards
                                  .length > 0
                                  ? reading
                                      .tarot_cards
                                      .join(", ")
                                  : "N/A"
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

              <div className="user-dashboard-no-readings">

                <h3>
                  No readings yet
                </h3>

                <p>
                  Your personal analytics
                  will build automatically
                  as you complete readings.
                </p>

                <Link to="/reading">
                  Start Your First Reading
                </Link>

              </div>

            )
          }

        </article>

      </section>


      {/* ==================================================== */}
      {/* DISCLAIMER */}
      {/* ==================================================== */}

      <p className="user-dashboard-disclaimer">

        These analytics summarize only
        your own reading activity.
        Palmistry and tarot are presented
        as symbolic tools for entertainment,
        reflection and personal development,
        not scientific prediction.

      </p>

    </section>
  );
}


export default DashboardPage;