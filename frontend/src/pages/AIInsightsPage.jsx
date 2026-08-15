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

import "./AIInsightsPage.css";


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


function InsightCard({
  title,
  children,
}) {

  return (
    <article className="insights-card">

      <h3>
        {title}
      </h3>

      <div className="insights-card-content">

        {
          children ||
          (
            <p className="insights-muted">
              No information available.
            </p>
          )
        }

      </div>

    </article>
  );
}


function InsightList({
  items,
  emptyMessage =
    "No information available.",
}) {

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {

    return (
      <p className="insights-muted">
        {emptyMessage}
      </p>
    );

  }


  return (
    <ul className="insights-list">

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
// AI INSIGHTS PAGE
// ============================================================

function AIInsightsPage() {

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
          "AI INSIGHT SESSION ERROR:",
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

  const loadInsights =
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
          "AI INSIGHTS LOAD ERROR:",
          loadError
        );


        setSessions([]);

        setSelectedSession(
          null
        );


        setError(
          loadError?.message ||
          "AI insights could not be loaded."
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

    loadInsights();

  }, []);


  // ==========================================================
  // READING DATA
  // ==========================================================

  const reading =
    selectedSession
      ?.initial_reading ||
    {};


  const interpretation =
    reading
      ?.interpretation ||
    null;


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="insights-page">

      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <div className="insights-header">

        <div>

          <p className="insights-eyebrow">
            AI INTERPRETATION
          </p>


          <h1>
            AI Insights
          </h1>


          <p className="insights-description">

            Review AI-generated insights
            from your saved palm and
            tarot reading sessions.

          </p>

        </div>


        <Link
          to="/reading"
          className="insights-reading-link"
        >
          Create New Reading
        </Link>

      </div>


      {/* ==================================================== */}
      {/* INFO NOTICE */}
      {/* ==================================================== */}

      <div className="insights-notice">

        <strong>
          Saved reading intelligence
        </strong>


        <p>

          This page uses interpretations
          already generated and stored
          during your complete reading
          sessions. Opening this page does
          not call Gemini again.

        </p>

      </div>


      {/* ==================================================== */}
      {/* ERROR */}
      {/* ==================================================== */}

      {error && (

        <div
          className="insights-error"
          role="alert"
        >

          <strong>
            Unable to load insights
          </strong>

          <p>
            {error}
          </p>

        </div>

      )}


      {/* ==================================================== */}
      {/* LOADING */}
      {/* ==================================================== */}

      {
        isLoading &&
        sessions.length === 0 && (

          <div className="insights-empty">

            <h3>
              Loading AI insights...
            </h3>

          </div>

        )
      }


      {/* ==================================================== */}
      {/* EMPTY */}
      {/* ==================================================== */}

      {
        !isLoading &&
        sessions.length === 0 &&
        !error && (

          <div className="insights-empty">

            <h3>
              No saved insights yet
            </h3>


            <p>

              Generate a complete reading
              first. Your AI interpretation
              will automatically appear here.

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

        <div className="insights-layout">

          {/* ================================================= */}
          {/* LEFT SIDEBAR */}
          {/* ================================================= */}

          <aside className="insights-sidebar">

            <div className="insights-sidebar-header">

              <h2>
                My Readings
              </h2>

              <span>
                {sessions.length}
              </span>

            </div>


            <div className="insights-session-list">

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
                          ? "insights-session-button insights-session-selected"
                          : "insights-session-button"
                      }
                      onClick={
                        () =>
                          openSession(
                            session.id
                          )
                      }
                    >

                      <span className="insights-session-id">
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


                      <div className="insights-session-meta">

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
          {/* RIGHT CONTENT */}
          {/* ================================================= */}

          <section className="insights-content">

            {isLoadingSession && (

              <div className="insights-empty">

                <h3>
                  Loading reading insights...
                </h3>

              </div>

            )}


            {
              !isLoadingSession &&
              selectedSession && (

                <>

                  {/* ========================================= */}
                  {/* SESSION HEADER */}
                  {/* ========================================= */}

                  <div className="insights-session-header">

                    <div>

                      <p className="insights-eyebrow">

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
                      className="insights-history-link"
                    >
                      Full Reading History
                    </Link>

                  </div>


                  <div className="insights-meta-row">

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

                  <section className="insights-section">

                    <p className="insights-eyebrow">
                      READING CONTEXT
                    </p>


                    <h2>
                      Original Question
                    </h2>


                    <InsightCard
                      title="Question"
                    >

                      <p>
                        {
                          selectedSession
                            .original_question ||
                          "Question unavailable."
                        }
                      </p>

                    </InsightCard>

                  </section>


                  {/* ========================================= */}
                  {/* NO INTERPRETATION */}
                  {/* ========================================= */}

                  {!interpretation && (

                    <div className="insights-empty">

                      <h3>
                        No AI interpretation stored
                      </h3>


                      <p>

                        This reading session does
                        not contain saved AI
                        interpretation data.

                      </p>

                    </div>

                  )}


                  {/* ========================================= */}
                  {/* INTERPRETATION */}
                  {/* ========================================= */}

                  {interpretation && (

                    <>

                      <section className="insights-section">

                        <p className="insights-eyebrow">
                          AI SUMMARY
                        </p>


                        <h2>
                          Overall Insight
                        </h2>


                        <InsightCard
                          title="Overall Summary"
                        >

                          <p>
                            {
                              interpretation
                                .overall_summary
                            }
                          </p>

                        </InsightCard>

                      </section>


                      {/* ===================================== */}
                      {/* PALM + TAROT */}
                      {/* ===================================== */}

                      <section className="insights-section">

                        <p className="insights-eyebrow">
                          SYMBOLIC INTERPRETATION
                        </p>


                        <h2>
                          Palm & Tarot
                        </h2>


                        <div className="insights-grid">

                          <InsightCard
                            title="Palm Interpretation"
                          >

                            <p>
                              {
                                interpretation
                                  .palm_interpretation
                              }
                            </p>

                          </InsightCard>


                          <InsightCard
                            title="Tarot Interpretation"
                          >

                            <p>
                              {
                                interpretation
                                  .tarot_interpretation
                              }
                            </p>

                          </InsightCard>

                        </div>


                        <InsightCard
                          title="Combined Interpretation"
                        >

                          <p>
                            {
                              interpretation
                                .combined_interpretation
                            }
                          </p>

                        </InsightCard>

                      </section>


                      {/* ===================================== */}
                      {/* STRENGTHS */}
                      {/* ===================================== */}

                      <section className="insights-section">

                        <p className="insights-eyebrow">
                          PERSONAL INSIGHT
                        </p>


                        <h2>
                          Strengths & Growth
                        </h2>


                        <div className="insights-grid">

                          <InsightCard
                            title="Key Strengths"
                          >

                            <InsightList
                              items={
                                interpretation
                                  .key_strengths
                              }
                              emptyMessage="No key strengths were stored."
                            />

                          </InsightCard>


                          <InsightCard
                            title="Growth Areas"
                          >

                            <InsightList
                              items={
                                interpretation
                                  .growth_areas
                              }
                              emptyMessage="No growth areas were stored."
                            />

                          </InsightCard>

                        </div>

                      </section>


                      {/* ===================================== */}
                      {/* GUIDANCE */}
                      {/* ===================================== */}

                      <section className="insights-section">

                        <p className="insights-eyebrow">
                          GUIDANCE
                        </p>


                        <h2>
                          Focus & Reflection
                        </h2>


                        <div className="insights-grid">

                          <InsightCard
                            title="Current Focus"
                          >

                            <p>
                              {
                                interpretation
                                  .current_focus
                              }
                            </p>

                          </InsightCard>


                          <InsightCard
                            title="Key Message"
                          >

                            <p>
                              {
                                interpretation
                                  .key_message
                              }
                            </p>

                          </InsightCard>

                        </div>


                        <InsightCard
                          title="Reflection Question"
                        >

                          <p>
                            {
                              interpretation
                                .reflection_question
                            }
                          </p>

                        </InsightCard>

                      </section>


                      {/* ===================================== */}
                      {/* DISCLAIMER */}
                      {/* ===================================== */}

                      <p className="insights-disclaimer">

                        {
                          interpretation
                            .disclaimer ||
                          "AI-generated insights are intended for entertainment and personal reflection only."
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


export default AIInsightsPage;