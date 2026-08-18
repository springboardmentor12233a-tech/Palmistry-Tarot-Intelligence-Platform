import { useState } from "react";
import axios from "axios";
import { supabase } from "../supabaseClient";
import "../styles/TarotPage.css";

function TarotPage({ goHome }) {
  // =========================
  // TAROT STATES
  // =========================

  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("General");
  const [spread, setSpread] = useState("single");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Card reveal states
  const [revealedCards, setRevealedCards] = useState([]);

  // Follow-up
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [followUpAnswer, setFollowUpAnswer] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);

  // =========================
  // CLEAN AI INTERPRETATION
  // =========================

  const cleanInterpretation = (text) => {
    if (!text) return "";

    return text
      .replace(/\*\*/g, "")
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/^\s*[-*]\s+/gm, "")
      .replace(/`/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  // =========================
  // SAVE TAROT READING
  // =========================

  const saveTarotReading = async (interpretation) => {
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) {
        console.error("USER ERROR:", userError);
        return;
      }

      const user = userData?.user;

      if (!user) {
        console.log(
          "No logged-in user. Reading will not be saved."
        );
        return;
      }

      const { error } = await supabase
        .from("Palmistry")
        .insert([
          {
            user_id: user.id,
            type: "tarot",
            interpretation: interpretation,
          },
        ]);

      if (error) {
        console.error(
          "SUPABASE TAROT SAVE ERROR:",
          error
        );
        return;
      }

      console.log(
        "Tarot reading saved successfully!"
      );

    } catch (error) {
      console.error(
        "ERROR SAVING TAROT READING:",
        error
      );
    }
  };

  // =========================
  // TAROT READING API
  // =========================

  const getTarotReading = async () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!question.trim()) {
      alert("Please enter your question.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/tarot/reading",
        {
          name,
          question,
          category,
          spread,
        }
      );

      setResult(response.data);

      // Start with every card face down
      setRevealedCards([]);

      // Save tarot reading
      if (response.data?.interpretation) {
        await saveTarotReading(
          response.data.interpretation
        );
      }

      // Clear old follow-up response
      setFollowUpQuestion("");
      setFollowUpAnswer("");

    } catch (error) {
      console.error("FULL ERROR:", error);

      if (error.response) {
        console.error(
          "STATUS:",
          error.response.status
        );

        console.error(
          "DATA:",
          error.response.data
        );

        alert(
          `Tarot reading failed.\n\nStatus: ${
            error.response.status
          }\n${JSON.stringify(
            error.response.data
          )}`
        );

      } else if (error.request) {
        console.error(
          "NO RESPONSE FROM BACKEND:",
          error.request
        );

        alert(
          "Could not connect to the backend. Is FastAPI running?"
        );

      } else {
        alert(
          `Request error: ${error.message}`
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REVEAL CARD
  // =========================

  const revealCard = (index) => {
    setRevealedCards((previous) => {
      if (previous.includes(index)) {
        return previous;
      }

      return [...previous, index];
    });
  };

  // =========================
  // FOLLOW-UP API
  // =========================

  const askFollowUp = async () => {
    if (!result) {
      alert(
        "Generate a tarot reading first."
      );
      return;
    }

    if (!followUpQuestion.trim()) {
      alert(
        "Please enter a follow-up question."
      );
      return;
    }

    try {
      setFollowUpLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/tarot/follow-up",
        {
          conversation_context:
            result.conversation_context,
          question: followUpQuestion,
        }
      );

      setFollowUpAnswer(
        response.data.answer
      );

    } catch (error) {
      console.error(
        "FOLLOW-UP ERROR:",
        error
      );

      if (error.response) {
        alert(
          `Follow-up failed.\n\nStatus: ${
            error.response.status
          }\n${JSON.stringify(
            error.response.data
          )}`
        );

      } else {
        alert(
          "Could not connect to the backend."
        );
      }

    } finally {
      setFollowUpLoading(false);
    }
  };

  // =========================
  // DOWNLOAD PDF
  // =========================

  const downloadPDF = () => {
    if (!result || !result.pdf_url) {
      alert(
        "PDF report is not available."
      );
      return;
    }

    const pdfURL =
      `http://127.0.0.1:8000${result.pdf_url}`;

    window.open(
      pdfURL,
      "_blank"
    );
  };

  return (
    <div className="tarotPage">

      <div className="tarotOverlay">

        {/* BACK BUTTON */}

        <button
          className="tarotBackBtn"
          onClick={goHome}
        >
          ← Back to Oracle
        </button>

        {/* TITLE */}

        <h1 className="tarotTitle">
          🔮 Tarot Reading
        </h1>

        <p className="tarotSubtitle">
          Ask the Oracle a question and discover
          what the cards may reveal.
        </p>

        {/* =========================
            READING FORM
        ========================= */}

        <div className="tarotForm">

          <label>
            Your Name
          </label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <label>
            Your Question
          </label>

          <textarea
            rows="4"
            placeholder="What would you like to ask the Oracle?"
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
          />

          <label>
            Reading Category
          </label>

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option value="General">
              General
            </option>

            <option value="Career">
              Career
            </option>

            <option value="Love">
              Love
            </option>

            <option value="Finance">
              Finance
            </option>

            <option value="Health">
              Health
            </option>
          </select>

          <label>
            Choose Your Spread
          </label>

          <select
            value={spread}
            onChange={(e) =>
              setSpread(e.target.value)
            }
          >
            <option value="single">
              Single Card
            </option>

            <option value="ppf">
              Past • Present • Future
            </option>
          </select>

          <button
            className="tarotAnalyzeBtn"
            onClick={getTarotReading}
            disabled={loading}
          >
            {loading
              ? "✨ Consulting the Oracle..."
              : "🔮 Reveal the Cards"}
          </button>

        </div>

        {/* =========================
            RESULTS
        ========================= */}

        {result && (

          <div className="tarotResults">

            <h2>
              ✨ Your Cards
            </h2>

            <p className="cardRevealHint">
              Tap each card to reveal what the Oracle
              has chosen for you.
            </p>

            {/* =========================
                CARD REVEAL
            ========================= */}

            <div className="cardsContainer">

              {result.cards.map(
                (card, index) => {

                  const isRevealed =
                    revealedCards.includes(index);

                  return (
                    <div
                      className={`tarotCardScene ${
                        isRevealed
                          ? "revealed"
                          : ""
                      }`}
                      key={index}
                      onClick={() =>
                        revealCard(index)
                      }
                    >

                      <div className="tarotCardFlip">

                        {/* CARD BACK */}

                        <div className="tarotCardFace tarotCardBack">

                          <div className="cardBackGlow">
                            ✦
                          </div>

                          <div className="cardBackInner">
                            <span>✦</span>
                            <span>☾</span>
                            <span>✧</span>
                            <span>☽</span>
                            <span>✦</span>
                          </div>

                          <p>
                            {card.position}
                          </p>

                          {!isRevealed && (
                            <small>
                              Click to reveal
                            </small>
                          )}

                        </div>

                        {/* CARD FRONT */}

                        <div className="tarotCardFace tarotCardFront">

                          <img
                            src={`/cards/${card.card.img}`}
                            alt={card.card.name}
                            className="tarotCardImage"
                          />

                          <div className="tarotCardInfo">

                            <span className="cardPosition">
                              {card.position}
                            </span>

                            <h3>
                              {card.card.name}
                            </h3>

                            <p className="orientation">
                              {card.orientation}
                            </p>

                            <p className="keywords">
                              {card.card.keywords.join(
                                " • "
                              )}
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            {/* =========================
                AI INTERPRETATION
            ========================= */}

            <div className="tarotInterpretation">

              <h2>
                ✨ Oracle's Interpretation
              </h2>

              <p>
                {cleanInterpretation(
                  result.interpretation
                )}
              </p>

            </div>

            {/* =========================
                PDF
            ========================= */}

            {result.pdf_url && (

              <button
                className="tarotPdfBtn"
                onClick={downloadPDF}
              >
                📜 Download PDF Report
              </button>

            )}

            {/* =========================
                FOLLOW-UP
            ========================= */}

            <div className="followUpCard">

              <h2>
                🔮 Ask the Oracle More
              </h2>

              <p>
                Have another question about
                your reading?
              </p>

              <textarea
                rows="3"
                placeholder="Ask a follow-up question..."
                value={followUpQuestion}
                onChange={(e) =>
                  setFollowUpQuestion(
                    e.target.value
                  )
                }
              />

              <button
                className="followUpBtn"
                onClick={askFollowUp}
                disabled={followUpLoading}
              >
                {followUpLoading
                  ? "✨ Consulting..."
                  : "Ask Follow-up"}
              </button>

              {followUpAnswer && (

                <div className="followUpAnswer">

                  <h3>
                    ✨ Oracle's Response
                  </h3>

                  <p>
                    {cleanInterpretation(
                      followUpAnswer
                    )}
                  </p>

                </div>

              )}

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default TarotPage;