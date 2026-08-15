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

import "./RecommendationsPage.css";


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


function RecommendationCard({
  title,
  children,
}) {

  return (
    <article className="recommendations-card">

      <h3>
        {title}
      </h3>


      <div className="recommendations-card-content">

        {
          children ||
          (
            <p className="recommendations-muted">
              No information available.
            </p>
          )
        }

      </div>

    </article>
  );
}


function RecommendationList({
  items,
  emptyMessage =
    "No information available.",
}) {

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {

    return (
      <p className="recommendations-muted">
        {emptyMessage}
      </p>
    );

  }


  return (
    <ul className="recommendations-list">

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
// RECOMMENDATIONS PAGE
// ============================================================

function RecommendationsPage() {

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
          "RECOMMENDATIONS SESSION ERROR:",
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
  // LOAD SAVED READINGS
  // ==========================================================

  const loadRecommendationReadings =
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
          "RECOMMENDATIONS LOAD ERROR:",
          loadError
        );


        setSessions([]);


        setSelectedSession(
          null
        );


        setError(
          loadError?.message ||
          "Recommendations could not be loaded."
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

    loadRecommendationReadings();

  }, []);


  // ==========================================================
  // SAVED RECOMMENDATIONS
  // ==========================================================

  const reading =
    selectedSession
      ?.initial_reading ||
    {};


  const recommendations =
    reading
      ?.recommendations ||
    null;


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="recommendations-page">

      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <div className="recommendations-header">

        <div>

          <p className="recommendations-eyebrow">
            RECOMMENDATION ENGINE
          </p>


          <h1>
            Recommendations
          </h1>


          <p className="recommendations-description">

            Review personalized recommendations
            generated from your saved reading
            sessions.

          </p>

        </div>


        <Link
          to="/reading"
          className="recommendations-reading-link"
        >
          Create New Reading
        </Link>

      </div>


      {/* ==================================================== */}
      {/* NOTICE */}
      {/* ==================================================== */}

      <div className="recommendations-notice">

        <strong>
          Saved personalized recommendations
        </strong>


        <p>

          This page displays recommendations
          already generated and stored during
          your complete reading sessions.
          Opening this page does not call
          Gemini again.

        </p>

      </div>


      {/* ==================================================== */}
      {/* ERROR */}
      {/* ==================================================== */}

      {error && (

        <div
          className="recommendations-error"
          role="alert"
        >

          <strong>
            Unable to load recommendations
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

          <div className="recommendations-empty">

            <h3>
              Loading recommendations...
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

          <div className="recommendations-empty">

            <h3>
              No saved recommendations yet
            </h3>


            <p>

              Generate a complete reading
              first. Your personalized
              recommendations will appear here.

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

        <div className="recommendations-layout">

          {/* ================================================= */}
          {/* SIDEBAR */}
          {/* ================================================= */}

          <aside className="recommendations-sidebar">

            <div className="recommendations-sidebar-header">

              <h2>
                My Readings
              </h2>


              <span>
                {sessions.length}
              </span>

            </div>


            <div className="recommendations-session-list">

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
                          ? "recommendations-session-button recommendations-session-selected"
                          : "recommendations-session-button"
                      }
                      onClick={
                        () =>
                          openSession(
                            session.id
                          )
                      }
                    >

                      <span className="recommendations-session-id">
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


                      <div className="recommendations-session-meta">

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

          <section className="recommendations-content">

            {isLoadingSession && (

              <div className="recommendations-empty">

                <h3>
                  Loading recommendations...
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

                  <div className="recommendations-session-header">

                    <div>

                      <p className="recommendations-eyebrow">

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
                      className="recommendations-history-link"
                    >
                      Full Reading History
                    </Link>

                  </div>


                  {/* ========================================= */}
                  {/* META */}
                  {/* ========================================= */}

                  <div className="recommendations-meta-row">

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

                  <section className="recommendations-section">

                    <p className="recommendations-eyebrow">
                      READING CONTEXT
                    </p>


                    <h2>
                      Original Question
                    </h2>


                    <RecommendationCard
                      title="Question"
                    >

                      <p>
                        {
                          selectedSession
                            .original_question ||
                          "Question unavailable."
                        }
                      </p>

                    </RecommendationCard>

                  </section>


                  {/* ========================================= */}
                  {/* NO RECOMMENDATIONS */}
                  {/* ========================================= */}

                  {!recommendations && (

                    <div className="recommendations-empty">

                      <h3>
                        No recommendations stored
                      </h3>


                      <p>

                        This reading session does
                        not contain saved
                        recommendation data.

                      </p>

                    </div>

                  )}


                  {/* ========================================= */}
                  {/* RECOMMENDATION DATA */}
                  {/* ========================================= */}

                  {recommendations && (

                    <>

                      {/* ===================================== */}
                      {/* SUMMARY */}
                      {/* ===================================== */}

                      <section className="recommendations-section">

                        <p className="recommendations-eyebrow">
                          RECOMMENDATION SUMMARY
                        </p>


                        <h2>
                          Personalized Direction
                        </h2>


                        <RecommendationCard
                          title="Recommendation Summary"
                        >

                          <p>
                            {
                              recommendations
                                .recommendation_summary
                            }
                          </p>

                        </RecommendationCard>

                      </section>


                      {/* ===================================== */}
                      {/* GROWTH + CAREER */}
                      {/* ===================================== */}

                      <section className="recommendations-section">

                        <p className="recommendations-eyebrow">
                          PERSONAL DEVELOPMENT
                        </p>


                        <h2>
                          Growth & Career
                        </h2>


                        <div className="recommendations-grid">

                          <RecommendationCard
                            title="Personal Growth"
                          >

                            <RecommendationList
                              items={
                                recommendations
                                  .personal_growth
                              }
                              emptyMessage="No personal-growth recommendations were stored."
                            />

                          </RecommendationCard>


                          <RecommendationCard
                            title="Career"
                          >

                            <RecommendationList
                              items={
                                recommendations
                                  .career
                              }
                              emptyMessage="No career recommendations were stored."
                            />

                          </RecommendationCard>

                        </div>

                      </section>


                      {/* ===================================== */}
                      {/* RELATIONSHIPS + GOALS */}
                      {/* ===================================== */}

                      <section className="recommendations-section">

                        <p className="recommendations-eyebrow">
                          LIFE ALIGNMENT
                        </p>


                        <h2>
                          Relationships & Goals
                        </h2>


                        <div className="recommendations-grid">

                          <RecommendationCard
                            title="Relationships"
                          >

                            <RecommendationList
                              items={
                                recommendations
                                  .relationships
                              }
                              emptyMessage="No relationship recommendations were stored."
                            />

                          </RecommendationCard>


                          <RecommendationCard
                            title="Goal Alignment"
                          >

                            <RecommendationList
                              items={
                                recommendations
                                  .goal_alignment
                              }
                              emptyMessage="No goal-alignment recommendations were stored."
                            />

                          </RecommendationCard>

                        </div>

                      </section>


                      {/* ===================================== */}
                      {/* SPIRITUAL */}
                      {/* ===================================== */}

                      <section className="recommendations-section">

                        <p className="recommendations-eyebrow">
                          SPIRITUAL DEVELOPMENT
                        </p>


                        <h2>
                          Reflective Growth
                        </h2>


                        <RecommendationCard
                          title="Spiritual Development"
                        >

                          <RecommendationList
                            items={
                              recommendations
                                .spiritual_development
                            }
                            emptyMessage="No spiritual-development recommendations were stored."
                          />

                        </RecommendationCard>

                      </section>


                      {/* ===================================== */}
                      {/* ACTIONS */}
                      {/* ===================================== */}

                      <section className="recommendations-section">

                        <p className="recommendations-eyebrow">
                          ACTION PLAN
                        </p>


                        <h2>
                          Immediate & Long-Term Actions
                        </h2>


                        <div className="recommendations-grid">

                          <RecommendationCard
                            title="Immediate Actions"
                          >

                            <RecommendationList
                              items={
                                recommendations
                                  .immediate_actions
                              }
                              emptyMessage="No immediate actions were stored."
                            />

                          </RecommendationCard>


                          <RecommendationCard
                            title="Long-Term Actions"
                          >

                            <RecommendationList
                              items={
                                recommendations
                                  .long_term_actions
                              }
                              emptyMessage="No long-term actions were stored."
                            />

                          </RecommendationCard>

                        </div>

                      </section>


                      {/* ===================================== */}
                      {/* DISCLAIMER */}
                      {/* ===================================== */}

                      <p className="recommendations-disclaimer">

                        Recommendations are
                        AI-generated and symbolic.
                        They are intended for
                        entertainment and personal
                        reflection and should not
                        be treated as professional,
                        medical, legal, financial
                        or psychological advice.

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


export default RecommendationsPage;