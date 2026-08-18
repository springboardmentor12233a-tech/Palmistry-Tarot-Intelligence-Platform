import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardNavbar from "../components/DashboardNavbar";

import {
  getMyPalmReadings,
  getMyTarotReadings,
} from "../services/api";

import "./ReadingHistory.css";


function ReadingHistory() {

  const navigate = useNavigate();


  // =====================================================
  // STATE
  // =====================================================

  const [palmReadings, setPalmReadings] = useState([]);

  const [tarotReadings, setTarotReadings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =====================================================
  // LOAD READINGS
  // =====================================================

  useEffect(() => {

    loadReadings();

  }, []);


  const loadReadings = async () => {

    try {

      setLoading(true);

      setError("");


      // Load Palmistry + Tarot together

      const [palmData, tarotData] = await Promise.all([
        getMyPalmReadings(),
        getMyTarotReadings(),
      ]);


      console.log(
        "Palmistry readings:",
        palmData
      );


      console.log(
        "Tarot readings:",
        tarotData
      );


      // =================================================
      // PALMISTRY RESPONSE
      // =================================================

      if (Array.isArray(palmData)) {

        setPalmReadings(palmData);

      } else if (
        Array.isArray(palmData?.readings)
      ) {

        setPalmReadings(
          palmData.readings
        );

      } else {

        setPalmReadings([]);

      }


      // =================================================
      // TAROT RESPONSE
      // =================================================

      if (Array.isArray(tarotData)) {

        setTarotReadings(tarotData);

      } else if (
        Array.isArray(tarotData?.readings)
      ) {

        setTarotReadings(
          tarotData.readings
        );

      } else {

        setTarotReadings([]);

      }


    } catch (err) {

      console.error(
        "Failed to load readings:",
        err
      );


      setError(
        err.message ||
        "Unable to load your reading history."
      );


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (dateValue) => {

    if (!dateValue) {

      return "Date unavailable";

    }


    const date = new Date(dateValue);


    if (Number.isNaN(date.getTime())) {

      return "Date unavailable";

    }


    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <>

      {/* =================================================
          NAVBAR
      ================================================= */}

      <DashboardNavbar />


      <main className="history-main">


        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="history-header">

          <div>

            <span className="section-label">
              YOUR JOURNEY
            </span>


            <h1>
              Your <span>readings.</span>
            </h1>


            <p>
              Revisit your palmistry and tarot
              experiences and continue exploring
              your personal journey.
            </p>

          </div>


          <div className="history-symbol">
            ✦
          </div>

        </section>



        {/* =================================================
            READING SUMMARY
        ================================================= */}

        <section className="history-summary">


          {/* =================================================
              PALMISTRY SUMMARY
          ================================================= */}

          <div className="summary-item">

            <div className="summary-icon palm-summary">
              🖐
            </div>


            <div>

              <span>
                Palmistry
              </span>


              <strong>

                {loading
                  ? "Loading..."
                  : `${palmReadings.length} Reading${
                      palmReadings.length === 1
                        ? ""
                        : "s"
                    }`
                }

              </strong>

            </div>

          </div>



          {/* =================================================
              TAROT SUMMARY
          ================================================= */}

          <div className="summary-item">

            <div className="summary-icon tarot-summary">
              🔮
            </div>


            <div>

              <span>
                Tarot
              </span>


              <strong>

                {loading
                  ? "Loading..."
                  : `${tarotReadings.length} Reading${
                      tarotReadings.length === 1
                        ? ""
                        : "s"
                    }`
                }

              </strong>

            </div>

          </div>



          {/* =================================================
              INSIGHTS SUMMARY
          ================================================= */}

          <div className="summary-item">

            <div className="summary-icon insight-summary">
              ✦
            </div>


            <div>

              <span>
                Insights
              </span>


              <strong>
                Coming Soon
              </strong>

            </div>

          </div>


        </section>



        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {!loading && error && (

          <section className="history-card">

            <div className="history-empty">

              <div className="empty-icon">
                !
              </div>


              <h3>
                Unable to load readings
              </h3>


              <p>
                {error}
              </p>


              <div className="empty-actions">

                <button
                  type="button"
                  className="primary-button"
                  onClick={loadReadings}
                >
                  Try Again
                </button>

              </div>

            </div>

          </section>

        )}



        {/* =================================================
            PALMISTRY HISTORY
        ================================================= */}

        {!error && (

          <section className="history-card">


            <div className="history-card-header">

              <span className="card-label">
                PALMISTRY HISTORY
              </span>


              <h2>
                Your recent palm readings
              </h2>

            </div>



            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

              <div className="history-empty">

                <div className="empty-icon">
                  ✦
                </div>


                <h3>
                  Loading your readings...
                </h3>


                <p>
                  Please wait while we retrieve
                  your reading history.
                </p>

              </div>

            )}



            {/* =================================================
                EMPTY PALMISTRY
            ================================================= */}

            {!loading &&
              palmReadings.length === 0 && (

                <div className="history-empty">

                  <div className="empty-icon">
                    🖐
                  </div>


                  <h3>
                    Your palm reading history is empty.
                  </h3>


                  <p>
                    Complete your first palmistry
                    reading and it will appear here.
                  </p>


                  <div className="empty-actions">

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() =>
                        navigate("/palmistry")
                      }
                    >
                      Start Palm Reading →
                    </button>


                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        navigate("/tarot")
                      }
                    >
                      Start Tarot Reading →
                    </button>

                  </div>

                </div>

              )}



            {/* =================================================
                PALMISTRY READING LIST
            ================================================= */}

            {!loading &&
              palmReadings.length > 0 && (

                <div className="palm-reading-list">


                  {palmReadings.map(
                    (reading, index) => (

                      <article
                        className="palm-reading-history-item"
                        key={
                          reading.id ||
                          index
                        }
                      >


                        {/* NUMBER */}

                        <div className="palm-history-number">

                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}

                        </div>



                        <div className="palm-history-content">


                          {/* HEADER */}

                          <div className="palm-history-top">

                            <div>

                              <span className="card-label">
                                PALM READING
                              </span>


                              <h3>
                                Palm Reading #
                                {index + 1}
                              </h3>

                            </div>


                            <span className="palm-history-date">
                              {formatDate(
                                reading.created_at
                              )}
                            </span>

                          </div>



                          {/* PALM SHAPE */}

                          {reading.palm_shape && (

                            <div className="history-detail">

                              <strong>
                                Palm Shape
                              </strong>


                              <p>
                                {reading.palm_shape}
                              </p>

                            </div>

                          )}



                          {/* OVERALL READING */}

                          {reading.overall_reading && (

                            <div className="history-detail">

                              <strong>
                                Overall Interpretation
                              </strong>


                              <p>
                                {reading.overall_reading}
                              </p>

                            </div>

                          )}



                          {/* MAJOR PALM LINES */}

                          <div className="history-line-grid">


                            {reading.life_line && (

                              <div>

                                <strong>
                                  Life Line
                                </strong>


                                <p>
                                  {reading.life_line}
                                </p>

                              </div>

                            )}



                            {reading.head_line && (

                              <div>

                                <strong>
                                  Head Line
                                </strong>


                                <p>
                                  {reading.head_line}
                                </p>

                              </div>

                            )}



                            {reading.heart_line && (

                              <div>

                                <strong>
                                  Heart Line
                                </strong>


                                <p>
                                  {reading.heart_line}
                                </p>

                              </div>

                            )}



                            {reading.fate_line && (

                              <div>

                                <strong>
                                  Fate Line
                                </strong>


                                <p>
                                  {reading.fate_line}
                                </p>

                              </div>

                            )}



                            {reading.sun_line && (

                              <div>

                                <strong>
                                  Sun Line
                                </strong>


                                <p>
                                  {reading.sun_line}
                                </p>

                              </div>

                            )}

                          </div>


                        </div>

                      </article>

                    )
                  )}

                </div>

              )}

          </section>

        )}



        {/* =================================================
            TAROT HISTORY
        ================================================= */}

        {!error && !loading && (

          <section className="history-card">


            <div className="history-card-header">

              <span className="card-label">
                TAROT HISTORY
              </span>


              <h2>
                Your recent tarot readings
              </h2>

            </div>



            {/* =================================================
                EMPTY TAROT
            ================================================= */}

            {tarotReadings.length === 0 && (

              <div className="history-empty">

                <div className="empty-icon">
                  🔮
                </div>


                <h3>
                  Your tarot reading history is empty.
                </h3>


                <p>
                  Complete your first tarot reading
                  and it will appear here.
                </p>


                <div className="empty-actions">

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      navigate("/tarot")
                    }
                  >
                    Start Tarot Reading →
                  </button>

                </div>

              </div>

            )}



            {/* =================================================
                TAROT READING LIST
            ================================================= */}

            {tarotReadings.length > 0 && (

              <div className="tarot-reading-list">


                {tarotReadings.map(
                  (reading, index) => (

                    <article
                      className="palm-reading-history-item"
                      key={
                        reading.id ||
                        index
                      }
                    >


                      {/* NUMBER */}

                      <div className="palm-history-number">

                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}

                      </div>



                      <div className="palm-history-content">


                        {/* HEADER */}

                        <div className="palm-history-top">

                          <div>

                            <span className="card-label">
                              TAROT READING
                            </span>


                            <h3>
                              Tarot Reading #
                              {index + 1}
                            </h3>

                          </div>


                          <span className="palm-history-date">
                            {formatDate(
                              reading.created_at
                            )}
                          </span>

                        </div>



                        {/* QUESTION */}

                        {reading.question && (

                          <div className="history-detail">

                            <strong>
                              Question
                            </strong>


                            <p>
                              {reading.question}
                            </p>

                          </div>

                        )}



                        {/* TOPIC */}

                        {reading.topic && (

                          <div className="history-detail">

                            <strong>
                              Reading Topic
                            </strong>


                            <p>
                              {reading.topic}
                            </p>

                          </div>

                        )}



                        {/* =================================================
                            TAROT CARDS
                        ================================================= */}

                        {Array.isArray(
                          reading.cards
                        ) &&
                          reading.cards.length > 0 && (

                            <div className="history-line-grid">


                              {reading.cards.map(
                                (
                                  card,
                                  cardIndex
                                ) => (

                                  <div
                                    key={
                                      card.id ||
                                      `${reading.id}-${cardIndex}`
                                    }
                                  >

                                    <strong>
                                      {card.position ||
                                        `Card ${
                                          cardIndex + 1
                                        }`}
                                    </strong>


                                    <h4>
                                      {card.name ||
                                        card.card_name ||
                                        "Tarot Card"}
                                    </h4>


                                    <p>
                                      {card.meaning ||
                                        card.interpretation ||
                                        "Symbolic interpretation available."}
                                    </p>

                                  </div>

                                )
                              )}

                            </div>

                          )}



                        {/* =================================================
                            ALTERNATIVE CARD FORMAT
                            Handles card_1 / card_2 / card_3
                        ================================================= */}

                        {(!Array.isArray(
                          reading.cards
                        ) ||
                          reading.cards.length === 0) && (

                          <div className="history-line-grid">


                            {reading.card_1 && (

                              <div>

                                <strong>
                                  Past
                                </strong>


                                <h4>
                                  {typeof reading.card_1 ===
                                  "string"
                                    ? reading.card_1
                                    : reading.card_1.name}
                                </h4>


                                {typeof reading.card_1 !==
                                  "string" &&
                                  reading.card_1.meaning && (

                                    <p>
                                      {
                                        reading.card_1.meaning
                                      }
                                    </p>

                                  )}

                              </div>

                            )}



                            {reading.card_2 && (

                              <div>

                                <strong>
                                  Present
                                </strong>


                                <h4>
                                  {typeof reading.card_2 ===
                                  "string"
                                    ? reading.card_2
                                    : reading.card_2.name}
                                </h4>


                                {typeof reading.card_2 !==
                                  "string" &&
                                  reading.card_2.meaning && (

                                    <p>
                                      {
                                        reading.card_2.meaning
                                      }
                                    </p>

                                  )}

                              </div>

                            )}



                            {reading.card_3 && (

                              <div>

                                <strong>
                                  Future
                                </strong>


                                <h4>
                                  {typeof reading.card_3 ===
                                  "string"
                                    ? reading.card_3
                                    : reading.card_3.name}
                                </h4>


                                {typeof reading.card_3 !==
                                  "string" &&
                                  reading.card_3.meaning && (

                                    <p>
                                      {
                                        reading.card_3.meaning
                                      }
                                    </p>

                                  )}

                              </div>

                            )}

                          </div>

                        )}



                        {/* =================================================
                            GENERAL TAROT INTERPRETATION
                        ================================================= */}

                        {reading.overall_reading && (

                          <div className="history-detail">

                            <strong>
                              Overall Interpretation
                            </strong>


                            <p>
                              {reading.overall_reading}
                            </p>

                          </div>

                        )}



                        {reading.interpretation && (

                          <div className="history-detail">

                            <strong>
                              Interpretation
                            </strong>


                            <p>
                              {reading.interpretation}
                            </p>

                          </div>

                        )}

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </section>

        )}



        {/* =================================================
            READING OPTIONS
        ================================================= */}

        <section className="reading-options">


          {/* =================================================
              PALMISTRY OPTION
          ================================================= */}

          <div className="reading-option">

            <div className="option-icon">
              🖐
            </div>


            <div className="option-content">

              <span className="card-label">
                PALMISTRY
              </span>


              <h3>
                Discover what your hands reveal.
              </h3>


              <p>
                Upload your palm image and explore
                symbolic interpretations of your
                major palm lines.
              </p>


              <button
                type="button"
                onClick={() =>
                  navigate("/palmistry")
                }
              >
                Start Palm Reading →
              </button>

            </div>

          </div>



          {/* =================================================
              TAROT OPTION
          ================================================= */}

          <div className="reading-option tarot-option">

            <div className="option-icon tarot-option-icon">
              🔮
            </div>


            <div className="option-content">

              <span className="card-label">
                TAROT
              </span>


              <h3>
                Explore the cards.
              </h3>


              <p>
                Draw tarot cards and explore
                symbolic meanings related to
                your question or current journey.
              </p>


              <button
                type="button"
                onClick={() =>
                  navigate("/tarot")
                }
              >
                Start Tarot Reading →
              </button>

            </div>

          </div>


        </section>



        {/* =================================================
            BOTTOM ACTIONS
        ================================================= */}

        <section className="history-actions">


          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Back to Dashboard
          </button>


          <button
            type="button"
            className="primary-button"
            onClick={() =>
              navigate("/insights")
            }
          >
            View My Insights →
          </button>


        </section>



        {/* =================================================
            DISCLAIMER
        ================================================= */}

        <p className="history-disclaimer">

          ✦ For self-reflection and entertainment
          purposes. Readings are symbolic
          interpretations and should not be treated
          as professional advice.

        </p>


      </main>

    </>

  );

}


export default ReadingHistory;