import {
  useEffect,
  useState,
} from "react";

import {
  getReadingSession,
  getReadingSessions,
} from "../services/chatApi";

import ReadingChat from
  "../components/ReadingChat";

import "./ReadingHistoryPage.css";


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


function SafeList({
  items,
  emptyMessage =
    "No information available.",
}) {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return (
      <p className="history-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="history-list">

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


function InfoCard({
  title,
  children,
}) {
  return (
    <article className="history-info-card">

      <h4>
        {title}
      </h4>

      <div className="history-card-content">
        {
          children ||
          (
            <p className="history-muted">
              No information available.
            </p>
          )
        }
      </div>

    </article>
  );
}


// ============================================================
// READING HISTORY PAGE
// ============================================================

function ReadingHistoryPage() {

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
    isLoadingHistory,
    setIsLoadingHistory,
  ] = useState(true);


  const [
    isLoadingSession,
    setIsLoadingSession,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // =========================================================
  // OPEN ONE SESSION
  // =========================================================

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


      } catch (sessionError) {

        console.error(
          "READING SESSION ERROR:",
          sessionError
        );


        setSelectedSession(
          null
        );


        setError(
          sessionError?.message ||
          "The reading could not be loaded."
        );


      } finally {

        setIsLoadingSession(
          false
        );

      }
    };


  // =========================================================
  // LOAD HISTORY
  // =========================================================

  const loadHistory =
    async () => {

      setIsLoadingHistory(
        true
      );

      setError("");


      try {

        const response =
          await getReadingSessions(
            100
          );


        const history =
          Array.isArray(
            response
          )
            ? response
            : [];


        setSessions(
          history
        );


        if (
          history.length === 0
        ) {

          setSelectedSession(
            null
          );

          setSelectedSessionId(
            null
          );

          return;
        }


        const currentStillExists =
          selectedSessionId &&
          history.some(
            (session) =>
              Number(
                session.id
              ) ===
              Number(
                selectedSessionId
              )
          );


        const targetSession =
          currentStillExists
            ? history.find(
                (session) =>
                  Number(
                    session.id
                  ) ===
                  Number(
                    selectedSessionId
                  )
              )
            : history[0];


        await openSession(
          targetSession.id
        );


      } catch (historyError) {

        console.error(
          "READING HISTORY ERROR:",
          historyError
        );


        setSessions([]);

        setSelectedSession(
          null
        );


        setError(
          historyError?.message ||
          "Reading history could not be loaded."
        );


      } finally {

        setIsLoadingHistory(
          false
        );

      }
    };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    loadHistory();

    // Run only when page first opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, []);


  // =========================================================
  // READING DATA
  // =========================================================

  const reading =
    selectedSession
      ?.initial_reading ||
    {};


  const interpretation =
    reading
      ?.interpretation ||
    null;


  const personality =
    reading
      ?.personality ||
    null;


  const recommendations =
    reading
      ?.recommendations ||
    null;


  const trends =
    reading
      ?.trends ||
    null;


  const scores =
    selectedSession
      ?.scores ||
    {};


  const palm =
    selectedSession
      ?.palm_analysis ||
    {};


  const tarot =
    selectedSession
      ?.tarot_analysis ||
    {};


  const tarotCards =
    Array.isArray(
      tarot?.cards
    )
      ? tarot.cards
      : [];


  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="history-page">

      {/* =================================================== */}
      {/* PAGE HEADER */}
      {/* =================================================== */}

      <div className="history-header">

        <div>

          <p className="history-eyebrow">
            SAVED READINGS
          </p>

          <h1>
            Reading History
          </h1>

          <p>
            Review your previous readings
            and continue saved conversations.
          </p>

        </div>


        <button
          type="button"
          className="history-refresh-button"
          onClick={
            loadHistory
          }
          disabled={
            isLoadingHistory
          }
        >

          {
            isLoadingHistory
              ? "Refreshing..."
              : "Refresh History"
          }

        </button>

      </div>


      {/* =================================================== */}
      {/* ERROR */}
      {/* =================================================== */}

      {error && (

        <div className="history-error">

          <strong>
            Unable to load history
          </strong>

          <p>
            {error}
          </p>

        </div>

      )}


      {/* =================================================== */}
      {/* LOADING */}
      {/* =================================================== */}

      {
        isLoadingHistory &&
        sessions.length === 0 && (

        <div className="history-empty">

          <h3>
            Loading readings...
          </h3>

        </div>

      )}


      {/* =================================================== */}
      {/* EMPTY */}
      {/* =================================================== */}

      {
        !isLoadingHistory &&
        sessions.length === 0 &&
        !error && (

        <div className="history-empty">

          <h3>
            No saved readings yet
          </h3>

          <p>
            Generate your first complete
            reading in Reading Studio.
            It will automatically appear
            here.
          </p>

        </div>

      )}


      {/* =================================================== */}
      {/* HISTORY CONTENT */}
      {/* =================================================== */}

      {sessions.length > 0 && (

        <div className="history-layout">

          {/* ================================================= */}
          {/* LEFT — SESSION LIST */}
          {/* ================================================= */}

          <aside className="history-sidebar">

            <div className="history-sidebar-title">

              <h3>
                My Readings
              </h3>

              <span>
                {sessions.length}
              </span>

            </div>


            <div className="history-session-list">

              {sessions.map(
                (session) => {

                  const isSelected =
                    Number(
                      selectedSessionId
                    ) ===
                    Number(
                      session.id
                    );


                  return (
                    <button
                      key={
                        session.id
                      }
                      type="button"
                      className={
                        isSelected
                          ? "history-session-item history-session-active"
                          : "history-session-item"
                      }
                      onClick={
                        () =>
                          openSession(
                            session.id
                          )
                      }
                    >

                      <div className="history-session-top">

                        <span className="history-session-number">
                          #{session.id}
                        </span>

                        <span className="history-message-count">
                          {
                            session
                              .message_count ||
                            0
                          }{" "}
                          messages
                        </span>

                      </div>


                      <strong>
                        {
                          session.title ||
                          "Saved Reading"
                        }
                      </strong>


                      <p>
                        {
                          session
                            .original_question
                        }
                      </p>


                      <div className="history-session-meta">

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
          {/* RIGHT — READING DETAIL */}
          {/* ================================================= */}

          <section className="history-detail">

            {isLoadingSession && (

              <div className="history-empty">

                <h3>
                  Loading reading...
                </h3>

              </div>

            )}


            {
              !isLoadingSession &&
              selectedSession && (

              <>

                {/* =========================================== */}
                {/* SESSION HEADER */}
                {/* =========================================== */}

                <div className="history-reading-header">

                  <div>

                    <p className="history-eyebrow">
                      READING SESSION #
                      {selectedSession.id}
                    </p>

                    <h2>
                      {
                        selectedSession.title
                      }
                    </h2>

                  </div>


                  <div className="history-badges">

                    <span>
                      {
                        selectedSession
                          .category ||
                        "General"
                      }
                    </span>

                    <span>
                      {
                        selectedSession
                          .spread ||
                        "No spread"
                      }
                    </span>

                  </div>

                </div>


                <div className="history-date-row">

                  <span>
                    Created:{" "}
                    {
                      formatDate(
                        selectedSession
                          .created_at
                      )
                    }
                  </span>

                  <span>
                    Updated:{" "}
                    {
                      formatDate(
                        selectedSession
                          .updated_at
                      )
                    }
                  </span>

                </div>


                {/* =========================================== */}
                {/* ORIGINAL QUESTION */}
                {/* =========================================== */}

                <section className="history-section">

                  <h3>
                    Original Question
                  </h3>

                  <InfoCard
                    title="Question"
                  >

                    <p>
                      {
                        selectedSession
                          .original_question
                      }
                    </p>

                  </InfoCard>

                </section>


                {/* =========================================== */}
                {/* PALM */}
                {/* =========================================== */}

                <section className="history-section">

                  <h3>
                    Palm Analysis
                  </h3>


                  <div className="history-grid">

                    <InfoCard
                      title="Heart Line"
                    >

                      <p>
                        {
                          palm
                            ?.heart_line ||
                          "Not available"
                        }
                      </p>

                    </InfoCard>


                    <InfoCard
                      title="Head Line"
                    >

                      <p>
                        {
                          palm
                            ?.head_line ||
                          "Not available"
                        }
                      </p>

                    </InfoCard>


                    <InfoCard
                      title="Life Line"
                    >

                      <p>
                        {
                          palm
                            ?.life_line ||
                          "Not available"
                        }
                      </p>

                    </InfoCard>

                  </div>

                </section>


                {/* =========================================== */}
                {/* TAROT */}
                {/* =========================================== */}

                <section className="history-section">

                  <h3>
                    Tarot Reading
                  </h3>


                  <p className="history-muted">

                    Spread:{" "}
                    {
                      tarot?.spread ||
                      "Not available"
                    }

                  </p>


                  {
                    tarotCards.length > 0
                      ? (

                      <div className="history-tarot-grid">

                        {tarotCards.map(
                          (
                            card,
                            index
                          ) => (

                            <article
                              key={
                                `${card.name}-${index}`
                              }
                              className="history-tarot-card"
                            >

                              <span>
                                {
                                  card.position ||
                                  `Card ${index + 1}`
                                }
                              </span>

                              <h4>
                                {card.name}
                              </h4>

                              <p>
                                <strong>
                                  Orientation:
                                </strong>{" "}
                                {
                                  card.orientation
                                }
                              </p>

                              {
                                Array.isArray(
                                  card.keywords
                                ) &&
                                card.keywords.length > 0 && (

                                <p>
                                  <strong>
                                    Keywords:
                                  </strong>{" "}

                                  {
                                    card.keywords.join(
                                      ", "
                                    )
                                  }
                                </p>

                              )
                              }

                              <p>
                                <strong>
                                  Meaning:
                                </strong>{" "}

                                {
                                  card
                                    .selected_meaning
                                }
                              </p>

                            </article>

                          )
                        )}

                      </div>

                    )
                    : (

                      <p className="history-muted">
                        No tarot cards stored.
                      </p>

                    )
                  }

                </section>


                {/* =========================================== */}
                {/* INTERPRETATION */}
                {/* =========================================== */}

                {interpretation && (

                  <section className="history-section">

                    <h3>
                      AI Interpretation
                    </h3>


                    <InfoCard
                      title="Overall Summary"
                    >

                      <p>
                        {
                          interpretation
                            .overall_summary
                        }
                      </p>

                    </InfoCard>


                    <div className="history-grid">

                      <InfoCard
                        title="Palm Interpretation"
                      >

                        <p>
                          {
                            interpretation
                              .palm_interpretation
                          }
                        </p>

                      </InfoCard>


                      <InfoCard
                        title="Tarot Interpretation"
                      >

                        <p>
                          {
                            interpretation
                              .tarot_interpretation
                          }
                        </p>

                      </InfoCard>

                    </div>


                    <InfoCard
                      title="Combined Interpretation"
                    >

                      <p>
                        {
                          interpretation
                            .combined_interpretation
                        }
                      </p>

                    </InfoCard>


                    <div className="history-grid">

                      <InfoCard
                        title="Key Strengths"
                      >

                        <SafeList
                          items={
                            interpretation
                              .key_strengths
                          }
                        />

                      </InfoCard>


                      <InfoCard
                        title="Growth Areas"
                      >

                        <SafeList
                          items={
                            interpretation
                              .growth_areas
                          }
                        />

                      </InfoCard>

                    </div>


                    <InfoCard
                      title="Current Focus"
                    >

                      <p>
                        {
                          interpretation
                            .current_focus
                        }
                      </p>

                    </InfoCard>


                    <InfoCard
                      title="Key Message"
                    >

                      <p>
                        {
                          interpretation
                            .key_message
                        }
                      </p>

                    </InfoCard>

                  </section>

                )}


                {/* =========================================== */}
                {/* PERSONALITY */}
                {/* =========================================== */}

                {personality && (

                  <section className="history-section">

                    <h3>
                      Personality Intelligence
                    </h3>


                    <InfoCard
                      title="Personality Summary"
                    >

                      <p>
                        {
                          personality
                            .personality_summary
                        }
                      </p>

                    </InfoCard>


                    <div className="history-grid">

                      <InfoCard
                        title="Dominant Traits"
                      >

                        <SafeList
                          items={
                            personality
                              .dominant_traits
                          }
                        />

                      </InfoCard>


                      <InfoCard
                        title="Strengths"
                      >

                        <SafeList
                          items={
                            personality
                              .strengths
                          }
                        />

                      </InfoCard>

                    </div>


                    <div className="history-grid">

                      <InfoCard
                        title="Emotional Style"
                      >

                        <p>
                          {
                            personality
                              .emotional_style
                          }
                        </p>

                      </InfoCard>


                      <InfoCard
                        title="Thinking Style"
                      >

                        <p>
                          {
                            personality
                              .thinking_style
                          }
                        </p>

                      </InfoCard>

                    </div>


                    <div className="history-grid">

                      <InfoCard
                        title="Decision Style"
                      >

                        <p>
                          {
                            personality
                              .decision_style
                          }
                        </p>

                      </InfoCard>


                      <InfoCard
                        title="Relationship Style"
                      >

                        <p>
                          {
                            personality
                              .relationship_style
                          }
                        </p>

                      </InfoCard>

                    </div>


                    <div className="history-grid">

                      <InfoCard
                        title="Development Areas"
                      >

                        <SafeList
                          items={
                            personality
                              .development_areas
                          }
                        />

                      </InfoCard>


                      <InfoCard
                        title="Growth Advice"
                      >

                        <SafeList
                          items={
                            personality
                              .growth_advice
                          }
                        />

                      </InfoCard>

                    </div>

                  </section>

                )}


                {/* =========================================== */}
                {/* RECOMMENDATIONS */}
                {/* =========================================== */}

                {recommendations && (

                  <section className="history-section">

                    <h3>
                      Recommendations
                    </h3>


                    <InfoCard
                      title="Recommendation Summary"
                    >

                      <p>
                        {
                          recommendations
                            .recommendation_summary
                        }
                      </p>

                    </InfoCard>


                    <div className="history-grid">

                      <InfoCard
                        title="Personal Growth"
                      >

                        <SafeList
                          items={
                            recommendations
                              .personal_growth
                          }
                        />

                      </InfoCard>


                      <InfoCard
                        title="Career"
                      >

                        <SafeList
                          items={
                            recommendations
                              .career
                          }
                        />

                      </InfoCard>

                    </div>


                    <div className="history-grid">

                      <InfoCard
                        title="Relationships"
                      >

                        <SafeList
                          items={
                            recommendations
                              .relationships
                          }
                        />

                      </InfoCard>


                      <InfoCard
                        title="Goal Alignment"
                      >

                        <SafeList
                          items={
                            recommendations
                              .goal_alignment
                          }
                        />

                      </InfoCard>

                    </div>


                    <div className="history-grid">

                      <InfoCard
                        title="Spiritual Development"
                      >

                        <SafeList
                          items={
                            recommendations
                              .spiritual_development
                          }
                        />

                      </InfoCard>


                      <InfoCard
                        title="Immediate Actions"
                      >

                        <SafeList
                          items={
                            recommendations
                              .immediate_actions
                          }
                        />

                      </InfoCard>

                    </div>


                    <InfoCard
                      title="Long-Term Actions"
                    >

                      <SafeList
                        items={
                          recommendations
                            .long_term_actions
                        }
                      />

                    </InfoCard>

                  </section>

                )}


                {/* =========================================== */}
                {/* LIFE TRENDS */}
                {/* =========================================== */}

                {trends && (

                  <section className="history-section">

                    <h3>
                      Life Trends
                    </h3>


                    <InfoCard
                      title="Trend Summary"
                    >

                      <p>
                        {
                          trends
                            .trend_summary
                        }
                      </p>

                    </InfoCard>


                    <InfoCard
                      title="Current Theme"
                    >

                      <p>
                        {
                          trends
                            .current_theme
                        }
                      </p>

                    </InfoCard>


                    <div className="history-grid">

                      <InfoCard
                        title="Next 30 Days"
                      >

                        <p>
                          {
                            trends
                              .next_30_days
                          }
                        </p>

                      </InfoCard>


                      <InfoCard
                        title="Next 3 Months"
                      >

                        <p>
                          {
                            trends
                              .next_3_months
                          }
                        </p>

                      </InfoCard>

                    </div>


                    <div className="history-grid">

                      <InfoCard
                        title="Opportunities"
                      >

                        <SafeList
                          items={
                            trends
                              .opportunities
                          }
                        />

                      </InfoCard>


                      <InfoCard
                        title="Challenges"
                      >

                        <SafeList
                          items={
                            trends
                              .challenges
                          }
                        />

                      </InfoCard>

                    </div>


                    <div className="history-grid">

                      <InfoCard
                        title="Recommended Focus"
                      >

                        <SafeList
                          items={
                            trends
                              .recommended_focus
                          }
                        />

                      </InfoCard>


                      <InfoCard
                        title="Practical Actions"
                      >

                        <SafeList
                          items={
                            trends
                              .practical_actions
                          }
                        />

                      </InfoCard>

                    </div>


                    {trends.disclaimer && (

                      <p className="history-disclaimer">
                        {trends.disclaimer}
                      </p>

                    )}

                  </section>

                )}


                {/* =========================================== */}
                {/* GUIDANCE SCORES */}
                {/* =========================================== */}

                {
                  scores &&
                  Object.keys(
                    scores
                  ).length > 0 && (

                  <section className="history-section">

                    <h3>
                      Guidance Scores
                    </h3>


                    <div className="history-score-grid">

                      <InfoCard
                        title="Palm Analysis"
                      >

                        <strong className="history-score">
                          {
                            Number(
                              scores
                                .palm_analysis_confidence ||
                              0
                            ).toFixed(2)
                          }
                          /100
                        </strong>

                      </InfoCard>


                      <InfoCard
                        title="Tarot Relevance"
                      >

                        <strong className="history-score">
                          {
                            Number(
                              scores
                                .tarot_interpretation_relevance ||
                              0
                            ).toFixed(2)
                          }
                          /100
                        </strong>

                      </InfoCard>


                      <InfoCard
                        title="Personality Alignment"
                      >

                        <strong className="history-score">
                          {
                            Number(
                              scores
                                .personality_alignment ||
                              0
                            ).toFixed(2)
                          }
                          /100
                        </strong>

                      </InfoCard>


                      <InfoCard
                        title="Overall Insight"
                      >

                        <strong className="history-score">
                          {
                            Number(
                              scores
                                .overall_insight_score ||
                              0
                            ).toFixed(2)
                          }
                          /100
                        </strong>

                      </InfoCard>

                    </div>

                  </section>

                )}


                {/* =========================================== */}
                {/* PERSISTENT CHAT */}
                {/* =========================================== */}

                <section className="history-section">

                  <h3>
                    Saved Conversation
                  </h3>

                  <ReadingChat

                    readingResponse={{
                      reading_session_id:
                        selectedSession.id,
                    }}

                  />

                </section>

              </>

            )}

          </section>

        </div>

      )}

    </div>
  );
}


export default ReadingHistoryPage;