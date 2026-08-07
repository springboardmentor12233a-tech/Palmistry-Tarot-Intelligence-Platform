import { useState } from "react";

import {
  downloadAnalyticsSummaryCsv,
  downloadReadingHistoryCsv,
} from "../services/api";

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
  ).map(([name, value]) => ({
    name,
    value: Number(value) || 0,
  }));
}


function StatisticCard({
  title,
  value,
  subtitle,
}) {
  return (
    <article className="analytics-stat-card">
      <p className="analytics-stat-title">
        {title}
      </p>

      <h3>{value}</h3>

      {subtitle && (
        <p className="analytics-stat-subtitle">
          {subtitle}
        </p>
      )}
    </article>
  );
}


function DistributionChart({
  title,
  data,
}) {
  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {
    return (
      <article className="analytics-chart-card">
        <h3>{title}</h3>

        <p className="section-note">
          No analytics data available yet.
        </p>
      </article>
    );
  }

  return (
    <article className="analytics-chart-card">
      <h3>{title}</h3>

      <div className="analytics-chart">
        <ResponsiveContainer
          width="100%"
          height={280}
        >
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="name"
            />

            <YAxis
              allowDecimals={false}
            />

            <Tooltip />

            <Legend />

            <Bar
              dataKey="value"
              name="Readings"
              fill="#9b5de5"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}


function AnalyticsDashboard({
  summary,
  history,
  isLoading,
  error,
  onRefresh,
}) {
  const [
    isExportingSummary,
    setIsExportingSummary,
  ] = useState(false);

  const [
    isExportingHistory,
    setIsExportingHistory,
  ] = useState(false);

  const [
    exportError,
    setExportError,
  ] = useState("");


  const handleDownloadSummary =
    async () => {
      setIsExportingSummary(true);

      setExportError("");

      try {
        await downloadAnalyticsSummaryCsv();
      } catch (downloadError) {
        console.error(
          "ANALYTICS SUMMARY DOWNLOAD ERROR:",
          downloadError
        );

        setExportError(
          downloadError?.message ||
            "Analytics summary export failed."
        );
      } finally {
        setIsExportingSummary(false);
      }
    };


  const handleDownloadHistory =
    async () => {
      setIsExportingHistory(true);

      setExportError("");

      try {
        await downloadReadingHistoryCsv(
          100
        );
      } catch (downloadError) {
        console.error(
          "READING HISTORY DOWNLOAD ERROR:",
          downloadError
        );

        setExportError(
          downloadError?.message ||
            "Reading history export failed."
        );
      } finally {
        setIsExportingHistory(false);
      }
    };


  if (isLoading) {
    return (
      <section className="analytics-dashboard">
        <p className="eyebrow">
          EXECUTIVE ANALYTICS
        </p>

        <h2>
          Platform Analytics Dashboard
        </h2>

        <p className="section-note">
          Loading analytics...
        </p>
      </section>
    );
  }


  if (error) {
    return (
      <section className="analytics-dashboard">
        <p className="eyebrow">
          EXECUTIVE ANALYTICS
        </p>

        <h2>
          Platform Analytics Dashboard
        </h2>

        <div
          className="error-message"
          role="alert"
        >
          <strong>
            Analytics could not be loaded
          </strong>

          <p>{error}</p>
        </div>

        <button
          type="button"
          className="analytics-refresh-button"
          onClick={onRefresh}
        >
          Retry Analytics
        </button>
      </section>
    );
  }


  if (!summary) {
    return (
      <section className="analytics-dashboard">
        <p className="eyebrow">
          EXECUTIVE ANALYTICS
        </p>

        <h2>
          Platform Analytics Dashboard
        </h2>

        <p className="section-note">
          No analytics information is
          currently available.
        </p>
      </section>
    );
  }


  const spreadData =
    convertDistribution(
      summary.spread_distribution
    );

  const categoryData =
    convertDistribution(
      summary.category_distribution
    );

  const heartLineData =
    convertDistribution(
      summary.heart_line_distribution
    );

  const headLineData =
    convertDistribution(
      summary.head_line_distribution
    );

  const lifeLineData =
    convertDistribution(
      summary.life_line_distribution
    );

  const orientationData =
    convertDistribution(
      summary.orientation_distribution
    );


  const totalOrientationCards =
    orientationData.reduce(
      (total, item) =>
        total + item.value,
      0
    );


  return (
    <section className="analytics-dashboard">

      {/* ==================================== */}
      {/* HEADER */}
      {/* ==================================== */}

      <div className="analytics-header">

        <div>
          <p className="eyebrow">
            EXECUTIVE ANALYTICS
          </p>

          <h2>
            Platform Analytics Dashboard
          </h2>

          <p className="section-note">
            Aggregated prototype statistics
            generated from completed palm
            and tarot readings.
          </p>
        </div>


        <div className="analytics-action-buttons">

          <button
            type="button"
            className="analytics-refresh-button"
            onClick={onRefresh}
            disabled={
              isExportingSummary ||
              isExportingHistory
            }
          >
            Refresh Analytics
          </button>


          <button
            type="button"
            className="analytics-refresh-button"
            onClick={
              handleDownloadSummary
            }
            disabled={
              isExportingSummary
            }
          >
            {isExportingSummary
              ? "Preparing Analytics CSV..."
              : "Download Analytics CSV"}
          </button>


          <button
            type="button"
            className="analytics-refresh-button"
            onClick={
              handleDownloadHistory
            }
            disabled={
              isExportingHistory
            }
          >
            {isExportingHistory
              ? "Preparing History CSV..."
              : "Download History CSV"}
          </button>

        </div>

      </div>


      {/* ==================================== */}
      {/* EXPORT ERROR */}
      {/* ==================================== */}

      {exportError && (
        <div
          className="error-message"
          role="alert"
        >
          <strong>
            Export failed
          </strong>

          <p>
            {exportError}
          </p>
        </div>
      )}


      {/* ==================================== */}
      {/* KPI CARDS */}
      {/* ==================================== */}

      <div className="analytics-stat-grid">

        <StatisticCard
          title="Total Readings"
          value={
            summary.total_readings ?? 0
          }
          subtitle="Complete AI readings"
        />


        <StatisticCard
          title="Palm Analyses"
          value={
            summary
              .total_palm_analyses ?? 0
          }
          subtitle="Readings with palm results"
        />


        <StatisticCard
          title="Tarot Readings"
          value={
            summary
              .total_tarot_readings ?? 0
          }
          subtitle="Completed tarot readings"
        />


        <StatisticCard
          title="Average Guidance Score"
          value={
            `${Number(
              summary
                .average_guidance_score ||
                0
            ).toFixed(2)} / 100`
          }
          subtitle="Average prototype alignment score"
        />

      </div>


      {/* ==================================== */}
      {/* GENERAL READING ANALYTICS */}
      {/* ==================================== */}

      <h2 className="analytics-subheading">
        Reading Analytics
      </h2>


      <div className="analytics-chart-grid">

        <DistributionChart
          title="Tarot Spread Distribution"
          data={spreadData}
        />


        <DistributionChart
          title="Reading Category Distribution"
          data={categoryData}
        />

      </div>


      {/* ==================================== */}
      {/* PALM ANALYTICS */}
      {/* ==================================== */}

      <h2 className="analytics-subheading">
        Palm Analysis Statistics
      </h2>


      <div className="analytics-chart-grid">

        <DistributionChart
          title="Heart Line Distribution"
          data={heartLineData}
        />


        <DistributionChart
          title="Head Line Distribution"
          data={headLineData}
        />


        <DistributionChart
          title="Life Line Distribution"
          data={lifeLineData}
        />

      </div>


      {/* ==================================== */}
      {/* TAROT ANALYTICS */}
      {/* ==================================== */}

      <h2 className="analytics-subheading">
        Tarot Analytics
      </h2>


      <article className="analytics-chart-card">

        <h3>
          Upright vs Reversed Cards
        </h3>


        {orientationData.length > 0 &&
        totalOrientationCards > 0 ? (

          <div className="analytics-chart">

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <PieChart>

                <Pie
                  data={orientationData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label={({
                    name,
                    value,
                  }) =>
                    `${name}: ${value}`
                  }
                  fill="#9b5de5"
                />

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

        ) : (

          <p className="section-note">
            No tarot orientation data
            available yet.
          </p>

        )}

      </article>


      {/* ==================================== */}
      {/* COMMON TAROT CARDS */}
      {/* ==================================== */}

      <article className="analytics-chart-card">

        <h3>
          Most Common Tarot Cards
        </h3>


        {Array.isArray(
          summary
            .most_common_tarot_cards
        ) &&
        summary
          .most_common_tarot_cards
          .length > 0 ? (

          <div className="analytics-table-wrapper">

            <table className="analytics-table">

              <thead>

                <tr>
                  <th>Rank</th>

                  <th>
                    Tarot Card
                  </th>

                  <th>
                    Times Drawn
                  </th>
                </tr>

              </thead>


              <tbody>

                {summary
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
                          {index + 1}
                        </td>

                        <td>
                          {card.name}
                        </td>

                        <td>
                          {card.count}
                        </td>

                      </tr>

                    )
                  )}

              </tbody>

            </table>

          </div>

        ) : (

          <p className="section-note">
            No tarot-card statistics
            available yet.
          </p>

        )}

      </article>


      {/* ==================================== */}
      {/* RECENT READING HISTORY */}
      {/* ==================================== */}

      <article className="analytics-chart-card">

        <div className="analytics-history-header">

          <div>
            <h3>
              Recent Reading History
            </h3>

            <p className="section-note">
              Showing the most recent
              completed readings.
            </p>
          </div>

        </div>


        {Array.isArray(history) &&
        history.length > 0 ? (

          <div className="analytics-table-wrapper">

            <table className="analytics-table">

              <thead>

                <tr>
                  <th>ID</th>

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
                    Palm Results
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

                {history.map(
                  (reading) => (

                    <tr key={reading.id}>

                      <td>
                        {reading.id}
                      </td>


                      <td>
                        {reading.created_at
                          ? new Date(
                              reading.created_at
                            ).toLocaleString()
                          : "N/A"}
                      </td>


                      <td>
                        {reading.category ||
                          "N/A"}
                      </td>


                      <td>
                        {reading.spread ||
                          "N/A"}
                      </td>


                      <td>

                        <div>
                          <strong>
                            Heart:
                          </strong>{" "}
                          {
                            reading
                              .heart_line ||
                            "N/A"
                          }
                        </div>

                        <div>
                          <strong>
                            Head:
                          </strong>{" "}
                          {
                            reading
                              .head_line ||
                            "N/A"
                          }
                        </div>

                        <div>
                          <strong>
                            Life:
                          </strong>{" "}
                          {
                            reading
                              .life_line ||
                            "N/A"
                          }
                        </div>

                      </td>


                      <td>

                        {Array.isArray(
                          reading.tarot_cards
                        ) &&
                        reading.tarot_cards
                          .length > 0
                          ? reading
                              .tarot_cards
                              .join(", ")
                          : "N/A"}

                      </td>


                      <td>
                        {
                          reading
                            .upright_count ??
                          0
                        }
                      </td>


                      <td>
                        {
                          reading
                            .reversed_count ??
                          0
                        }
                      </td>


                      <td>

                        {reading
                          .overall_insight_score !==
                          null &&
                        reading
                          .overall_insight_score !==
                          undefined
                          ? Number(
                              reading
                                .overall_insight_score
                            ).toFixed(2)
                          : "N/A"}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <p className="section-note">
            No reading history available.
          </p>

        )}

      </article>


      {/* ==================================== */}
      {/* DISCLAIMER */}
      {/* ==================================== */}

      <p className="disclaimer">
        Analytics represent usage,
        distribution and consistency
        statistics from this prototype.
        Palmistry and tarot outputs are
        intended for entertainment and
        personal reflection rather than
        scientific prediction.
      </p>

    </section>
  );
}


export default AnalyticsDashboard;