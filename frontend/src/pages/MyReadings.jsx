import { useEffect, useState } from "react";
import api from "../services/api";
import Loading from "../components/Loading";

function MyReadings() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReadings = async () => {
      try {
        const response = await api.get("/my-readings");
        setReadings(response.data.readings);
      } catch (err) {
        console.error(err);
        setError("Could not load your reading history.");
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
  }, []);

  const typeLabel = {
    palm: "Palm Reading",
    tarot: "Tarot Reading",
    combined: "Combined Reading",
  };

  return (
    <div className="my-readings-page">
      <div className="my-readings-container">

        <h1 className="my-readings-heading">
          My Readings
        </h1>

        {loading && (
          <Loading text="Loading your readings..." />
        )}

        {error && (
          <div className="my-readings-error">
            {error}
          </div>
        )}

        {!loading && readings.length === 0 && (
          <div className="my-readings-empty">
            <div className="my-readings-empty-icon">🔮</div>
            <h2>No readings yet</h2>
            <p>
              You haven't generated any readings yet.
            </p>
          </div>
        )}

        {!loading && readings.length > 0 && (
          <div className="my-readings-list">

            {readings.map((reading) => (
              <div
                key={reading._id}
                className="my-reading-card"
              >
                <div className="my-reading-header">

                  <div>
                    <h2>
                      {typeLabel[reading.reading_type] ||
                        reading.reading_type}
                    </h2>

                    <p className="my-reading-date">
                      {new Date(
                        reading.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <span className="my-reading-badge">
                    {reading.reading_type}
                  </span>

                </div>

                <div className="my-reading-content">

                  {reading.reading_type === "palm" && (
                    <p>
                      {reading.data.reading?.slice(0, 250)}
                      {reading.data.reading?.length > 250
                        ? "..."
                        : ""}
                    </p>
                  )}

                  {reading.reading_type === "tarot" && (
                    <p>
                      {reading.data.reading?.slice(0, 250)}
                      {reading.data.reading?.length > 250
                        ? "..."
                        : ""}
                    </p>
                  )}

                  {reading.reading_type === "combined" && (
                    <p>
                      {reading.data.combined_reading?.slice(0, 250)}
                      {reading.data.combined_reading?.length > 250
                        ? "..."
                        : ""}
                    </p>
                  )}

                </div>

                {reading.data.pdf_url && (
                  <div className="my-reading-actions">
                    <a
                      href={`http://127.0.0.1:8000${reading.data.pdf_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="my-reading-pdf-btn"
                    >
                      📄 View PDF
                    </a>
                  </div>
                )}

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default MyReadings;
