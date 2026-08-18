import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Trash2,
} from "lucide-react";

import {
  getHistory,
  getReading,
  deleteReading,
} from "./historyApi";

import "./HistoryPage.css";


function HistoryPage({ onBack }) {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReading, setLoadingReading] = useState(false);
  const [error, setError] = useState("");
  const [selectedReading, setSelectedReading] =
    useState(null);


  useEffect(() => {
    loadHistory();
  }, []);


  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getHistory();

      setReadings(
        Array.isArray(data)
          ? data
          : data.readings || data.history || []
      );
    } catch (err) {
      console.error(
        "HISTORY LOAD ERROR:",
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


  const handleDelete = async (id) => {
    try {
      await deleteReading(id);

      setReadings((current) =>
        current.filter(
          (reading) => reading.id !== id
        )
      );

      if (
        selectedReading?.id === id
      ) {
        setSelectedReading(null);
      }
    } catch (err) {
      console.error(
        "HISTORY DELETE ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to delete this reading."
      );
    }
  };


  const openReading = async (reading) => {
    try {
      setError("");
      setLoadingReading(true);

      console.log(
        "OPENING HISTORY READING:",
        reading.id
      );

      const fullReading = await getReading(
        reading.id
      );

      console.log(
        "FULL HISTORY READING:",
        fullReading
      );

      setSelectedReading(fullReading);
    } catch (err) {
      console.error(
        "READING DETAILS ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load this reading."
      );
    } finally {
      setLoadingReading(false);
    }
  };


  if (selectedReading) {
    const result =
      selectedReading.result || {};

    const interpretation =
      result.interpretation ||
      "";

    const spread =
      Array.isArray(result.spread)
        ? result.spread
        : [];

    const palmReading =
      result.palm_reading || null;

    return (
      <main className="history-page">

        <nav className="history-nav">

          <button
            className="history-back"
            onClick={() =>
              setSelectedReading(null)
            }
          >
            <ArrowLeft size={17} />
            Back to history
          </button>

          <div className="history-brand">
            <BookOpen size={17} />
            ARCANA AI
          </div>

        </nav>


        <section className="history-detail">

          <div className="history-detail-eyebrow">
            {selectedReading.reading_type ||
              "READING"}
          </div>

          <h1>
            {selectedReading.title ||
              "Arcana AI Reading"}
          </h1>

          {selectedReading.created_at && (
            <div className="history-detail-date">
              <CalendarDays size={14} />

              {new Date(
                selectedReading.created_at
              ).toLocaleString()}
            </div>
          )}


          {selectedReading.question && (
            <div className="history-question-box">

              <span>YOUR QUESTION</span>

              <p>
                {selectedReading.question}
              </p>

            </div>
          )}


          <div className="history-detail-content">

            {interpretation && (
              <section className="history-section">

                <div className="history-section-label">
                  INTERPRETATION
                </div>

                <div className="history-interpretation">
                  {interpretation
                    .split("\n")
                    .map(
                      (paragraph, index) =>
                        paragraph.trim() ? (
                          <p key={index}>
                            {paragraph}
                          </p>
                        ) : null
                    )}
                </div>

              </section>
            )}


            {spread.length > 0 && (
              <section className="history-section">

                <div className="history-section-label">
                  TAROT SPREAD
                </div>

                <div className="history-spread">

                  {spread.map(
                    (card, index) => (
                      <article
                        className="history-card-detail"
                        key={`${card.card || "card"}-${index}`}
                      >

                        <span>
                          {card.position ||
                            `Card ${index + 1}`}
                        </span>

                        <h3>
                          {card.card ||
                            "Unknown Card"}
                        </h3>

                        <p>
                          {card.orientation ||
                            ""}
                        </p>

                        {card.meaning && (
                          <p>
                            {card.meaning}
                          </p>
                        )}

                      </article>
                    )
                  )}

                </div>

              </section>
            )}


            {palmReading && (
              <section className="history-section">

                <div className="history-section-label">
                  PALM READING
                </div>

                <div className="history-palm-grid">

                  {Object.entries(
                    palmReading
                  ).map(
                    ([key, line]) =>
                      line && (
                        <article
                          className="history-palm-card"
                          key={key}
                        >

                          <span>
                            {line.title ||
                              key.replaceAll(
                                "_",
                                " "
                              )}
                          </span>

                          {line.finding && (
                            <h3>
                              {line.finding}
                            </h3>
                          )}

                          {line.description && (
                            <p>
                              {line.description}
                            </p>
                          )}

                          {line.interpretation && (
                            <p>
                              {line.interpretation}
                            </p>
                          )}

                        </article>
                      )
                  )}

                </div>

              </section>
            )}


            {!interpretation &&
              spread.length === 0 &&
              !palmReading && (
                <section className="history-section">
                  <div className="history-error">
                    This reading has no detailed
                    result data.
                  </div>
                </section>
              )}

          </div>

        </section>

      </main>
    );
  }


  return (
    <main className="history-page">

      <nav className="history-nav">

        <button
          className="history-back"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="history-brand">
          <BookOpen size={17} />
          ARCANA AI
        </div>

      </nav>


      <header className="history-header">

        <p className="history-eyebrow">
          YOUR ARCANA RECORD
        </p>

        <h1>
          Your reading history.
        </h1>

        <p>
          Return to the insights and
          reflections you've created
          with Arcana AI.
        </p>

      </header>


      {loading && (
        <div className="history-state">
          Loading your readings...
        </div>
      )}


      {error && (
        <div className="history-error">
          {error}
        </div>
      )}


      {loadingReading && (
        <div className="history-state">
          Opening your reading...
        </div>
      )}


      {!loading &&
        !error &&
        readings.length === 0 && (
          <div className="history-empty">

            <BookOpen size={32} />

            <h2>
              No readings yet.
            </h2>

            <p>
              Your completed Tarot and
              palm readings will appear here.
            </p>

          </div>
        )}


      {!loading &&
        readings.length > 0 && (
          <section className="history-list">

            {readings.map((reading) => (

              <article
                className="history-card"
                key={reading.id}
              >

                <button
                  className="history-card-open"
                  onClick={() =>
                    openReading(reading)
                  }
                  disabled={loadingReading}
                >

                  <div className="history-card-main">

                    <span className="history-type">
                      {reading.reading_type ||
                        "READING"}
                    </span>

                    <h2>
                      {reading.title ||
                        "Arcana AI Reading"}
                    </h2>

                    {reading.question && (
                      <p>
                        "{reading.question}"
                      </p>
                    )}

                    {reading.created_at && (
                      <span className="history-date">
                        {new Date(
                          reading.created_at
                        ).toLocaleString()}
                      </span>
                    )}

                  </div>

                  <ChevronRight size={20} />

                </button>


                <button
                  className="history-delete"
                  onClick={() =>
                    handleDelete(reading.id)
                  }
                  title="Delete reading"
                  disabled={loadingReading}
                >
                  <Trash2 size={16} />
                </button>

              </article>

            ))}

          </section>
        )}

    </main>
  );
}


export default HistoryPage;