import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardNavbar from "../components/DashboardNavbar";

import {
  getReportHistory,
  downloadPalmistryReport,
  downloadTarotReport,
  downloadCombinedReport,
} from "../services/api";

import "./Reports.css";


function Reports() {

  // =====================================================
  // STATE
  // =====================================================

 const [palmReadings, setPalmReadings] = useState([]);
const [tarotReadings, setTarotReadings] = useState([]);

const [combinedReport, setCombinedReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [downloading, setDownloading] = useState(null);


  // =====================================================
  // LOAD USER REPORT DATA
  // =====================================================

  useEffect(() => {

    async function loadReports() {
  try {
    setLoading(true);
    setError("");

    const response = await getReportHistory();

    setPalmReadings(
      response?.reports?.filter(
        (report) => report.type === "Palmistry"
      ) || []
    );

    setTarotReadings(
      response?.reports?.filter(
        (report) => report.type === "Tarot"
      ) || []
    );

    setCombinedReport(
      response?.combined_report || null
    );

  } catch (err) {
    console.error(
      "Failed to load reports:",
      err
    );

    setError(
      err.message ||
      "Unable to load your reports."
    );

  } finally {
    setLoading(false);
  }
}


    loadReports();

  }, []);


  // =====================================================
  // COUNTS
  // =====================================================

  const palmCount =
    palmReadings.length;

  const tarotCount =
    tarotReadings.length;

  const totalReports =
    palmCount + tarotCount;


  // =====================================================
  // DATE FORMATTER
  // =====================================================

  function formatDate(dateValue) {

    if (!dateValue) {
      return "Date unavailable";
    }

    const date =
      new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }


  // =====================================================
  // DOWNLOAD PALMISTRY REPORT
  // =====================================================

  async function handlePalmDownload(
    readingId
  ) {

    try {

      setDownloading(
        `palm-${readingId}`
      );

      await downloadPalmistryReport(
        readingId
      );

    } catch (err) {

      console.error(err);

      alert(
        err.message ||
        "Unable to download palmistry report."
      );

    } finally {

      setDownloading(null);

    }
  }


  // =====================================================
  // DOWNLOAD TAROT REPORT
  // =====================================================

  async function handleTarotDownload(
    readingId
  ) {

    try {

      setDownloading(
        `tarot-${readingId}`
      );

      await downloadTarotReport(
        readingId
      );

    } catch (err) {

      console.error(err);

      alert(
        err.message ||
        "Unable to download tarot report."
      );

    } finally {

      setDownloading(null);

    }
  }


  // =====================================================
  // DOWNLOAD COMBINED REPORT
  // =====================================================

  async function handleCombinedDownload(
    palmId,
    tarotId
  ) {

    try {

      setDownloading(
        `combined-${palmId}-${tarotId}`
      );

      await downloadCombinedReport(
        palmId,
        tarotId
      );

    } catch (err) {

      console.error(err);

      alert(
        err.message ||
        "Unable to download combined report."
      );

    } finally {

      setDownloading(null);

    }
  }


  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {

    return (
      <>
        <DashboardNavbar
          activePage="reports"
        />

        <main className="reports-main">

          <section className="reports-header">

            <div>

              <span className="reports-eyebrow">
                YOUR REPORTS
              </span>

              <h1>
                Your <span>reports.</span>
              </h1>

              <p>
                Loading your personal reports...
              </p>

            </div>

            <div
              className="reports-symbol"
              aria-hidden="true"
            >
              ✦
            </div>

          </section>

        </main>
      </>
    );
  }


  // =====================================================
  // ERROR STATE
  // =====================================================

  if (error) {

    return (
      <>
        <DashboardNavbar
          activePage="reports"
        />

        <main className="reports-main">

          <section className="reports-header">

            <div>

              <span className="reports-eyebrow">
                YOUR REPORTS
              </span>

              <h1>
                Your <span>reports.</span>
              </h1>

              <p>
                Review your palmistry and tarot
                experiences.
              </p>

            </div>

            <div
              className="reports-symbol"
              aria-hidden="true"
            >
              ✦
            </div>

          </section>


          <section className="reports-container">

            <div className="reports-empty-state">

              <div className="empty-report-icon">
                !
              </div>

              <h3>
                Unable to load reports.
              </h3>

              <p>
                {error}
              </p>

              <button
                className="primary-report-button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again →
              </button>

            </div>

          </section>

        </main>
      </>
    );
  }


  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <>
      <DashboardNavbar
        activePage="reports"
      />


      <main className="reports-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="reports-header">

          <div>

            <span className="reports-eyebrow">
              YOUR REPORTS
            </span>

            <h1>
              Your <span>reports.</span>
            </h1>

            <p>
              Review your palmistry and tarot
              experiences and keep track of
              your personal self-discovery journey.
            </p>

          </div>


          <div
            className="reports-symbol"
            aria-hidden="true"
          >
            ✦
          </div>

        </section>


        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section className="report-summary-grid">


          {/* PALMISTRY */}

          <article className="report-summary-card">

            <div className="report-icon palm-icon">
              ✋
            </div>

            <div>

              <span className="report-card-label">
                PALMISTRY
              </span>

              <h2>
                {palmCount}{" "}
                {palmCount === 1
                  ? "Report"
                  : "Reports"}
              </h2>

              <p>
                Your palm analysis reports.
              </p>

            </div>

          </article>


          {/* TAROT */}

          <article className="report-summary-card">

            <div className="report-icon tarot-icon">
              🃏
            </div>

            <div>

              <span className="report-card-label">
                TAROT
              </span>

              <h2>
                {tarotCount}{" "}
                {tarotCount === 1
                  ? "Report"
                  : "Reports"}
              </h2>

              <p>
                Your tarot reading reports.
              </p>

            </div>

          </article>


          {/* TOTAL */}

          <article className="report-summary-card">

            <div className="report-icon insight-icon">
              ✦
            </div>

            <div>

              <span className="report-card-label">
                TOTAL
              </span>

              <h2>
                {totalReports}{" "}
                {totalReports === 1
                  ? "Report"
                  : "Reports"}
              </h2>

              <p>
                Your complete report collection.
              </p>

            </div>

          </article>

        </section>


        {/* =================================================
            REPORT HISTORY
        ================================================= */}

        <section className="reports-container">

          <div className="reports-section-heading">

            <span className="reports-eyebrow">
              REPORT HISTORY
            </span>

            <h2>
              Your recent reports
            </h2>

            <p>
              Access reports generated from
              your completed palmistry and
              tarot readings.
            </p>

          </div>


          {/* =================================================
              PALMISTRY REPORTS
          ================================================= */}

          {palmReadings.length > 0 && (

            <div className="report-history-section">

              <div className="report-history-title">

                <span className="reports-eyebrow">
                  PALMISTRY
                </span>

                <h3>
                  Palmistry reports
                </h3>

              </div>


              {palmReadings.map(
                (reading) => (

                  <article
                    className="report-history-card"
                    key={`palm-${reading.id}`}
                  >

                    <div className="report-history-number">
                      {String(
                        reading.id
                      ).padStart(2, "0")}
                    </div>


                    <div className="report-history-content">

                      <span className="report-card-label">
                        PALM READING
                      </span>

                      <h3>
                        Palm Reading #{reading.id}
                      </h3>

                      <p>
                        {formatDate(
                          reading.created_at
                        )}
                      </p>

                      <div className="report-history-summary">

                        <strong>
                          Palm Shape:
                        </strong>{" "}

                        {reading.palm_shape ||
                          "Balanced palm shape"}

                      </div>

                    </div>


                    <button
                      className="primary-report-button"
                      onClick={() =>
                        handlePalmDownload(
                          reading.id
                        )
                      }
                      disabled={
                        downloading ===
                        `palm-${reading.id}`
                      }
                    >

                      {downloading ===
                      `palm-${reading.id}`
                        ? "Generating..."
                        : "Download PDF →"}

                    </button>

                  </article>

                )
              )}

            </div>

          )}


          {/* =================================================
              TAROT REPORTS
          ================================================= */}

          {tarotReadings.length > 0 && (

            <div className="report-history-section">

              <div className="report-history-title">

                <span className="reports-eyebrow">
                  TAROT
                </span>

                <h3>
                  Tarot reports
                </h3>

              </div>


              {tarotReadings.map(
                (reading) => (

                  <article
                    className="report-history-card"
                    key={`tarot-${reading.id}`}
                  >

                    <div className="report-history-number">
                      {String(
                        reading.id
                      ).padStart(2, "0")}
                    </div>


                    <div className="report-history-content">

                      <span className="report-card-label">
                        TAROT READING
                      </span>

                      <h3>
                        Tarot Reading #{reading.id}
                      </h3>

                      <p>
                        {formatDate(
                          reading.created_at
                        )}
                      </p>

                      <div className="report-history-summary">

                        <strong>
                          Question:
                        </strong>{" "}

                        {reading.question ||
                          "Tarot reflection"}

                      </div>

                    </div>


                    <button
                      className="primary-report-button"
                      onClick={() =>
                        handleTarotDownload(
                          reading.id
                        )
                      }
                      disabled={
                        downloading ===
                        `tarot-${reading.id}`
                      }
                    >

                      {downloading ===
                      `tarot-${reading.id}`
                        ? "Generating..."
                        : "Download PDF →"}

                    </button>

                  </article>

                )
              )}

            </div>

          )}


          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {palmReadings.length === 0 &&
            tarotReadings.length === 0 && (

              <div className="reports-empty-state">

                <div className="empty-report-icon">
                  ✦
                </div>

                <h3>
                  Your report history is empty.
                </h3>

                <p>
                  Complete your first palmistry
                  or tarot reading and your
                  generated report will appear here.
                </p>


                <div className="report-actions">

                  <Link
                    to="/palmistry"
                    className="primary-report-button"
                  >
                    Start Palm Reading →
                  </Link>

                  <Link
                    to="/tarot"
                    className="secondary-report-button"
                  >
                    Start Tarot Reading →
                  </Link>

                </div>

              </div>

            )}

        </section>


        {/* =================================================
            COMBINED REPORT
        ================================================= */}

        {palmReadings.length > 0 &&
          tarotReadings.length > 0 && (

            <section className="reports-container">

              <div className="reports-section-heading">

                <span className="reports-eyebrow">
                  COMBINED REPORT
                </span>

                <h2>
                  Your complete journey
                </h2>

                <p>
                  Combine a palmistry reading and
                  tarot reading into one PDF report.
                </p>

              </div>


              <div className="reports-empty-state">

                <div className="empty-report-icon">
                  ✦
                </div>

                <h3>
                  Palmistry + Tarot
                </h3>

                <p>
                  Your combined journey report
                  brings both symbolic readings
                  together.
                </p>


                <button
                  className="primary-report-button"
                  onClick={() =>
                    handleCombinedDownload(
                      palmReadings[0].id,
                      tarotReadings[0].id
                    )
                  }
                  disabled={
                    downloading ===
                    `combined-${palmReadings[0].id}-${tarotReadings[0].id}`
                  }
                >

                  {downloading ===
                  `combined-${palmReadings[0].id}-${tarotReadings[0].id}`
                    ? "Generating..."
                    : "Download Combined PDF →"}

                </button>

              </div>

            </section>

          )}


        {/* =================================================
            DISCLAIMER
        ================================================= */}

        <section className="reports-disclaimer">

          <span>
            ✦
          </span>

          <p>
            Reports are intended for self-reflection
            and entertainment purposes only. They are
            not professional medical, financial, legal,
            or psychological advice.
          </p>

        </section>

      </main>
    </>
  );
}


export default Reports;