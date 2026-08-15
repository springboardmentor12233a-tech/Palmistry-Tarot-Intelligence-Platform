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

import "./PersonalityPage.css";


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


function PersonalityCard({
  title,
  children,
}) {

  return (
    <article className="personality-card">

      <h3>
        {title}
      </h3>


      <div className="personality-card-content">

        {
          children ||
          (
            <p className="personality-muted">
              No information available.
            </p>
          )
        }

      </div>

    </article>
  );
}


function PersonalityList({
  items,
  emptyMessage =
    "No information available.",
}) {

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {

    return (
      <p className="personality-muted">
        {emptyMessage}
      </p>
    );

  }


  return (
    <ul className="personality-list">

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
// PERSONALITY PAGE
// ============================================================

function PersonalityPage() {

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
          "PERSONALITY SESSION ERROR:",
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

  const loadPersonalityReadings =
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
          "PERSONALITY LOAD ERROR:",
          loadError
        );


        setSessions([]);


        setSelectedSession(
          null
        );


        setError(
          loadError?.message ||
          "Personality intelligence could not be loaded."
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

    loadPersonalityReadings();

  }, []);


  // ==========================================================
  // SAVED PERSONALITY DATA
  // ==========================================================

  const reading =
    selectedSession
      ?.initial_reading ||
    {};


  const personality =
    reading
      ?.personality ||
    null;


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="personality-page">

      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <div className="personality-header">

        <div>

          <p className="personality-eyebrow">
            PERSONALITY INTELLIGENCE
          </p>


          <h1>
            Personality Intelligence
          </h1>


          <p className="personality-description">

            Review the symbolic personality
            intelligence generated from your
            saved palm and tarot reading
            sessions.

          </p>

        </div>


        <Link
          to="/reading"
          className="personality-reading-link"
        >
          Create New Reading
        </Link>

      </div>


      {/* ==================================================== */}
      {/* INFORMATION NOTICE */}
      {/* ==================================================== */}

      <div className="personality-notice">

        <strong>
          Saved personality intelligence
        </strong>


        <p>

          This page displays personality
          intelligence that was already
          generated and stored during your
          complete reading. Opening this
          page does not call Gemini again.

        </p>

      </div>


      {/* ==================================================== */}
      {/* ERROR */}
      {/* ==================================================== */}

      {error && (

        <div
          className="personality-error"
          role="alert"
        >

          <strong>
            Unable to load personality intelligence
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

          <div className="personality-empty">

            <h3>
              Loading personality intelligence...
            </h3>

          </div>

        )
      }


      {/* ==================================================== */}
      {/* NO SAVED READINGS */}
      {/* ==================================================== */}

      {
        !isLoading &&
        sessions.length === 0 &&
        !error && (

          <div className="personality-empty">

            <h3>
              No saved personality readings yet
            </h3>


            <p>

              Generate a complete reading
              first. Your personality
              intelligence will automatically
              appear here.

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

        <div className="personality-layout">

          {/* ================================================= */}
          {/* LEFT READING LIST */}
          {/* ================================================= */}

          <aside className="personality-sidebar">

            <div className="personality-sidebar-header">

              <h2>
                My Readings
              </h2>


              <span>
                {sessions.length}
              </span>

            </div>


            <div className="personality-session-list">

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
                          ? "personality-session-button personality-session-selected"
                          : "personality-session-button"
                      }
                      onClick={
                        () =>
                          openSession(
                            session.id
                          )
                      }
                    >

                      <span className="personality-session-id">
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


                      <div className="personality-session-meta">

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

          <section className="personality-content">

            {isLoadingSession && (

              <div className="personality-empty">

                <h3>
                  Loading personality profile...
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

                  <div className="personality-session-header">

                    <div>

                      <p className="personality-eyebrow">

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
                      className="personality-history-link"
                    >
                      Full Reading History
                    </Link>

                  </div>


                  {/* ========================================= */}
                  {/* SESSION META */}
                  {/* ========================================= */}

                  <div className="personality-meta-row">

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
                  {/* ORIGINAL QUESTION */}
                  {/* ========================================= */}

                  <section className="personality-section">

                    <p className="personality-eyebrow">
                      READING CONTEXT
                    </p>


                    <h2>
                      Original Question
                    </h2>


                    <PersonalityCard
                      title="Question"
                    >

                      <p>
                        {
                          selectedSession
                            .original_question ||
                          "Question unavailable."
                        }
                      </p>

                    </PersonalityCard>

                  </section>


                  {/* ========================================= */}
                  {/* NO PERSONALITY DATA */}
                  {/* ========================================= */}

                  {!personality && (

                    <div className="personality-empty">

                      <h3>
                        No personality intelligence stored
                      </h3>


                      <p>

                        This reading session does
                        not contain saved personality
                        intelligence data.

                      </p>

                    </div>

                  )}


                  {/* ========================================= */}
                  {/* PERSONALITY DATA */}
                  {/* ========================================= */}

                  {personality && (

                    <>

                      {/* ===================================== */}
                      {/* SUMMARY */}
                      {/* ===================================== */}

                      <section className="personality-section">

                        <p className="personality-eyebrow">
                          PERSONALITY SUMMARY
                        </p>


                        <h2>
                          Symbolic Personality Profile
                        </h2>


                        <PersonalityCard
                          title="Personality Summary"
                        >

                          <p>
                            {
                              personality
                                .personality_summary
                            }
                          </p>

                        </PersonalityCard>

                      </section>


                      {/* ===================================== */}
                      {/* DOMINANT TRAITS */}
                      {/* ===================================== */}

                      <section className="personality-section">

                        <p className="personality-eyebrow">
                          CORE TRAITS
                        </p>


                        <h2>
                          Dominant Traits
                        </h2>


                        <PersonalityCard
                          title="Dominant Traits"
                        >

                          <PersonalityList
                            items={
                              personality
                                .dominant_traits
                            }
                            emptyMessage="No dominant traits were stored."
                          />

                        </PersonalityCard>

                      </section>


                      {/* ===================================== */}
                      {/* EMOTIONAL + THINKING */}
                      {/* ===================================== */}

                      <section className="personality-section">

                        <p className="personality-eyebrow">
                          PERSONAL STYLE
                        </p>


                        <h2>
                          Emotional & Thinking Style
                        </h2>


                        <div className="personality-grid">

                          <PersonalityCard
                            title="Emotional Style"
                          >

                            <p>
                              {
                                personality
                                  .emotional_style
                              }
                            </p>

                          </PersonalityCard>


                          <PersonalityCard
                            title="Thinking Style"
                          >

                            <p>
                              {
                                personality
                                  .thinking_style
                              }
                            </p>

                          </PersonalityCard>

                        </div>

                      </section>


                      {/* ===================================== */}
                      {/* DECISION + RELATIONSHIP */}
                      {/* ===================================== */}

                      <section className="personality-section">

                        <p className="personality-eyebrow">
                          BEHAVIOURAL STYLE
                        </p>


                        <h2>
                          Decisions & Relationships
                        </h2>


                        <div className="personality-grid">

                          <PersonalityCard
                            title="Decision Style"
                          >

                            <p>
                              {
                                personality
                                  .decision_style
                              }
                            </p>

                          </PersonalityCard>


                          <PersonalityCard
                            title="Relationship Style"
                          >

                            <p>
                              {
                                personality
                                  .relationship_style
                              }
                            </p>

                          </PersonalityCard>

                        </div>

                      </section>


                      {/* ===================================== */}
                      {/* STRENGTHS + DEVELOPMENT */}
                      {/* ===================================== */}

                      <section className="personality-section">

                        <p className="personality-eyebrow">
                          DEVELOPMENT
                        </p>


                        <h2>
                          Strengths & Development Areas
                        </h2>


                        <div className="personality-grid">

                          <PersonalityCard
                            title="Strengths"
                          >

                            <PersonalityList
                              items={
                                personality
                                  .strengths
                              }
                              emptyMessage="No strengths were stored."
                            />

                          </PersonalityCard>


                          <PersonalityCard
                            title="Development Areas"
                          >

                            <PersonalityList
                              items={
                                personality
                                  .development_areas
                              }
                              emptyMessage="No development areas were stored."
                            />

                          </PersonalityCard>

                        </div>

                      </section>


                      {/* ===================================== */}
                      {/* GROWTH ADVICE */}
                      {/* ===================================== */}

                      <section className="personality-section">

                        <p className="personality-eyebrow">
                          PERSONAL GROWTH
                        </p>


                        <h2>
                          Growth Advice
                        </h2>


                        <PersonalityCard
                          title="Recommended Growth Actions"
                        >

                          <PersonalityList
                            items={
                              personality
                                .growth_advice
                            }
                            emptyMessage="No growth advice was stored."
                          />

                        </PersonalityCard>

                      </section>


                      {/* ===================================== */}
                      {/* DISCLAIMER */}
                      {/* ===================================== */}

                      <p className="personality-disclaimer">

                        Personality intelligence
                        in this platform is symbolic
                        and AI-generated. It is
                        intended for entertainment,
                        personal reflection and
                        software-demonstration
                        purposes and should not be
                        treated as a psychological
                        diagnosis.

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


export default PersonalityPage;