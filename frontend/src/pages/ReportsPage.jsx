import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router";

import {
  getReadingSession,
  getReadingSessions,
} from "../services/chatApi";

import {
  downloadMyAnalyticsCsv,
  downloadMyReadingHistoryCsv,
  downloadSavedReadingPdf,
} from "../services/reportsApi";

import "./ReportsPage.css";


// ============================================================
// HELPERS
// ============================================================

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


// ============================================================
// REPORTS PAGE
// ============================================================

function ReportsPage() {

  const [
    sessions,
    setSessions,
  ] = useState([]);


  const [
    selectedSession,
    setSelectedSession,
  ] = useState(null);


  const [
    selectedSessionId,
    setSelectedSessionId,
  ] = useState(null);


  const [
    isLoading,
    setIsLoading,
  ] = useState(true);


  const [
    isLoadingSession,
    setIsLoadingSession,
  ] = useState(false);


  const [
    activeDownload,
    setActiveDownload,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  // ==========================================================
  // OPEN SESSION
  // ==========================================================

  const openSession =
    async (
      sessionId
    ) => {

      if (!sessionId) {
        return;
      }


      setSelectedSessionId(
        Number(
          sessionId
        )
      );


      setIsLoadingSession(
        true
      );


      setError("");


      try {

        const response =
          await getReadingSession(
            sessionId
          );


        setSelectedSession(
          response
        );


      } catch (
        sessionError
      ) {

        console.error(
          "REPORT SESSION ERROR:",
          sessionError
        );


        setSelectedSession(
          null
        );


        setError(
          sessionError?.message ||
          "The selected reading could not be loaded."
        );


      } finally {

        setIsLoadingSession(
          false
        );

      }
    };


  // ==========================================================
  // LOAD SESSIONS
  // ==========================================================

  useEffect(() => {

    const loadReports =
      async () => {

        setIsLoading(
          true
        );


        setError("");


        try {

          const response =
            await getReadingSessions(
              100
            );


          const readingSessions =
            Array.isArray(
              response
            )
              ? response
              : [];


          setSessions(
            readingSessions
          );


          if (
            readingSessions.length > 0
          ) {

            await openSession(
              readingSessions[0].id
            );

          }


        } catch (
          loadError
        ) {

          console.error(
            "REPORTS LOAD ERROR:",
            loadError
          );


          setSessions([]);


          setError(
            loadError?.message ||
            "Reports could not be loaded."
          );


        } finally {

          setIsLoading(
            false
          );

        }
      };


    loadReports();

  }, []);


  // ==========================================================
  // DOWNLOAD PDF
  // ==========================================================

  const handleDownloadPdf =
    async () => {

      if (!selectedSession) {

        setError(
          "Please select a saved reading."
        );

        return;
      }


      setActiveDownload(
        "pdf"
      );


      setError("");

      setSuccessMessage("");


      try {

        await downloadSavedReadingPdf(
          selectedSession
        );


        setSuccessMessage(
          "Reading PDF downloaded successfully."
        );


      } catch (
        downloadError
      ) {

        console.error(
          "SAVED PDF ERROR:",
          downloadError
        );


        setError(
          downloadError?.message ||
          "The PDF could not be downloaded."
        );


      } finally {

        setActiveDownload("");

      }
    };


  // ==========================================================
  // DOWNLOAD ANALYTICS
  // ==========================================================

  const handleDownloadAnalytics =
    async () => {

      setActiveDownload(
        "analytics"
      );


      setError("");

      setSuccessMessage("");


      try {

        await downloadMyAnalyticsCsv();


        setSuccessMessage(
          "Analytics CSV downloaded successfully."
        );


      } catch (
        downloadError
      ) {

        console.error(
          "ANALYTICS CSV ERROR:",
          downloadError
        );


        setError(
          downloadError?.message ||
          "Analytics CSV could not be downloaded."
        );


      } finally {

        setActiveDownload("");

      }
    };


  // ==========================================================
  // DOWNLOAD HISTORY
  // ==========================================================

  const handleDownloadHistory =
    async () => {

      setActiveDownload(
        "history"
      );


      setError("");

      setSuccessMessage("");


      try {

        await downloadMyReadingHistoryCsv(
          100
        );


        setSuccessMessage(
          "Reading history CSV downloaded successfully."
        );


      } catch (
        downloadError
      ) {

        console.error(
          "HISTORY CSV ERROR:",
          downloadError
        );


        setError(
          downloadError?.message ||
          "Reading history CSV could not be downloaded."
        );


      } finally {

        setActiveDownload("");

      }
    };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="reports-page">

      {/* HEADER */}

      <div className="reports-header">

        <div>

          <p className="reports-eyebrow">
            REPORTS & EXPORTS
          </p>


          <h1>
            Reports
          </h1>


          <p className="reports-description">

            Download complete reading
            reports and export your
            personal reading analytics
            and history.

          </p>

        </div>


        <Link
          to="/reading"
          className="reports-reading-link"
        >
          Create New Reading
        </Link>

      </div>


      {/* NOTICE */}

      <div className="reports-notice">

        <strong>
          User-specific exports
        </strong>


        <p>

          Analytics and reading-history
          exports contain only data
          belonging to your authenticated
          account.

        </p>

      </div>


      {/* MESSAGES */}

      {error && (

        <div className="reports-error">

          <strong>
            Report action failed
          </strong>

          <p>
            {error}
          </p>

        </div>

      )}


      {successMessage && (

        <div className="reports-success">

          {successMessage}

        </div>

      )}


      {/* EXPORT CARDS */}

      <section className="reports-section">

        <p className="reports-eyebrow">
          DATA EXPORTS
        </p>


        <h2>
          My Platform Data
        </h2>


        <div className="reports-export-grid">

          <article className="reports-export-card">

            <h3>
              Analytics Summary
            </h3>


            <p>

              Export your reading counts,
              guidance-score average,
              reading categories, tarot
              spreads, palm-line statistics
              and tarot-card activity.

            </p>


            <button
              type="button"
              onClick={
                handleDownloadAnalytics
              }
              disabled={
                Boolean(
                  activeDownload
                )
              }
            >

              {
                activeDownload ===
                "analytics"
                  ? "Downloading..."
                  : "Download Analytics CSV"
              }

            </button>

          </article>


          <article className="reports-export-card">

            <h3>
              Reading History
            </h3>


            <p>

              Export your saved reading
              history including categories,
              spreads, palm results,
              tarot cards and overall
              insight scores.

            </p>


            <button
              type="button"
              onClick={
                handleDownloadHistory
              }
              disabled={
                Boolean(
                  activeDownload
                )
              }
            >

              {
                activeDownload ===
                "history"
                  ? "Downloading..."
                  : "Download History CSV"
              }

            </button>

          </article>

        </div>

      </section>


      {/* SAVED PDF */}

      <section className="reports-section">

        <p className="reports-eyebrow">
          READING REPORT
        </p>


        <h2>
          Complete Reading PDF
        </h2>


        <p className="reports-section-description">

          Select one of your saved reading
          sessions and generate its complete
          PDF report.

        </p>


        {
          isLoading
            ? (

              <div className="reports-empty">
                Loading saved readings...
              </div>

            )
            : sessions.length === 0
              ? (

                <div className="reports-empty">

                  <h3>
                    No saved readings yet
                  </h3>


                  <p>

                    Complete a Reading Studio
                    session before downloading
                    a report.

                  </p>


                  <Link to="/reading">
                    Create First Reading
                  </Link>

                </div>

              )
              : (

                <div className="reports-reading-layout">

                  {/* SESSION LIST */}

                  <aside className="reports-session-list">

                    {sessions.map(
                      (session) => {

                        const selected =
                          Number(
                            selectedSessionId
                          ) ===
                          Number(
                            session.id
                          );


                        return (
                          <button
                            type="button"
                            key={
                              session.id
                            }
                            className={
                              selected
                                ? "reports-session-button reports-session-selected"
                                : "reports-session-button"
                            }
                            onClick={
                              () =>
                                openSession(
                                  session.id
                                )
                            }
                          >

                            <span>
                              Session #{session.id}
                            </span>


                            <strong>
                              {
                                session.title ||
                                "Saved Reading"
                              }
                            </strong>


                            <p>
                              {
                                session.original_question ||
                                "No question available."
                              }
                            </p>


                            <small>
                              {
                                formatDate(
                                  session.created_at
                                )
                              }
                            </small>

                          </button>
                        );

                      }
                    )}

                  </aside>


                  {/* SELECTED REPORT */}

                  <article className="reports-selected-card">

                    {
                      isLoadingSession
                        ? (

                          <div className="reports-empty">
                            Loading reading...
                          </div>

                        )
                        : selectedSession
                          ? (

                            <>

                              <p className="reports-eyebrow">
                                SELECTED READING
                              </p>


                              <h3>
                                {
                                  selectedSession.title ||
                                  "Saved Reading"
                                }
                              </h3>


                              <div className="reports-meta">

                                <span>
                                  Category:{" "}
                                  {
                                    selectedSession.category ||
                                    "General"
                                  }
                                </span>


                                <span>
                                  Spread:{" "}
                                  {
                                    selectedSession.spread ||
                                    "N/A"
                                  }
                                </span>


                                <span>
                                  {
                                    formatDate(
                                      selectedSession.created_at
                                    )
                                  }
                                </span>

                              </div>


                              <div className="reports-question">

                                <strong>
                                  Original Question
                                </strong>


                                <p>
                                  {
                                    selectedSession
                                      .original_question ||
                                    "Question unavailable."
                                  }
                                </p>

                              </div>


                              <p className="reports-pdf-note">

                                The PDF contains the
                                user profile, reading
                                context, palm results,
                                drawn tarot cards and
                                images, AI interpretation,
                                personality intelligence,
                                recommendations, life
                                trends and guidance scores.

                              </p>


                              <button
                                type="button"
                                className="reports-pdf-button"
                                onClick={
                                  handleDownloadPdf
                                }
                                disabled={
                                  Boolean(
                                    activeDownload
                                  )
                                }
                              >

                                {
                                  activeDownload ===
                                  "pdf"
                                    ? "Preparing PDF..."
                                    : "Download Complete Reading PDF"
                                }

                              </button>

                            </>

                          )
                          : (

                            <div className="reports-empty">
                              Select a saved reading.
                            </div>

                          )
                    }

                  </article>

                </div>

              )
        }

      </section>


      <p className="reports-disclaimer">

        Reports are generated from saved
        prototype reading data. Palmistry
        and tarot content is intended for
        entertainment and personal
        reflection.

      </p>

    </div>
  );
}


export default ReportsPage;