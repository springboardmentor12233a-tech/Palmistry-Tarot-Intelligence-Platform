import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getConsultantAnalyticsSummary,
  getConsultantReadingHistory,
} from "../services/spiritualConsultantApi";

import "./SpiritualConsultantDashboardPage.css";


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


function distributionEntries(
  data
) {

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {

    return [];

  }


  return Object.entries(
    data
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

function ConsultantMetric({
  label,
  value,
  helper,
}) {

  return (
    <article className="consultant-metric">

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
// DISTRIBUTION PANEL
// ============================================================

function ConsultantDistribution({
  title,
  data,
}) {

  const entries =
    distributionEntries(
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
    <article className="consultant-panel">

      <h3>
        {title}
      </h3>


      {
        entries.length === 0
          ? (

            <p className="consultant-muted">
              No data available yet.
            </p>

          )
          : (

            <div className="consultant-bars">

              {entries.map(
                (item) => {

                  const width =
                    Math.max(
                      4,
                      (
                        item.count /
                        maximum
                      ) * 100
                    );


                  return (
                    <div
                      className="consultant-bar-row"
                      key={
                        item.label
                      }
                    >

                      <div className="consultant-bar-label">

                        <span>
                          {item.label}
                        </span>


                        <strong>
                          {item.count}
                        </strong>

                      </div>


                      <div className="consultant-bar-track">

                        <div
                          className="consultant-bar-fill"
                          style={{
                            width:
                              `${width}%`,
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
// DASHBOARD
// ============================================================

function SpiritualConsultantDashboardPage() {

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

              getConsultantAnalyticsSummary(),

              getConsultantReadingHistory(
                50
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
            "CONSULTANT DASHBOARD ERROR:",
            loadError
          );


          setSummary(
            null
          );


          setHistory([]);


          setError(
            loadError?.message ||
            "Consultant analytics could not be loaded."
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
  // SCORE STATISTICS
  // ==========================================================

  const scoreStats =
    useMemo(
      () => {

        const scores =
          history
            .map(
              (item) =>
                Number(
                  item
                    ?.overall_insight_score
                )
            )
            .filter(
              (value) =>
                Number.isFinite(
                  value
                )
            );


        if (
          scores.length === 0
        ) {

          return {
            average: 0,
            highest: 0,
            lowest: 0,
            scoredReadings: 0,
          };

        }


        const total =
          scores.reduce(
            (
              sum,
              value
            ) =>
              sum + value,
            0
          );


        return {
          average:
            total /
            scores.length,

          highest:
            Math.max(
              ...scores
            ),

          lowest:
            Math.min(
              ...scores
            ),

          scoredReadings:
            scores.length,
        };

      },

      [
        history,
      ]
    );


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="consultant-page">

      {/* HEADER */}

      <header className="consultant-header">

        <div>

          <p className="consultant-eyebrow">
            ROLE DASHBOARD
          </p>


          <h1>
            Spiritual Consultant Dashboard
          </h1>


          <p className="consultant-description">

            Review guidance trends,
            reading themes, insight-score
            patterns and platform activity
            to support reflective guidance.

          </p>

        </div>


        <div className="consultant-role-badge">
          Spiritual Consultant
        </div>

      </header>


      {/* NOTICE */}

      <div className="consultant-notice">

        <strong>
          Guidance analytics view
        </strong>


        <p>

          This dashboard uses aggregated
          reading statistics. It does not
          expose user passwords, emails or
          administrative account controls.

        </p>

      </div>


      {/* ERROR */}

      {error && (

        <div className="consultant-error">

          <strong>
            Dashboard unavailable
          </strong>


          <p>
            {error}
          </p>

        </div>

      )}


      {/* CONTENT */}

      {
        isLoading
          ? (

            <div className="consultant-empty">

              <h3>
                Loading consultant analytics...
              </h3>

            </div>

          )
          : summary
            ? (

              <>

                {/* OVERVIEW */}

                <section className="consultant-section">

                  <p className="consultant-eyebrow">
                    PLATFORM GUIDANCE ACTIVITY
                  </p>


                  <h2>
                    Guidance Overview
                  </h2>


                  <div className="consultant-metrics">

                    <ConsultantMetric
                      label="Total Readings"
                      value={
                        formatNumber(
                          summary
                            .total_readings
                        )
                      }
                    />


                    <ConsultantMetric
                      label="Average Guidance Score"
                      value={
                        formatScore(
                          summary
                            .average_guidance_score
                        )
                      }
                      helper="/ 100"
                    />


                    <ConsultantMetric
                      label="Palm Analyses"
                      value={
                        formatNumber(
                          summary
                            .total_palm_analyses
                        )
                      }
                    />


                    <ConsultantMetric
                      label="Tarot Readings"
                      value={
                        formatNumber(
                          summary
                            .total_tarot_readings
                        )
                      }
                    />

                  </div>

                </section>


                {/* GUIDANCE EFFECTIVENESS */}

                <section className="consultant-section">

                  <p className="consultant-eyebrow">
                    GUIDANCE SCORE PATTERNS
                  </p>


                  <h2>
                    Insight Score Analysis
                  </h2>


                  <div className="consultant-metrics">

                    <ConsultantMetric
                      label="Recent Average"
                      value={
                        formatScore(
                          scoreStats.average
                        )
                      }
                      helper="/ 100"
                    />


                    <ConsultantMetric
                      label="Highest Insight Score"
                      value={
                        formatScore(
                          scoreStats.highest
                        )
                      }
                      helper="/ 100"
                    />


                    <ConsultantMetric
                      label="Lowest Insight Score"
                      value={
                        formatScore(
                          scoreStats.lowest
                        )
                      }
                      helper="/ 100"
                    />


                    <ConsultantMetric
                      label="Scored Readings"
                      value={
                        formatNumber(
                          scoreStats
                            .scoredReadings
                        )
                      }
                    />

                  </div>

                </section>


                {/* THEMES */}

                <section className="consultant-section">

                  <p className="consultant-eyebrow">
                    LIFE THEMES
                  </p>


                  <h2>
                    Reading Category Trends
                  </h2>


                  <div className="consultant-grid">

                    <ConsultantDistribution
                      title="Category Distribution"
                      data={
                        summary
                          .category_distribution
                      }
                    />


                    <ConsultantDistribution
                      title="Tarot Spread Distribution"
                      data={
                        summary
                          .spread_distribution
                      }
                    />

                  </div>

                </section>


                {/* PALM PATTERNS */}

                <section className="consultant-section">

                  <p className="consultant-eyebrow">
                    PALM PATTERNS
                  </p>


                  <h2>
                    Palm-Line Trends
                  </h2>


                  <div className="consultant-grid">

                    <ConsultantDistribution
                      title="Heart Line"
                      data={
                        summary
                          .heart_line_distribution
                      }
                    />


                    <ConsultantDistribution
                      title="Head Line"
                      data={
                        summary
                          .head_line_distribution
                      }
                    />


                    <ConsultantDistribution
                      title="Life Line"
                      data={
                        summary
                          .life_line_distribution
                      }
                    />

                  </div>

                </section>


                {/* RECENT ACTIVITY */}

                <section className="consultant-section">

                  <p className="consultant-eyebrow">
                    RECENT GUIDANCE ACTIVITY
                  </p>


                  <h2>
                    Reading Activity
                  </h2>


                  {
                    history.length === 0
                      ? (

                        <div className="consultant-empty">
                          No reading activity available yet.
                        </div>

                      )
                      : (

                        <div className="consultant-table-wrapper">

                          <table className="consultant-table">

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
                                  Palm Result
                                </th>

                                <th>
                                  Tarot Cards
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


                                    <td className="consultant-palm-result">

                                      Heart:{" "}
                                      {
                                        reading
                                          .heart_line ||
                                        "-"
                                      }

                                      <br />

                                      Head:{" "}
                                      {
                                        reading
                                          .head_line ||
                                        "-"
                                      }

                                      <br />

                                      Life:{" "}
                                      {
                                        reading
                                          .life_line ||
                                        "-"
                                      }

                                    </td>


                                    <td className="consultant-card-names">

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


                <p className="consultant-disclaimer">

                  Guidance analytics are
                  prototype reflective metrics.
                  They do not represent
                  psychological, medical or
                  scientific assessment.

                </p>

              </>

            )
            : !error
              ? (

                <div className="consultant-empty">
                  No analytics available.
                </div>

              )
              : null
      }

    </div>
  );
}


export default SpiritualConsultantDashboardPage;