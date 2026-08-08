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
    <div>
      <h1>My Readings</h1>

      {loading && <Loading text="Loading your readings..." />}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && readings.length === 0 && (
        <p>You haven't generated any readings yet.</p>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {readings.map((reading) => (
          <div key={reading._id} className="upload-card">
            <h2>
              {typeLabel[reading.reading_type] || reading.reading_type}
            </h2>

            <p style={{ color: "#888", fontSize: "14px" }}>
              {new Date(reading.created_at).toLocaleString()}
            </p>

            {reading.reading_type === "palm" && (
              <p>{reading.data.reading?.slice(0, 200)}...</p>
            )}

            {reading.reading_type === "tarot" && (
              <p>{reading.data.reading?.slice(0, 200)}...</p>
            )}

            {reading.reading_type === "combined" && (
              <p>
                {reading.data.combined_reading?.slice(0, 200)}...
              </p>
            )}

            {reading.data.pdf_url && (
              <a
                href={`http://127.0.0.1:8000${reading.data.pdf_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="primary-btn"
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  textDecoration: "none",
                }}
              >
                📄 View PDF
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyReadings;