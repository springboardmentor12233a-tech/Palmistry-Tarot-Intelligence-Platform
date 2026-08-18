import { useEffect, useState } from "react";
import axios from "axios";
import { supabase } from "../supabaseClient";
import "../styles/CompareReadings.css";

function CompareReadings({ goHome }) {
  const [palmReading, setPalmReading] = useState("");
  const [tarotReading, setTarotReading] = useState("");

  const [commonThemes, setCommonThemes] = useState("");
  const [loading, setLoading] = useState(true);
  const [themesLoading, setThemesLoading] = useState(false);

  const [palmExpanded, setPalmExpanded] = useState(false);
  const [tarotExpanded, setTarotExpanded] = useState(false);

  // =========================
  // CLEAN TEXT
  // =========================

  const cleanText = (text) => {
    if (!text) return "";

    return text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/^\s*[-•]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      .replace(/`/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  // =========================
  // LOAD READINGS
  // =========================

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
          console.error("SUPABASE ERROR:", error);
          return;
        }

        const palm = data?.find(
          (reading) => reading.type === "palm"
        );

        const tarot = data?.find(
          (reading) => reading.type === "tarot"
        );

        setPalmReading(palm?.interpretation || "");
        setTarotReading(tarot?.interpretation || "");

      } catch (error) {
        console.error("LOAD READINGS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReadings();
  }, []);

  // =========================
  // GENERATE COMMON THEMES
  // =========================

  const generateCommonThemes = async () => {
    if (!palmReading || !tarotReading) {
      alert("Please complete both a palm and tarot reading first.");
      return;
    }

    try {
      setThemesLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/tarot/common-themes",
        {
          palm_interpretation: cleanText(palmReading),
          tarot_interpretation: cleanText(tarotReading),
        }
      );

      setCommonThemes(
        cleanText(response.data.common_themes)
      );

    } catch (error) {
      console.error("COMMON THEMES ERROR:", error);

      alert("Could not generate common themes.");
    } finally {
      setThemesLoading(false);
    }
  };

  // =========================
  // PREVIEW
  // =========================

  const getPreview = (text) => {
    const cleaned = cleanText(text);

    if (cleaned.length <= 500) {
      return cleaned;
    }

    return cleaned.substring(0, 500).trim() + "...";
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="comparePage">
        <div className="compareContent">
          <h1>Compare Readings</h1>
          <p>✨ Gathering your readings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comparePage">

      <button
        className="compareBackBtn"
        onClick={goHome}
      >
        ← Back to Home
      </button>

      <div className="compareContent">

        <h1>Compare Readings</h1>

        <p className="compareSubtitle">
          Discover the common themes between your palm
          and tarot readings.
        </p>

        {/* =========================
            READING CARDS
        ========================= */}

        <div className="comparisonCards">

          {/* PALM */}

          <div className="comparisonCard">

            <div className="comparisonCardHeader">
              <h2>✋ Palm Reading</h2>
            </div>

            <div className="readingText">
              <p>
                {palmReading
                  ? palmExpanded
                    ? cleanText(palmReading)
                    : getPreview(palmReading)
                  : "No palm reading found."}
              </p>
            </div>

            {palmReading &&
              cleanText(palmReading).length > 500 && (
                <button
                  className="readMoreBtn"
                  onClick={() =>
                    setPalmExpanded(!palmExpanded)
                  }
                >
                  {palmExpanded
                    ? "Show Less ↑"
                    : "Read More →"}
                </button>
              )}
          </div>

          {/* TAROT */}

          <div className="comparisonCard">

            <div className="comparisonCardHeader">
              <h2>🔮 Tarot Reading</h2>
            </div>

            <div className="readingText">
              <p>
                {tarotReading
                  ? tarotExpanded
                    ? cleanText(tarotReading)
                    : getPreview(tarotReading)
                  : "No tarot reading found."}
              </p>
            </div>

            {tarotReading &&
              cleanText(tarotReading).length > 500 && (
                <button
                  className="readMoreBtn"
                  onClick={() =>
                    setTarotExpanded(!tarotExpanded)
                  }
                >
                  {tarotExpanded
                    ? "Show Less ↑"
                    : "Read More →"}
                </button>
              )}
          </div>

        </div>

        {/* =========================
            COMMON THEMES
        ========================= */}

        <div className="commonThemes">

          <h2>✦ Common Themes</h2>

          {!commonThemes ? (
            <>
              <p>
                Let the Oracle discover the themes
                connecting your two readings.
              </p>

              <button
                className="readMoreBtn"
                onClick={generateCommonThemes}
                disabled={themesLoading}
              >
                {themesLoading
                  ? "✨ Finding Connections..."
                  : "✦ Reveal Common Themes"}
              </button>
            </>
          ) : (
            <div className="themesText">
              <p>{commonThemes}</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default CompareReadings;