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

import "./LifeTrendsPage.css";


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


function TrendCard({
  title,
  children,
}) {

  return (
    <article className="trends-card">

      <h3>
        {title}
      </h3>


      <div className="trends-card-content">

        {
          children ||
          (
            <p className="trends-muted">
              No information available.
            </p>
          )
        }

      </div>

    </article>
  );
}


function TrendList({
  items,
  emptyMessage =
    "No information available.",
}) {

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {

    return (
      <p className="trends-muted">
        {emptyMessage}
      </p>
    );

  }


  return (
    <ul className="trends-list">

      {items.map(
        (
          item,
          index
        ) => (

          <li
            key={
              `${String(item)}-${index}`
            }
          >
            {String(item)}
          </li>

        )
      )}

    </ul>
  );
}


// ============================================================
// LIFE TRENDS PAGE
// ============================================================

function LifeTrendsPage() {

  // ==========================================================
  // STATE
  // ==========================================================

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
    error,
    setError,
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
          "LIFE TRENDS SESSION ERROR:",
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
  // LOAD READINGS
  // ==========================================================

  const loadTrendReadings =
    async () => {

      setIsLoading(
        true
      );


      setError("");


      try {

        const response =
          await getReadingSessions(
            50
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

        } else {

          setSelectedSession(
            null
          );


          setSelectedSessionId(
            null
          );

        }


      } catch (
        loadError
      ) {

        console.error(
          "LIFE TRENDS LOAD ERROR:",
          loadError
        );


        setSessions([]);


        setSelectedSession(
          null
        );


        setError(
          loadError?.message ||
          "Life trends could not be loaded."
        );


      } finally {

        setIsLoading(
          false
        );

      }
    };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadTrendReadings();

  }, []);


  // ==========================================================
  // SAVED TREND DATA
  // ==========================================================

  const reading =
    selectedSession
      ?.initial_reading ||
    {};


  const trends =
    reading
      ?.trends ||
    null;


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="trends-page">

      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <div className="trends-header">

        <div>

          <p className="trends-eyebrow">
            LIFE TREND ANALYSIS
          </p>


          <h1>
            Life Trends
          </h1>


          <p className="trends-description">

            Review symbolic life themes,
            opportunities, challenges and
            recommended focus from your
            saved reading sessions.

          </p>

        </div>


        <Link
          to="/reading"
          className="trends-reading-link"
        >
          Create New Reading
        </Link>

      </div>


      {/* ==================================================== */}
      {/* NOTICE */}
      {/* ==================================================== */}

      <div className="trends-notice">

        <strong>
          Saved trend analysis
        </strong>


        <p>

          This page displays life-trend
          analysis already generated and
          stored during your complete
          reading sessions. Opening this
          page does not call Gemini again.

        </p>

      </div>


      {/* ==================================================== */}
      {/* ERROR */}
      {/* ==================================================== */}

      {error && (

        <div
          className="trends-error"
          role="alert"
        >

          <strong>
            Unable to load life trends
          </strong>


          <p>
            {error}
          </p>

        </div>

      )}


      {/* ==================================================== */}
      {/* INITIAL LOADING */}
      {/* ==================================================== */}

      {
        isLoading &&
        sessions.length === 0 && (

          <div className="trends-empty">

            <h3>
              Loading life trends...
            </h3>

          </div>

        )
      }


      {/* ==================================================== */}
      {/* NO READINGS */}
      {/* ==================================================== */}

      {
        !isLoading &&
        sessions.length === 0 &&
        !error && (

          <div className="trends-empty">

            <h3>
              No saved life trends yet
            </h3>


            <p>

              Generate a complete reading
              first. Your saved trend
              analysis will appear here.

            </p>


            <Link to="/reading">
              Create First Reading
            </Link>

          </div>

        )
      }


      {/* ==================================================== */}
      {/* MAIN LAYOUT */}
      {/* ==================================================== */}

      {sessions.length > 0 && (

        <div className="trends-layout">

          {/* ================================================= */}
          {/* SIDEBAR */}
          {/* ================================================= */}

          <aside className="trends-sidebar">

            <div className="trends-sidebar-header">

              <h2>
                My Readings
              </h2>


              <span>
                {sessions.length}
              </span>

            </div>


            <div className="trends-session-list">

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
                          ? "trends-session-button trends-session-selected"
                          : "trends-session-button"
                      }
                      onClick={
                        () =>
                          openSession(
                            session.id
                          )
                      }
                    >

                      <span className="trends-session-id">
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


                      <div className="trends-session-meta">

                        <span>
                          {
                            session.category ||
                            "General"
                          }
                        </span>


                        <span>
                          {
                            session.spread ||
                            "No spread"
                          }
                        </span>

                      </div>


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

            </div>

          </aside>


          {/* ================================================= */}
          {/* CONTENT */}
          {/* ================================================= */}

          <section className="trends-content">

            {isLoadingSession && (

              <div className="trends-empty">

                <h3>
                  Loading trend analysis...
                </h3>

              </div>

            )}


            {
              !isLoadingSession &&
              selectedSession && (

                <>

                  {/* ========================================= */}
                  {/* HEADER */}
                  {/* ========================================= */}

                  <div className="trends-session-header">

                    <div>

                      <p className="trends-eyebrow">

                        READING SESSION #
                        {
                          selectedSession.id
                        }

                      </p>


                      <h2>
                        {
                          selectedSession.title ||
                          "Saved Reading"
                        }
                      </h2>

                    </div>


                    <Link
                      to="/history"
                      className="trends-history-link"
                    >
                      Full Reading History
                    </Link>

                  </div>


                  {/* ========================================= */}
                  {/* META */}
                  {/* ========================================= */}

                  <div className="trends-meta-row">

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


                  {/* ========================================= */}
                  {/* QUESTION */}
                  {/* ========================================= */}

                  <section className="trends-section">

                    <p className="trends-eyebrow">
                      READING CONTEXT
                    </p>


                    <h2>
                      Original Question
                    </h2>


                    <TrendCard
                      title="Question"
                    >

                      <p>
                        {
                          selectedSession
                            .original_question ||
                          "Question unavailable."
                        }
                      </p>

                    </TrendCard>

                  </section>


                  {/* ========================================= */}
                  {/* NO TREND DATA */}
                  {/* ========================================= */}

                  {!trends && (

                    <div className="trends-empty">

                      <h3>
                        No life-trend analysis stored
                      </h3>


                      <p>

                        This reading session does
                        not contain saved life-trend
                        analysis data.

                      </p>

                    </div>

                  )}


                  {/* ========================================= */}
                  {/* TREND DATA */}
                  {/* ========================================= */}

                  {trends && (

                    <>

                      {/* ===================================== */}
                      {/* SUMMARY */}
                      {/* ===================================== */}

                      <section className="trends-section">

                        <p className="trends-eyebrow">
                          TREND SUMMARY
                        </p>


                        <h2>
                          Overall Life Theme
                        </h2>


                        <TrendCard
                          title="Trend Summary"
                        >

                          <p>
                            {
                              trends
                                .trend_summary
                            }
                          </p>

                        </TrendCard>


                        <TrendCard
                          title="Current Theme"
                        >

                          <p>
                            {
                              trends
                                .current_theme
                            }
                          </p>

                        </TrendCard>

                      </section>


                      {/* ===================================== */}
                      {/* TIME HORIZON */}
                      {/* ===================================== */}

                      <section className="trends-section">

                        <p className="trends-eyebrow">
                          TIME HORIZON
                        </p>


                        <h2>
                          Near-Term Trends
                        </h2>


                        <div className="trends-grid">

                          <TrendCard
                            title="Next 30 Days"
                          >

                            <p>
                              {
                                trends
                                  .next_30_days
                              }
                            </p>

                          </TrendCard>


                          <TrendCard
                            title="Next 3 Months"
                          >

                            <p>
                              {
                                trends
                                  .next_3_months
                              }
                            </p>

                          </TrendCard>

                        </div>

                      </section>


                      {/* ===================================== */}
                      {/* OPPORTUNITIES + CHALLENGES */}
                      {/* ===================================== */}

                      <section className="trends-section">

                        <p className="trends-eyebrow">
                          TREND FACTORS
                        </p>


                        <h2>
                          Opportunities & Challenges
                        </h2>


                        <div className="trends-grid">

                          <TrendCard
                            title="Opportunities"
                          >

                            <TrendList
                              items={
                                trends
                                  .opportunities
                              }
                              emptyMessage="No opportunities were stored."
                            />

                          </TrendCard>


                          <TrendCard
                            title="Challenges"
                          >

                            <TrendList
                              items={
                                trends
                                  .challenges
                              }
                              emptyMessage="No challenges were stored."
                            />

                          </TrendCard>

                        </div>

                      </section>


                      {/* ===================================== */}
                      {/* FOCUS */}
                      {/* ===================================== */}

                      <section className="trends-section">

                        <p className="trends-eyebrow">
                          RECOMMENDED DIRECTION
                        </p>


                        <h2>
                          Focus & Practical Actions
                        </h2>


                        <div className="trends-grid">

                          <TrendCard
                            title="Recommended Focus"
                          >

                            <TrendList
                              items={
                                trends
                                  .recommended_focus
                              }
                              emptyMessage="No recommended focus was stored."
                            />

                          </TrendCard>


                          <TrendCard
                            title="Practical Actions"
                          >

                            <TrendList
                              items={
                                trends
                                  .practical_actions
                              }
                              emptyMessage="No practical actions were stored."
                            />

                          </TrendCard>

                        </div>

                      </section>


                      {/* ===================================== */}
                      {/* DISCLAIMER */}
                      {/* ===================================== */}

                      <p className="trends-disclaimer">

                        {
                          trends
                            .disclaimer ||
                          (
                            "Life-trend analysis is symbolic "
                            + "and intended for entertainment "
                            + "and personal reflection. It does "
                            + "not predict guaranteed future events."
                          )
                        }

                      </p>

                    </>

                  )}

                </>

              )
            }

          </section>

        </div>

      )}

    </div>
  );
}


export default LifeTrendsPage;