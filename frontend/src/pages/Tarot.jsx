import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { createTarotReading } from "../services/api";
import "./Tarot.css";

// ======================================================
// GLOBAL TAROT REQUEST LOCK
// ======================================================

let tarotRequestInProgress = false;


function Tarot() {

  const [question, setQuestion] = useState("");
  const [topic, setTopic] = useState("");

  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestInProgress = useRef(false);


  // ======================================================
  // DRAW TAROT CARDS
  // ======================================================

  const handleDrawCards = async () => {

    if (tarotRequestInProgress) {
      console.log(
        "Tarot request blocked: another request is already running."
      );
      return;
    }


    if (requestInProgress.current) {
      console.log(
        "Tarot request blocked: component request already running."
      );
      return;
    }


    const cleanQuestion = question.trim();
    const cleanTopic = topic.trim().toLowerCase();


    if (!cleanQuestion) {
      setError("Please enter your question.");
      return;
    }


    if (!cleanTopic) {
      setError("Please select a reading topic.");
      return;
    }


    tarotRequestInProgress = true;
    requestInProgress.current = true;

    setLoading(true);
    setError("");
    setReading(null);


    try {

      console.log("Creating Tarot reading...");

      const data = await createTarotReading(
        cleanQuestion,
        cleanTopic
      );

      console.log("Tarot response:", data);

      setReading(data);

      if (data.duplicate === true) {

        console.log(
          "Existing recent Tarot reading returned."
        );

      } else {

        console.log(
          "New Tarot reading created."
        );

      }

    } catch (error) {

      console.error(
        "Tarot reading error:",
        error
      );

      setError(
        error.message ||
        "Unable to create tarot reading."
      );

    } finally {

      requestInProgress.current = false;
      tarotRequestInProgress = false;

      setLoading(false);

    }

  };


  // ======================================================
  // IMAGE URL
  // ======================================================

  const getCardImageUrl = (imageUrl) => {

    if (!imageUrl) {
      return "";
    }

    // If backend already returns a complete URL
    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://")
    ) {
      return imageUrl;
    }

    // Backend API URL
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL ||
      "http://127.0.0.1:8000";

    return `${API_BASE_URL}${imageUrl}`;
  };


  // ======================================================
  // RENDER
  // ======================================================

  return (
    <>
      <Navbar />


      <main className="tarot-main">


        {/* =================================================
            HEADER
        ================================================= */}

        <section className="tarot-header">

          <Link
            to="/dashboard"
            className="back-link"
          >
            ← Back to Dashboard
          </Link>


          <span className="dashboard-eyebrow">
            TAROT INTELLIGENCE
          </span>


          <h1>
            Explore the
            <span> cards.</span>
          </h1>


          <p>
            Focus on a question, choose an area of your
            life, and explore symbolic Tarot guidance.
          </p>

        </section>



        {/* =================================================
            READING SECTION
        ================================================= */}

        <section className="tarot-reading-section">


          {/* =================================================
              QUESTION CARD
          ================================================= */}

          <div className="tarot-question-card">

            <div className="tarot-card-icon">
              🔮
            </div>


            <span className="card-label">
              BEGIN YOUR READING
            </span>


            <h2>
              What would you like
              <span> guidance about?</span>
            </h2>


            <p>
              Take a moment to focus on a question or
              situation before beginning your reading.
            </p>


            <label htmlFor="tarot-question">
              Your question
            </label>


            <textarea
              id="tarot-question"
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              placeholder="For example: What should I focus on in my career journey?"
              rows="4"
              disabled={loading}
            />


            <label htmlFor="tarot-topic">
              Reading topic
            </label>


            <select
              id="tarot-topic"
              value={topic}
              onChange={(event) =>
                setTopic(event.target.value)
              }
              disabled={loading}
            >

              <option value="">
                Select a topic
              </option>

              <option value="love">
                Love & Relationships
              </option>

              <option value="career">
                Career & Work
              </option>

              <option value="personal">
                Personal Growth
              </option>

              <option value="life">
                Life Direction
              </option>

              <option value="general">
                General Guidance
              </option>

            </select>


            <button
              type="button"
              className="draw-button"
              onClick={handleDrawCards}
              disabled={
                loading ||
                !question.trim() ||
                !topic ||
                tarotRequestInProgress
              }
            >

              {loading
                ? "Drawing Cards..."
                : "Draw My Cards →"}

            </button>


            {error && (

              <p
                style={{
                  color: "#c62828",
                  marginTop: "15px",
                  fontWeight: "600",
                }}
              >
                {error}
              </p>

            )}


            {reading && (

              <p
                style={{
                  marginTop: "15px",
                  fontWeight: "600",
                }}
              >

                {reading.duplicate
                  ? "Your recent reading has been displayed."
                  : "Your Tarot reading has been saved successfully."}

              </p>

            )}


            <p className="tarot-note">
              ✦ Tarot readings are intended for
              self-reflection and entertainment.
            </p>

          </div>



          {/* =================================================
              TAROT PREVIEW
          ================================================= */}

          <div className="tarot-preview">

            <span className="dashboard-eyebrow">
              THREE-CARD READING
            </span>


            {/* =================================================
                BEFORE READING
            ================================================= */}

            {!reading ? (

              <>

                <h2>
                  Your cards will
                  <span> appear here.</span>
                </h2>


                <p>
                  After starting a reading, three Tarot
                  cards will be selected and interpreted.
                </p>


                <div className="card-preview-row">

                  <div className="tarot-card-back">
                    <span>✦</span>
                  </div>


                  <div className="tarot-card-back">
                    <span>✦</span>
                  </div>


                  <div className="tarot-card-back">
                    <span>✦</span>
                  </div>

                </div>


                <div className="reading-positions">

                  <div>
                    <strong>01</strong>
                    <span>Past</span>
                  </div>


                  <div>
                    <strong>02</strong>
                    <span>Present</span>
                  </div>


                  <div>
                    <strong>03</strong>
                    <span>Future</span>
                  </div>

                </div>

              </>

            ) : (

              /* =================================================
                 AFTER READING
              ================================================= */

              <>

                <h2>
                  Your cards
                  <span> are here.</span>
                </h2>


                <p>
                  Here is your three-card symbolic reading.
                </p>


                {/* =================================================
                    GENERATED TAROT CARDS
                ================================================= */}

                <div className="card-preview-row tarot-generated-row">

                  {reading.cards &&
                    reading.cards.map(
                      (card, index) => (

                        <div
                          className="tarot-card-result"
                          key={`${card.position}-${index}`}
                        >

                          <span className="card-position">
                            {String(index + 1).padStart(
                              2,
                              "0"
                            )}
                          </span>


                          {/* ===============================
                              ACTUAL TAROT CARD IMAGE
                          =============================== */}

                          {card.image_url ? (

                            <img
                              src={getCardImageUrl(
                                card.image_url
                              )}
                              alt={`${card.name} Tarot card`}
                              className="tarot-card-image"
                            />

                          ) : (

                            <div className="tarot-image-placeholder">
                              ✦
                            </div>

                          )}


                          <h3>
                            {card.name}
                          </h3>


                          {card.orientation && (

                            <strong>
                              {card.orientation}
                            </strong>

                          )}


                          <span className="tarot-card-position-label">
                            {card.position}
                          </span>


                          {card.keywords && (

                            <div className="tarot-card-keywords">
                              {card.keywords}
                            </div>

                          )}


                          <p>
                            {card.meaning}
                          </p>

                        </div>

                      )
                    )}

                </div>


                {/* =================================================
                    POSITIONS
                ================================================= */}

                <div className="reading-positions">

                  {reading.cards &&
                    reading.cards.map(
                      (card, index) => (

                        <div
                          key={`${card.position}-${index}`}
                        >

                          <strong>
                            {String(index + 1).padStart(
                              2,
                              "0"
                            )}
                          </strong>


                          <span>
                            {card.position}
                          </span>

                        </div>

                      )
                    )}

                </div>

              </>

            )}

          </div>

        </section>



        {/* =================================================
            DATASET INFORMATION
        ================================================= */}

        <section className="tarot-dataset-info">

          <div className="dataset-symbol">
            ✦
          </div>


          <div>

            <span className="dashboard-eyebrow">
              TAROT KNOWLEDGE BASE
            </span>


            <h2>
              Symbolic card meanings
            </h2>


            <p>
              The platform uses the Tarot knowledge base
              to provide card names, meanings and symbolic
              information for each reading.
            </p>

          </div>

        </section>



        {/* =================================================
            DISCLAIMER
        ================================================= */}

        <div className="tarot-disclaimer">

          ✦ Tarot interpretations are provided for
          self-reflection and entertainment purposes only.
          They should not be treated as professional advice.

        </div>

      </main>
    </>
  );
}


export default Tarot;