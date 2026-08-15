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

import "./GuidanceScoresPage.css";


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


function normalizeScore(
  value
) {

  const numeric =
    Number(value);

  if (
    !Number.isFinite(
      numeric
    )
  ) {

    return 0;

  }

  return Math.min(
    100,
    Math.max(
      0,
      numeric
    )
  );
}


function ScoreCard({
  title,
  value,
}) {

  const score =
    normalizeScore(
      value
    );

  return (
    <article className="guidance-score-card">

      <div className="guidance-score-card-header">

        <h3>
          {title}
        </h3>

        <strong>
          {score.toFixed(2)}
          {" "}
          / 100
        </strong>

      </div>


      <div className="guidance-progress-track">

        <div
          className="guidance-progress-fill"
          style={{
            width:
              `${score}%`,
          }}
        />

      </div>

    </article>
  );
}


function GuidanceCard({
  title,
  children,
}) {

  return (
    <article className="guidance-card">

      <h3>
        {title}
      </h3>


      <div className="guidance-card-content">

        {
          children ||
          (
            <p className="guidance-muted">
              No information available.
            </p>
          )
        }

      </div>

    </article>
  );
}


// ============================================================
// GUIDANCE SCORES PAGE
// ============================================================

function GuidanceScoresPage() {

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
          "GUIDANCE SESSION ERROR:",
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

  const loadGuidanceReadings =
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
          "GUIDANCE LOAD ERROR:",
          loadError
        );


        setSessions([]);


        setSelectedSession(
          null
        );


        setError(
          loadError?.message ||
          "Guidance scores could not be loaded."
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

    loadGuidanceReadings();

  }, []);


  // ==========================================================
  // SAVED SCORE DATA
  // ==========================================================

  const scores =
    selectedSession
      ?.scores ||
    null;


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="guidance-page">

      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <div className="guidance-header">

        <div>

          <p className="guidance-eyebrow">
            SPIRITUAL GUIDANCE SCORING
          </p>


          <h1>
            Guidance Scores
          </h1>


          <p className="guidance-description">

            Review the saved relevance,
            alignment, consistency and
            overall insight scores from
            your completed reading sessions.

          </p>

        </div>


        <Link
          to="/reading"
          className="guidance-reading-link"
        >
          Create New Reading
        </Link>

      </div>


      {/* ==================================================== */}
      {/* NOTICE */}
      {/* ==================================================== */}

      <div className="guidance-notice">

        <strong>
          Saved scoring results
        </strong>


        <p>

          These values are calculated and
          stored during the complete reading
          workflow. Opening this page does
          not call Gemini again.

        </p>

      </div>


      {/* ==================================================== */}
      {/* ERROR */}
      {/* ==================================================== */}

      {error && (

        <div
          className="guidance-error"
          role="alert"
        >

          <strong>
            Unable to load guidance scores
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

          <div className="guidance-empty">

            <h3>
              Loading guidance scores...
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

          <div className="guidance-empty">

            <h3>
              No saved guidance scores yet
            </h3>


            <p>

              Generate a complete reading
              first. Its guidance scores
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

        <div className="guidance-layout">

          {/* ================================================= */}
          {/* SIDEBAR */}
          {/* ================================================= */}

          <aside className="guidance-sidebar">

            <div className="guidance-sidebar-header">

              <h2>
                My Readings
              </h2>


              <span>
                {sessions.length}
              </span>

            </div>


            <div className="guidance-session-list">

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
                          ? "guidance-session-button guidance-session-selected"
                          : "guidance-session-button"
                      }
                      onClick={
                        () =>
                          openSession(
                            session.id
                          )
                      }
                    >

                      <span className="guidance-session-id">
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


                      <div className="guidance-session-meta">

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

          <section className="guidance-content">

            {isLoadingSession && (

              <div className="guidance-empty">

                <h3>
                  Loading score details...
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

                  <div className="guidance-session-header">

                    <div>

                      <p className="guidance-eyebrow">

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
                      className="guidance-history-link"
                    >
                      Full Reading History
                    </Link>

                  </div>


                  {/* ========================================= */}
                  {/* META */}
                  {/* ========================================= */}

                  <div className="guidance-meta-row">

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

                  <section className="guidance-section">

                    <p className="guidance-eyebrow">
                      READING CONTEXT
                    </p>


                    <h2>
                      Original Question
                    </h2>


                    <GuidanceCard
                      title="Question"
                    >

                      <p>
                        {
                          selectedSession
                            .original_question ||
                          "Question unavailable."
                        }
                      </p>

                    </GuidanceCard>

                  </section>


                  {/* ========================================= */}
                  {/* NO SCORE DATA */}
                  {/* ========================================= */}

                  {!scores && (

                    <div className="guidance-empty">

                      <h3>
                        No guidance scores stored
                      </h3>


                      <p>

                        This reading session does
                        not contain saved guidance
                        score data.

                      </p>

                    </div>

                  )}


                  {/* ========================================= */}
                  {/* SCORE DATA */}
                  {/* ========================================= */}

                  {scores && (

                    <>

                      {/* ===================================== */}
                      {/* OVERALL */}
                      {/* ===================================== */}

                      <section className="guidance-section">

                        <p className="guidance-eyebrow">
                          OVERALL SCORE
                        </p>


                        <h2>
                          Overall Insight
                        </h2>


                        <article className="guidance-overall-card">

                          <div>

                            <p className="guidance-overall-label">
                              Overall Insight Score
                            </p>


                            <strong className="guidance-overall-number">

                              {
                                normalizeScore(
                                  scores
                                    .overall_insight_score
                                )
                                  .toFixed(
                                    2
                                  )
                              }

                              <span>
                                / 100
                              </span>

                            </strong>

                          </div>


                          <div className="guidance-score-label">

                            {
                              scores
                                .score_label ||
                              "No score label"
                            }

                          </div>

                        </article>

                      </section>


                      {/* ===================================== */}
                      {/* SCORE COMPONENTS */}
                      {/* ===================================== */}

                      <section className="guidance-section">

                        <p className="guidance-eyebrow">
                          SCORE COMPONENTS
                        </p>


                        <h2>
                          Guidance Score Breakdown
                        </h2>


                        <div className="guidance-score-grid">

                          <ScoreCard
                            title="Palm Analysis Confidence"
                            value={
                              scores
                                .palm_analysis_confidence
                            }
                          />


                          <ScoreCard
                            title="Tarot Interpretation Relevance"
                            value={
                              scores
                                .tarot_interpretation_relevance
                            }
                          />


                          <ScoreCard
                            title="Personality Alignment"
                            value={
                              scores
                                .personality_alignment
                            }
                          />


                          <ScoreCard
                            title="User-Context Relevance"
                            value={
                              scores
                                .user_context_relevance
                            }
                          />


                          <ScoreCard
                            title="Reading Consistency"
                            value={
                              scores
                                .reading_consistency
                            }
                          />

                        </div>

                      </section>


                      {/* ===================================== */}
                      {/* CALCULATION */}
                      {/* ===================================== */}

                      <section className="guidance-section">

                        <p className="guidance-eyebrow">
                          SCORING METHOD
                        </p>


                        <h2>
                          Calculation Method
                        </h2>


                        <GuidanceCard
                          title="How the score is calculated"
                        >

                          <p>
                            {
                              scores
                                .calculation_method ||
                              "No calculation method was stored."
                            }
                          </p>

                        </GuidanceCard>

                      </section>


                      {/* ===================================== */}
                      {/* DISCLAIMER */}
                      {/* ===================================== */}

                      <p className="guidance-disclaimer">

                        {
                          scores
                            .disclaimer ||
                          (
                            "Guidance scores measure prototype "
                            + "completeness, relevance and consistency. "
                            + "They do not represent scientific accuracy."
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


export default GuidanceScoresPage;