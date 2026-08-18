import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Stars,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import TarotResult from "./TarotResult";
import { saveReading } from "./historyApi";

function TarotReading({ onBack, palmResult = null }) {
  const [question, setQuestion] = useState("");
  const [spread, setSpread] = useState([]);

  const [drawing, setDrawing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [revealed, setRevealed] = useState([]);

  const [interpretation, setInterpretation] = useState("");

  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);

  const API_URL = "http://127.0.0.1:8000";

  // =========================================================
  // PALM CONTEXT
  // =========================================================

  const getPalmReadingText = () => {
    const reading = palmResult?.palm_reading;

    if (!reading) {
      return "";
    }

    const lines = [];

    const addLine = (key, label) => {
      const item = reading[key];

      if (!item) {
        return;
      }

      lines.push(
        `${label}: ${item.finding || ""}. ${item.description || ""} ${item.interpretation || ""}`
          .trim()
      );
    };

    addLine("heart_line", "Heart Line");
    addLine("head_line", "Head Line");
    addLine("life_line", "Life Line");

    return lines.join("\n");
  };

  const palmReadingText = getPalmReadingText();

  // =========================================================
  // DRAW THREE CARDS
  // =========================================================

  const drawCards = async () => {
    if (!question.trim()) {
      setError(
        "Please enter a question before drawing your cards."
      );
      return;
    }

    setError("");
    setInterpretation("");
    setSpread([]);
    setRevealed([]);
    setShowResult(false);
    setDrawing(true);

    try {
      /*
       * IMPORTANT:
       * We now use /draw.
       *
       * This only draws the three Tarot cards.
       * Gemini interpretation happens later.
       */

      const endpoint = `${API_URL}/api/tarot/draw`;

      console.log("=================================");
      console.log("TAROT DRAW REQUEST:", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      console.log("TAROT DRAW RESPONSE:", {
        url: response.url,
        status: response.status,
        ok: response.ok,
      });

      const data = await response.json();

      console.log("TAROT DRAW DATA:", data);

      if (!response.ok) {
        throw new Error(
          data.detail ||
            `Tarot draw failed. Server returned ${response.status}.`
        );
      }

      if (!data.spread || data.spread.length !== 3) {
        throw new Error(
          "The Tarot engine did not return exactly three cards."
        );
      }

      /*
       * Store the three cards.
       */

      setSpread(data.spread);

      /*
       * Reveal cards one by one.
       */

      setTimeout(() => {
        setRevealed([0]);
      }, 500);

      setTimeout(() => {
        setRevealed([0, 1]);
      }, 1100);

      setTimeout(() => {
        setRevealed([0, 1, 2]);
      }, 1700);

      console.log("TAROT DRAW SUCCESS");
    } catch (err) {
      console.error("TAROT DRAW ERROR:", err);

      setSpread([]);
      setRevealed([]);

      setError(
        err.message ||
          "Unable to connect to the Tarot engine."
      );
    } finally {
      setDrawing(false);
    }
  };

  // =========================================================
  // GENERATE GEMINI INTERPRETATION
  // =========================================================

  const generateReading = async () => {
    if (!question.trim()) {
      setError("Please enter your question first.");
      return;
    }

    if (spread.length !== 3) {
      setError("Please draw three cards first.");
      return;
    }

    if (revealed.length !== 3) {
      setError(
        "Please wait until all three cards are revealed."
      );
      return;
    }

    setError("");
    setGenerating(true);

    try {
      /*
       * IMPORTANT:
       *
       * The cards are ALREADY drawn.
       *
       * Therefore we call /interpret instead of /reading.
       */

      const endpoint =
        `${API_URL}/api/tarot/interpret`;

      console.log("=================================");
      console.log(
        "TAROT INTERPRET REQUEST:",
        endpoint
      );

      console.log("TAROT INTERPRET BODY:", {
        question: question.trim(),
        spread: spread,
        palm_reading: palmReadingText,
        palm_context_available: Boolean(palmReadingText),
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          spread: spread,
          palm_reading: palmReadingText,
        }),
      });

      console.log(
        "TAROT INTERPRET RESPONSE:",
        {
          url: response.url,
          status: response.status,
          ok: response.ok,
        }
      );

      const data = await response.json();

      console.log(
        "TAROT INTERPRET DATA:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.detail ||
            `Interpretation failed. Server returned ${response.status}.`
        );
      }

      if (!data.interpretation) {
        throw new Error(
          "The AI returned an empty interpretation."
        );
      }

      /*
       * Save interpretation.
       */

      setInterpretation(
        data.interpretation
      );

      /*
       * Save the completed Tarot reading to
       * the authenticated user's reading history.
       *
       * This does not block the result screen if
       * history saving fails.
       */
      try {
        await saveReading({
          readingType: "Tarot",
          title: "Three-Card Tarot Reading",
          question: question.trim(),
          result: {
            question: question.trim(),
            spread: spread,
            interpretation: data.interpretation,
          },
        });

        console.log(
          "TAROT READING SAVED TO HISTORY"
        );
      } catch (historyError) {
        console.error(
          "TAROT HISTORY SAVE ERROR:",
          historyError
        );
      }

      /*
       * Make sure the backend's spread is used
       * if it returned one.
       */

      if (
        data.spread &&
        data.spread.length === 3
      ) {
        setSpread(data.spread);
      }

      /*
       * Open TarotResult.
       */

      setShowResult(true);

      console.log(
        "TAROT READING COMPLETE"
      );
    } catch (err) {
      console.error(
        "TAROT INTERPRETATION ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to generate your Tarot interpretation."
      );
    } finally {
      setGenerating(false);
    }
  };

  // =========================================================
  // RESET READING
  // =========================================================

  const resetReading = () => {
    setQuestion("");
    setSpread([]);
    setRevealed([]);
    setInterpretation("");
    setError("");
    setDrawing(false);
    setGenerating(false);
    setShowResult(false);
  };

  // =========================================================
  // CARD IMAGE URL
  // =========================================================

  const getImageUrl = (card) => {
    if (!card?.image_file) {
      return null;
    }

    return (
      `${API_URL}/api/tarot/card-image/` +
      encodeURIComponent(
        card.image_file
      )
    );
  };

  // =========================================================
  // SHOW RESULT PAGE
  // =========================================================

  if (showResult) {
    return (
      <TarotResult
        question={question}
        spread={spread}
        interpretation={interpretation}
        palmResult={palmResult}
        onBack={() => {
          setShowResult(false);
        }}
        onNewReading={resetReading}
      />
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <main className="tarot-page">

      {/* =====================================================
          NAVIGATION
          ===================================================== */}

      <div className="palm-nav">

        <button
          className="back-button"
          onClick={onBack}
          disabled={
            drawing ||
            generating
          }
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="mini-brand">
          <Sparkles size={15} />
          ARCANA AI
        </div>

      </div>


      {/* =====================================================
          HEADER
          ===================================================== */}

      <section className="tarot-header">

        <div className="hero-badge">
          <Stars size={15} />
          Tarot Intelligence
        </div>

        <h1>
          Ask the cards
          <span>
            {" "}what lies ahead.
          </span>
        </h1>

        <p>
          Bring a question to your reading.
          Three cards will be drawn to explore
          the story across your past, present,
          and future.
        </p>

      </section>


      {/* =====================================================
          QUESTION
          ===================================================== */}

      <section className="tarot-question-section">

        <div className="section-label">
          <span>01</span>
          YOUR QUESTION
        </div>


        <div className="question-card">

          <textarea
            value={question}
            onChange={(event) => {
              setQuestion(
                event.target.value
              );
              setError("");
            }}
            placeholder="What should I focus on in my career?"
            maxLength={500}
            disabled={
              drawing ||
              generating
            }
          />


          <div className="question-footer">

            <span>
              {question.length}/500
            </span>


            <button
              className="draw-button"
              onClick={drawCards}
              disabled={
                drawing ||
                generating
              }
            >

              {drawing ? (
                <>
                  <span className="tarot-spinner" />
                  Drawing...
                </>
              ) : (
                <>
                  Draw three cards
                  <ArrowRight size={18} />
                </>
              )}

            </button>

          </div>

        </div>


        {/* ERROR */}

        {error && (
          <div className="tarot-error">

            <AlertCircle size={16} />

            <span>
              {error}
            </span>

          </div>
        )}

      </section>


      {/* =====================================================
          THREE CARD SPREAD
          ===================================================== */}

      <section className="tarot-spread-section">

        <div className="section-label">
          <span>02</span>
          YOUR SPREAD
        </div>


        <div className="tarot-spread">

          {[0, 1, 2].map(
            (index) => {

              const card =
                spread[index];

              const isRevealed =
                revealed.includes(
                  index
                );

              const positions = [
                "PAST",
                "PRESENT",
                "FUTURE",
              ];


              return (

                <div
                  className={`tarot-position ${
                    isRevealed
                      ? "revealed"
                      : ""
                  }`}
                  key={index}
                >

                  {/* POSITION */}

                  <div className="position-label">

                    <span>
                      0{index + 1}
                    </span>

                    {positions[index]}

                  </div>


                  {/* CARD */}

                  <div
                    className={`tarot-card-wrapper ${
                      isRevealed
                        ? "card-revealed"
                        : ""
                    }`}
                  >

                    {!card ||
                    !isRevealed ? (

                      <div className="tarot-card-back">

                        <div className="card-back-symbol">
                          <Stars size={38} />
                        </div>

                        <div className="card-back-text">
                          ARCANA
                        </div>

                      </div>

                    ) : (

                      <div className="tarot-card-face">

                        <img
                          src={getImageUrl(card)}
                          alt={card.card}
                        />

                        {card.reversed && (

                          <div className="reversed-badge">
                            REVERSED
                          </div>

                        )}

                      </div>

                    )}

                  </div>


                  {/* CARD INFORMATION */}

                  {isRevealed &&
                  card && (

                    <div className="drawn-card-info">

                      <h3>
                        {card.card}
                      </h3>

                      <div className="orientation">

                        <Check
                          size={13}
                        />

                        {card.orientation}

                      </div>

                    </div>

                  )}

                </div>

              );
            }
          )}

        </div>

      </section>


      {/* =====================================================
          GENERATE READING
          ===================================================== */}

      {spread.length === 3 &&
        revealed.length === 3 && (

        <section className="tarot-ready-section">

          <div className="tarot-ready-card">

            <div className="tarot-ready-icon">

              <Sparkles
                size={22}
              />

            </div>


            <div>

              <p className="eyebrow">
                THREE CARDS DRAWN
              </p>

              <h2>
                Your story is ready
                to unfold.
              </h2>

              <p>
                Your cards have been
                drawn. Let Arcana AI
                interpret their
                relationship to your
                question.
              </p>

            </div>


            <button
              className="generate-reading-button"
              onClick={
                generateReading
              }
              disabled={
                generating
              }
            >

              {generating ? (

                <>
                  <span className="tarot-spinner" />

                  Consulting
                  the intelligence...

                </>

              ) : (

                <>
                  Generate my reading

                  <ArrowRight
                    size={18}
                  />

                </>

              )}

            </button>

          </div>

        </section>

      )}


      {/* =====================================================
          RESET
          ===================================================== */}

      {spread.length > 0 &&
        revealed.length === 3 && (

        <div className="tarot-bottom-actions">

          <button
            className="tarot-reset"
            onClick={
              resetReading
            }
            disabled={
              drawing ||
              generating
            }
          >

            <RotateCcw
              size={15}
            />

            Draw another spread

          </button>

        </div>

      )}


      {/* =====================================================
          DISCLAIMER
          ===================================================== */}

      <div className="tarot-disclaimer">

        <ShieldCheck
          size={15}
        />

        <p>
          Tarot is presented as a
          reflective experience, not a
          guaranteed prediction of the
          future.
        </p>

      </div>

    </main>
  );
}

export default TarotReading;