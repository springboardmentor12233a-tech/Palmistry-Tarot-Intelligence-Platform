import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router";

import {
  buildBackendUrl,
  drawTarotCards,
} from "../services/api";

import {
  getReadingSession,
  getReadingSessions,
} from "../services/chatApi";

import "./TarotReadingPage.css";


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


function TarotCard({
  card,
  index,
}) {
  return (
    <article className="tarot-module-card">

      <div className="tarot-module-card-top">

        <span className="tarot-module-position">
          {
            card.position ||
            `Card ${index + 1}`
          }
        </span>

        <span
          className={
            String(
              card.orientation
            ).toLowerCase() ===
            "reversed"

              ? "tarot-module-orientation tarot-module-reversed"

              : "tarot-module-orientation tarot-module-upright"
          }
        >
          {
            card.orientation ||
            "Unknown"
          }
        </span>

      </div>
      {card.image && (

  <div className="tarot-module-image-wrapper">

    <img
      src={buildBackendUrl(card.image)}
      alt={card.name || "Tarot card"}
      className={
        String(card.orientation).toLowerCase() === "reversed"
          ? "tarot-module-card-image tarot-module-card-image-reversed"
          : "tarot-module-card-image"
      }
      loading="lazy"
    />

  </div>

)}


      <h3>
        {
          card.name ||
          "Unknown Card"
        }
      </h3>


      {
        Array.isArray(
          card.keywords
        ) &&
        card.keywords.length > 0 && (

          <div className="tarot-module-keywords">

            {card.keywords.map(
              (
                keyword,
                keywordIndex
              ) => (

                <span
                  key={
                    `${keyword}-${keywordIndex}`
                  }
                >
                  {keyword}
                </span>

              )
            )}

          </div>

        )
      }


      <p className="tarot-module-meaning">

        {
          card.selected_meaning ||
          "No meaning was returned."
        }

      </p>

    </article>
  );
}


// ============================================================
// TAROT PAGE
// ============================================================

function TarotReadingPage() {

  // ==========================================================
  // CURRENT DRAW
  // ==========================================================

  const [
    spread,
    setSpread,
  ] = useState("");


  const [
    cards,
    setCards,
  ] = useState([]);


  const [
    isDrawing,
    setIsDrawing,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // ==========================================================
  // HISTORY
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
    isLoadingHistory,
    setIsLoadingHistory,
  ] = useState(true);


  const [
    historyError,
    setHistoryError,
  ] = useState("");


  // ==========================================================
  // LOAD SAVED TAROT HISTORY
  // ==========================================================

  useEffect(() => {

    const loadHistory =
      async () => {

        setIsLoadingHistory(
          true
        );

        setHistoryError("");


        try {

          const response =
            await getReadingSessions(
              20
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

            try {

              const detail =
                await getReadingSession(
                  readingSessions[0].id
                );


              setSelectedSession(
                detail
              );


            } catch (
              detailError
            ) {

              console.error(
                "TAROT HISTORY DETAIL ERROR:",
                detailError
              );

            }

          }


        } catch (
          loadError
        ) {

          console.error(
            "TAROT HISTORY ERROR:",
            loadError
          );


          setHistoryError(
            loadError?.message ||
            "Saved tarot history could not be loaded."
          );


        } finally {

          setIsLoadingHistory(
            false
          );

        }
      };


    loadHistory();

  }, []);


  // ==========================================================
  // SPREAD CHANGE
  // ==========================================================

  const handleSpreadChange =
    (event) => {

      setSpread(
        event.target.value
      );

      setCards([]);

      setError("");
    };


  // ==========================================================
  // DRAW TAROT
  // ==========================================================

  const handleDraw =
    async () => {

      if (!spread) {

        setError(
          "Please select a tarot spread first."
        );

        return;
      }


      setIsDrawing(
        true
      );

      setCards([]);

      setError("");


      try {

        const response =
          await drawTarotCards(
            spread
          );


        console.log(
          "TAROT MODULE RESPONSE:",
          response
        );


        if (
          !Array.isArray(
            response?.cards
          ) ||
          response.cards.length === 0
        ) {

          throw new Error(
            "The backend did not return any tarot cards."
          );

        }


        setCards(
          response.cards
        );


      } catch (
        drawError
      ) {

        console.error(
          "TAROT MODULE ERROR:",
          drawError
        );


        setError(
          drawError?.message ||
          "Tarot cards could not be drawn."
        );


      } finally {

        setIsDrawing(
          false
        );

      }
    };


  // ==========================================================
  // OPEN SAVED SESSION
  // ==========================================================

  const openSavedSession =
    async (
      sessionId
    ) => {

      setHistoryError("");


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
          "SAVED TAROT SESSION ERROR:",
          sessionError
        );


        setHistoryError(
          sessionError?.message ||
          "The saved tarot reading could not be opened."
        );

      }
    };


  // ==========================================================
  // SAVED TAROT
  // ==========================================================

  const savedTarot =
    selectedSession
      ?.tarot_analysis ||
    {};


  const savedCards =
    Array.isArray(
      savedTarot.cards
    )
      ? savedTarot.cards
      : [];


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="tarot-module-page">

      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <div className="tarot-module-header">

        <div>

          <p className="tarot-module-eyebrow">
            TAROT INTELLIGENCE
          </p>


          <h1>
            Tarot Reading
          </h1>


          <p className="tarot-module-description">

            Select a tarot spread and
            draw cards from the platform
            tarot dataset.

          </p>

        </div>


        <Link
          to="/reading"
          className="tarot-module-reading-link"
        >
          Open Reading Studio
        </Link>

      </div>


      {/* ==================================================== */}
      {/* NOTICE */}
      {/* ==================================================== */}

      <div className="tarot-module-notice">

        <strong>
          Current prototype spreads
        </strong>

        <p>

          The tarot engine currently
          supports Single Card and
          Past-Present-Future readings,
          including upright and reversed
          card meanings.

        </p>

      </div>


      {/* ==================================================== */}
      {/* NEW DRAW */}
      {/* ==================================================== */}

      <section className="tarot-module-section">

        <div className="tarot-module-section-heading">

          <p className="tarot-module-eyebrow">
            NEW TAROT DRAW
          </p>

          <h2>
            Select Your Spread
          </h2>

        </div>


        <article className="tarot-module-control-card">

          <div className="tarot-module-form-group">

            <label htmlFor="tarot-module-spread">
              Tarot Spread
            </label>


            <select
              id="tarot-module-spread"
              value={
                spread
              }
              onChange={
                handleSpreadChange
              }
              disabled={
                isDrawing
              }
            >

              <option value="">
                Select tarot spread
              </option>

              <option value="Single Card">
                Single Card
              </option>

              <option value="Past-Present-Future">
                Past-Present-Future
              </option>

            </select>

          </div>


          <button
            type="button"
            className="tarot-module-draw-button"
            onClick={
              handleDraw
            }
            disabled={
              !spread ||
              isDrawing
            }
          >

            {
              isDrawing
                ? "Drawing Cards..."
                : cards.length > 0
                  ? "Draw New Cards"
                  : "Draw Tarot Cards"
            }

          </button>


          {error && (

            <div
              className="tarot-module-error"
              role="alert"
            >

              <strong>
                Tarot draw failed
              </strong>

              <p>
                {error}
              </p>

            </div>

          )}

        </article>

      </section>


      {/* ==================================================== */}
      {/* CURRENT CARDS */}
      {/* ==================================================== */}

      {cards.length > 0 && (

        <section className="tarot-module-section">

          <div className="tarot-module-section-heading">

            <p className="tarot-module-eyebrow">
              CURRENT DRAW
            </p>

            <h2>
              {spread}
            </h2>

          </div>


          <div
            className={
              cards.length === 1
                ? "tarot-module-card-grid tarot-module-single-grid"
                : "tarot-module-card-grid"
            }
          >

            {cards.map(
              (
                card,
                index
              ) => (

                <TarotCard
                  key={
                    `${card.name}-${card.position}-${index}`
                  }
                  card={
                    card
                  }
                  index={
                    index
                  }
                />

              )
            )}

          </div>


          <div className="tarot-module-current-note">

            <strong>
              Want a complete interpretation?
            </strong>

            <p>

              Standalone tarot draws are
              not automatically saved as
              complete reading sessions.
              Use Reading Studio to combine
              these concepts with palm
              analysis, AI interpretation,
              scoring and persistent chat.

            </p>

            <Link to="/reading">
              Create Complete Reading
            </Link>

          </div>

        </section>

      )}


      {/* ==================================================== */}
      {/* SAVED TAROT HISTORY */}
      {/* ==================================================== */}

      <section className="tarot-module-section">

        <div className="tarot-module-section-heading">

          <p className="tarot-module-eyebrow">
            SAVED ACTIVITY
          </p>

          <h2>
            Previous Tarot Readings
          </h2>

          <p>
            Tarot cards stored inside
            your previous complete
            reading sessions.
          </p>

        </div>


        {historyError && (

          <div className="tarot-module-error">

            <strong>
              History unavailable
            </strong>

            <p>
              {historyError}
            </p>

          </div>

        )}


        {
          isLoadingHistory
            ? (

              <div className="tarot-module-empty">
                Loading saved tarot readings...
              </div>

            )
            : sessions.length === 0
              ? (

                <div className="tarot-module-empty">

                  <h3>
                    No saved readings yet
                  </h3>

                  <p>
                    Complete a Reading Studio
                    session to create saved
                    tarot history.
                  </p>

                </div>

              )
              : (

                <div className="tarot-module-history-layout">

                  {/* SESSION LIST */}

                  <div className="tarot-module-session-list">

                    {sessions.map(
                      (session) => {

                        const selected =
                          Number(
                            selectedSession?.id
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
                                ? "tarot-module-session-button tarot-module-session-selected"
                                : "tarot-module-session-button"
                            }
                            onClick={
                              () =>
                                openSavedSession(
                                  session.id
                                )
                            }
                          >

                            <strong>
                              {
                                session.title ||
                                "Saved Reading"
                              }
                            </strong>


                            <span>
                              {
                                session.spread ||
                                "No spread"
                              }
                            </span>


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


                  {/* SAVED DETAIL */}

                  <article className="tarot-module-saved-detail">

                    {selectedSession
                      ? (

                        <>

                          <div className="tarot-module-saved-header">

                            <div>

                              <p className="tarot-module-eyebrow">
                                SAVED SESSION #
                                {
                                  selectedSession.id
                                }
                              </p>

                              <h3>
                                {
                                  selectedSession.title
                                }
                              </h3>

                            </div>


                            <Link
                              to="/history"
                              className="tarot-module-history-link"
                            >
                              Full History
                            </Link>

                          </div>


                          <div className="tarot-module-saved-context">

                            <p>

                              <strong>
                                Question:
                              </strong>{" "}

                              {
                                selectedSession
                                  .original_question ||
                                "Not available"
                              }

                            </p>


                            <p>

                              <strong>
                                Spread:
                              </strong>{" "}

                              {
                                savedTarot.spread ||
                                selectedSession.spread ||
                                "Not available"
                              }

                            </p>

                          </div>


                          {
                            savedCards.length > 0
                              ? (

                                <div
                                  className={
                                    savedCards.length === 1
                                      ? "tarot-module-card-grid tarot-module-single-grid"
                                      : "tarot-module-card-grid"
                                  }
                                >

                                  {savedCards.map(
                                    (
                                      card,
                                      index
                                    ) => (

                                      <TarotCard
                                        key={
                                          `${card.name}-${index}`
                                        }
                                        card={
                                          card
                                        }
                                        index={
                                          index
                                        }
                                      />

                                    )
                                  )}

                                </div>

                              )
                              : (

                                <div className="tarot-module-empty">
                                  No tarot cards were stored in this session.
                                </div>

                              )
                          }

                        </>

                      )
                      : (

                        <div className="tarot-module-empty">
                          Select a saved reading.
                        </div>

                      )
                    }

                  </article>

                </div>

              )
        }

      </section>


      {/* ==================================================== */}
      {/* DISCLAIMER */}
      {/* ==================================================== */}

      <p className="tarot-module-disclaimer">

        Tarot readings in this platform
        are symbolic and intended for
        entertainment, personal reflection
        and software-demonstration purposes.
        They do not guarantee future events.

      </p>

    </div>
  );
}


export default TarotReadingPage;