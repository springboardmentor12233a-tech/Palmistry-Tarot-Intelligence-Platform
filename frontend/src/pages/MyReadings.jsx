import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/MyReadings.css";

function MyReadings({ goHome }) {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReading, setSelectedReading] = useState(null);

  useEffect(() => {
    const loadReadings = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          alert("Please login first.");
          return;
        }

        const { data, error } = await supabase
          .from("Palmistry")
          .select("type, interpretation, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("MY READINGS ERROR:", error);
          return;
        }

        setReadings(data || []);
      } catch (error) {
        console.error("LOAD READINGS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReadings();
  }, []);

  const palmReadings = readings.filter(
    (reading) => reading.type === "palm"
  );

  const tarotReadings = readings.filter(
    (reading) => reading.type === "tarot"
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="myReadingsPage">
        <div className="myReadingsLoading">
          ✨ Gathering your readings...
        </div>
      </div>
    );
  }

  return (
    <div className="myReadingsPage">

      <button
        className="myReadingsBackBtn"
        onClick={goHome}
      >
        ← Back to Home
      </button>

      <div className="myReadingsContent">

        <div className="myReadingsHeader">
          <div className="myReadingsIcon">✦</div>

          <h1>My Readings</h1>

          <p>
            Your journey through the Oracle, gathered in one place.
          </p>
        </div>

        <section className="readingSection">

          <div className="sectionTitle">
            <span>✋</span>
            <div>
              <h2>Palm Readings</h2>
              <p>{palmReadings.length} saved reading(s)</p>
            </div>
          </div>

          {palmReadings.length === 0 ? (
            <div className="emptyReading">
              <span>✋</span>
              <p>
                You haven't completed a palm reading yet.
              </p>
            </div>
          ) : (
            <div className="readingList">

              {palmReadings.map((reading, index) => (
                <div
                  className="readingItem"
                  key={index}
                  onClick={() => setSelectedReading(reading)}
                >
                  <div className="readingItemIcon">
                    ✋
                  </div>

                  <div className="readingItemInfo">
                    <h3>Palm Reading</h3>
                    <p>
                      {formatDate(reading.created_at)}
                    </p>
                  </div>

                  <span className="readingArrow">
                    →
                  </span>
                </div>
              ))}

            </div>
          )}

        </section>

        <section className="readingSection">

          <div className="sectionTitle">
            <span>🔮</span>
            <div>
              <h2>Tarot Readings</h2>
              <p>{tarotReadings.length} saved reading(s)</p>
            </div>
          </div>

          {tarotReadings.length === 0 ? (
            <div className="emptyReading">
              <span>🔮</span>
              <p>
                You haven't completed a tarot reading yet.
              </p>
            </div>
          ) : (
            <div className="readingList">

              {tarotReadings.map((reading, index) => (
                <div
                  className="readingItem"
                  key={index}
                  onClick={() => setSelectedReading(reading)}
                >
                  <div className="readingItemIcon">
                    🔮
                  </div>

                  <div className="readingItemInfo">
                    <h3>Tarot Reading</h3>
                    <p>
                      {formatDate(reading.created_at)}
                    </p>
                  </div>

                  <span className="readingArrow">
                    →
                  </span>
                </div>
              ))}

            </div>
          )}

        </section>

      </div>

      {selectedReading && (
        <div
          className="readingModalOverlay"
          onClick={() => setSelectedReading(null)}
        >
          <div
            className="readingModal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="closeReadingModal"
              onClick={() => setSelectedReading(null)}
            >
              ×
            </button>

            <div className="modalIcon">
              {selectedReading.type === "palm"
                ? "✋"
                : "🔮"}
            </div>

            <h2>
              {selectedReading.type === "palm"
                ? "Palm Reading"
                : "Tarot Reading"}
            </h2>

            <p className="modalDate">
              {formatDate(selectedReading.created_at)}
            </p>

            <div className="modalInterpretation">
              {selectedReading.interpretation}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default MyReadings;