import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getTarotReaderAnalyticsSummary,
  getTarotReaderReadingHistory,
} from "../services/tarotReaderApi";

import "./TarotReaderDashboardPage.css";


// ============================================================
// HELPERS
// ============================================================

function formatNumber(
  value
) {

  const number =
    Number(value);


  if (
    !Number.isFinite(
      number
    )
  ) {

    return "0";

  }


  return number.toLocaleString();
}


function formatScore(
  value
) {

  const number =
    Number(value);


  if (
    !Number.isFinite(
      number
    )
  ) {

    return "0.00";

  }


  return number.toFixed(
    2
  );
}


function formatDate(
  value
) {

  if (!value) {

    return "Unknown";

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


function getDistributionEntries(
  value
) {

  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {

    return [];

  }


  return Object.entries(
    value
  )
    .map(
      ([
        label,
        count,
      ]) => ({

        label,

        count:
          Number(count) || 0,

      })
    )
    .sort(
      (
        first,
        second
      ) =>
        second.count -
        first.count
    );
}


// ============================================================
// METRIC CARD
// ============================================================

function MetricCard({
  label,
  value,
  helper,
}) {

  return (
    <article className="tarot-reader-metric-card">

      <span>
        {label}
      </span>


      <strong>
        {value}
      </strong>


      {helper && (

        <small>
          {helper}
        </small>

      )}

    </article>
  );
}


// ============================================================
// DISTRIBUTION
// ============================================================

function DistributionPanel({
  title,
  data,
}) {

  const entries =
    getDistributionEntries(
      data
    );


  const maximum =
    Math.max(
      1,
      ...entries.map(
        (item) =>
          item.count
      )
    );


  return (
    <article className="tarot-reader-panel">

      <h3>
        {title}
      </h3>


      {
        entries.length === 0
          ? (

            <p className="tarot-reader-muted">
              No data available yet.
            </p>

          )
          : (

            <div className="tarot-reader-bars">

              {entries.map(
                (item) => {

                  const percentage =
                    Math.max(
                      4,
                      (
                        item.count /
                        maximum
                      ) * 100
                    );


                  return (
                    <div
                      className="tarot-reader-bar-row"
                      key={
                        item.label
                      }
                    >

                      <div className="tarot-reader-bar-label">

                        <span>
                          {item.label}
                        </span>


                        <strong>
                          {item.count}
                        </strong>

                      </div>


                      <div className="tarot-reader-bar-track">

                        <div
                          className="tarot-reader-bar-fill"
                          style={{
                            width:
                              `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  );

                }
              )}

            </div>

          )
      }

    </article>
  );
}


// ============================================================
// TAROT READER DASHBOARD
// ============================================================

function TarotReaderDashboardPage() {

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
  // LOAD
  // ==========================================================

  useEffect(() => {

    const loadDashboard =
      async () => {

        setIsLoading(
          true
        );


        setError("");


        try {

          const [
            summaryData,
            historyData,
          ] =
            await Promise.all([

              getTarotReaderAnalyticsSummary(),

              getTarotReaderReadingHistory(
                30
              ),

            ]);


          setSummary(
            summaryData
          );


          setHistory(
            Array.isArray(
              historyData
            )
              ? historyData
              : []
          );


        } catch (
          loadError
        ) {

          console.error(
            "TAROT READER DASHBOARD ERROR:",
            loadError
          );


          setSummary(
            null
          );


          setHistory([]);


          setError(
            loadError?.message ||
            "Tarot Reader analytics could not be loaded."
          );


        } finally {

          setIsLoading(
            false
          );

        }
      };


    loadDashboard();

  }, []);


  // ==========================================================
  // ORIENTATION TOTALS
  // ==========================================================

  const orientationTotals =
    useMemo(
      () => {

        let upright =
          0;

        let reversed =
          0;


        history.forEach(
          (reading) => {

            upright +=
              Number(
                reading
                  ?.upright_count
              ) || 0;


            reversed +=
              Number(
                reading
                  ?.reversed_count
              ) || 0;

          }
        );


        return {
          Upright:
            upright,

          Reversed:
            reversed,
        };

      },

      [
        history,
      ]
    );


  // ==========================================================
  // MOST COMMON CARDS
  // ==========================================================

  const commonCards =
    Array.isArray(
      summary?.most_common_tarot_cards
    )
      ? summary
          .most_common_tarot_cards
          .slice(
            0,
            10
          )
      : [];


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="tarot-reader-page">

      {/* HEADER */}

      <header className="tarot-reader-header">

        <div>

          <p className="tarot-reader-eyebrow">
            ROLE DASHBOARD
          </p>


          <h1>
            Tarot Reader Dashboard
          </h1>


          <p className="tarot-reader-description">

            Review tarot activity,
            spread usage, card patterns
            and recent platform reading
            engagement.

          </p>

        </div>


        <div className="tarot-reader-role-badge">
          Tarot Reader
        </div>

      </header>


      {/* PRIVACY NOTICE */}

      <div className="tarot-reader-notice">

        <strong>
          Analytical view
        </strong>


        <p>

          This dashboard provides aggregated
          reading activity for professional
          Tarot Reader analysis. It does not
          display user emails, passwords or
          account-management information.

        </p>

      </div>


      {/* ERROR */}

      {error && (

        <div className="tarot-reader-error">

          <strong>
            Dashboard unavailable
          </strong>


          <p>
            {error}
          </p>

        </div>

      )}


      {/* LOADING */}

      {
        isLoading
          ? (

            <div className="tarot-reader-empty">

              <h3>
                Loading Tarot Reader analytics...
              </h3>

            </div>

          )
          : summary
            ? (

              <>

                {/* METRICS */}

                <section className="tarot-reader-section">

                  <p className="tarot-reader-eyebrow">
                    PLATFORM ACTIVITY
                  </p>


                  <h2>
                    Reading Overview
                  </h2>


                  <div className="tarot-reader-metrics">

                    <MetricCard
                      label="Total Readings"
                      value={
                        formatNumber(
                          summary
                            .total_readings
                        )
                      }
                    />


                    <MetricCard
                      label="Tarot Readings"
                      value={
                        formatNumber(
                          summary
                            .total_tarot_readings
                        )
                      }
                    />


                    <MetricCard
                      label="Palm Analyses"
                      value={
                        formatNumber(
                          summary
                            .total_palm_analyses
                        )
                      }
                    />


                    <MetricCard
                      label="Average Guidance Score"
                      value={
                        formatScore(
                          summary
                            .average_guidance_score
                        )
                      }
                      helper="/ 100"
                    />

                  </div>

                </section>


                {/* TAROT DISTRIBUTIONS */}

                <section className="tarot-reader-section">

                  <p className="tarot-reader-eyebrow">
                    TAROT ANALYTICS
                  </p>


                  <h2>
                    Tarot Engagement
                  </h2>


                  <div className="tarot-reader-grid">

                    <DistributionPanel
                      title="Spread Distribution"
                      data={
                        summary
                          .spread_distribution
                      }
                    />


                    <DistributionPanel
                      title="Card Orientation"
                      data={
                        orientationTotals
                      }
                    />

                  </div>

                </section>


                {/* CATEGORIES */}

                <section className="tarot-reader-section">

                  <p className="tarot-reader-eyebrow">
                    READING THEMES
                  </p>


                  <h2>
                    Category Distribution
                  </h2>


                  <DistributionPanel
                    title="Reading Categories"
                    data={
                      summary
                        .category_distribution
                    }
                  />

                </section>


                {/* COMMON CARDS */}

                <section className="tarot-reader-section">

                  <p className="tarot-reader-eyebrow">
                    CARD PATTERNS
                  </p>


                  <h2>
                    Most Common Tarot Cards
                  </h2>


                  {
                    commonCards.length === 0
                      ? (

                        <div className="tarot-reader-empty">

                          No tarot-card
                          statistics available yet.

                        </div>

                      )
                      : (

                        <div className="tarot-reader-card-list">

                          {commonCards.map(
                            (
                              card,
                              index
                            ) => (

                              <article
                                className="tarot-reader-common-card"
                                key={
                                  `${card.name}-${index}`
                                }
                              >

                                <span className="tarot-reader-rank">
                                  {index + 1}
                                </span>


                                <div>

                                  <strong>
                                    {
                                      card.name ||
                                      "Unknown Card"
                                    }
                                  </strong>


                                  <small>
                                    Drawn{" "}
                                    {
                                      Number(
                                        card.count
                                      ) || 0
                                    }
                                    {" "}
                                    time(s)
                                  </small>

                                </div>

                              </article>

                            )
                          )}

                        </div>

                      )
                  }

                </section>


                {/* RECENT ACTIVITY */}

                <section className="tarot-reader-section">

                  <p className="tarot-reader-eyebrow">
                    SESSION ENGAGEMENT
                  </p>


                  <h2>
                    Recent Reading Activity
                  </h2>


                  {
                    history.length === 0
                      ? (

                        <div className="tarot-reader-empty">
                          No reading activity available yet.
                        </div>

                      )
                      : (

                        <div className="tarot-reader-table-wrapper">

                          <table className="tarot-reader-table">

                            <thead>

                              <tr>

                                <th>
                                  ID
                                </th>

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
                                  Tarot Cards
                                </th>

                                <th>
                                  Upright
                                </th>

                                <th>
                                  Reversed
                                </th>

                                <th>
                                  Insight Score
                                </th>

                              </tr>

                            </thead>


                            <tbody>

                              {history.map(
                                (
                                  reading,
                                  index
                                ) => (

                                  <tr
                                    key={
                                      reading.id ??
                                      index
                                    }
                                  >

                                    <td>
                                      {
                                        reading.id ??
                                        "-"
                                      }
                                    </td>


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
                                        "General"
                                      }
                                    </td>


                                    <td>
                                      {
                                        reading
                                          .spread ||
                                        "N/A"
                                      }
                                    </td>


                                    <td className="tarot-reader-card-names">

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
                                              .join(
                                                ", "
                                              )

                                          : "No cards"
                                      }

                                    </td>


                                    <td>
                                      {
                                        Number(
                                          reading
                                            .upright_count
                                        ) || 0
                                      }
                                    </td>


                                    <td>
                                      {
                                        Number(
                                          reading
                                            .reversed_count
                                        ) || 0
                                      }
                                    </td>


                                    <td>

                                      {
                                        reading
                                          .overall_insight_score ??
                                        "-"
                                      }

                                    </td>

                                  </tr>

                                )
                              )}

                            </tbody>

                          </table>

                        </div>

                      )
                  }

                </section>

              </>

            )
            : !error
              ? (

                <div className="tarot-reader-empty">
                  No analytics available.
                </div>

              )
              : null
      }

    </div>
  );
}


export default TarotReaderDashboardPage;