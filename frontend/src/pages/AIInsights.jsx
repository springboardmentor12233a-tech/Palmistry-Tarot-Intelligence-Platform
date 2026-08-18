import { useState } from "react";
import axios from "axios";
import { supabase } from "../supabaseClient";
import "../styles/AIInsights.css";

function AIInsights({ goHome }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    try {
      setLoading(true);
      setInsights(null);

      // Get logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login first.");
        return;
      }

      // Get user's latest palm + tarot readings
      const { data, error } = await supabase
        .from("Palmistry")
        .select("type, interpretation, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("SUPABASE ERROR:", error);
        alert("Could not load your readings.");
        return;
      }

      const palm = data?.find(
        (reading) => reading.type === "palm"
      );

      const tarot = data?.find(
        (reading) => reading.type === "tarot"
      );

      if (!palm || !tarot) {
        alert(
          "Please complete both a palm and tarot reading first."
        );
        return;
      }

      // Send readings to FastAPI
      const response = await axios.post(
        "http://127.0.0.1:8000/api/features/ai-insights",
        {
          palm_interpretation: palm.interpretation,
          tarot_interpretation: tarot.interpretation,
        }
      );
      console.log("AI INSIGHTS RESPONSE:", response.data);

      setInsights(response.data);

    } catch (error) {
      console.error("AI INSIGHTS ERROR:", error);

      if (error.response) {
        alert(
          `Could not generate insights.\n\n${JSON.stringify(
            error.response.data
          )}`
        );
      } else {
        console.error("FULL ERROR:", error);
        alert(`Backend error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aiInsightsPage">

      <button
        className="aiBackBtn"
        onClick={goHome}
      >
        ← Back to Home
      </button>

      <div className="aiInsightsContent">

        <div className="aiHeader">
          <div className="aiIcon">✦</div>

          <h1>AI Insights</h1>

          <p>
            Discover the patterns and themes hidden across
            your Oracle readings.
          </p>
        </div>

        {!insights && (
          <div className="generateCard">

            <div className="generateIcon">
              🔮
            </div>

            <h2>Discover Your Insights</h2>

            <p>
              Let the Oracle's AI look across your palm
              and tarot readings to uncover meaningful
              patterns, themes, and reflections.
            </p>

            <button
              className="generateInsightsBtn"
              onClick={generateInsights}
              disabled={loading}
            >
              {loading
                ? "✨ Reading Your Patterns..."
                : "✦ Generate My Insights"}
            </button>

          </div>
        )}

        {insights && (
          <div className="insightsContainer">

            <div className="insightCard">
              <span className="insightIcon">🌙</span>
              <h2>Personality</h2>
              <p>{insights.personality}</p>
            </div>

            <div className="insightCard">
              <span className="insightIcon">❤️</span>
              <h2>Relationships</h2>
              <p>{insights.relationships}</p>
            </div>

            <div className="insightCard">
              <span className="insightIcon">💼</span>
              <h2>Career</h2>
              <p>{insights.career}</p>
            </div>

            <div className="insightCard">
              <span className="insightIcon">✨</span>
              <h2>Emotional Energy</h2>
              <p>{insights.emotional}</p>
            </div>

            <div className="overallInsight">
              <h2>🔮 Overall Insight</h2>
              <p>{insights.overall}</p>
            </div>

            <button
              className="regenerateBtn"
              onClick={generateInsights}
              disabled={loading}
            >
              {loading
                ? "✨ Re-reading..."
                : "↻ Generate Again"}
            </button>

          </div>
        )}

        <p className="aiDisclaimer">
          ✦ These insights are for reflection and
          entertainment only. They are not predictions
          or guarantees.
        </p>

      </div>
    </div>
  );
}

export default AIInsights;