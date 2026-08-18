import React, { useEffect, useState } from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import { getPersonalizedInsights } from "../services/api";
import "./Insights.css";

function Insights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInsights();
  }, []);

  async function loadInsights() {
    try {
      setLoading(true);
      setError("");

      const response = await getPersonalizedInsights();

      setData(response);
    } catch (err) {
      console.error("Failed to load insights:", err);

      setError(
        err.message ||
          "Unable to load your personalized insights."
      );
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <>
        <DashboardNavbar />

        <main className="insights-main">
          <section className="insights-state-card">
            <div className="state-icon">✦</div>

            <h2>Reading your journey...</h2>

            <p>
              Combining your latest palmistry and tarot
              experiences to prepare your personal insights.
            </p>

            <div className="insight-loader">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </section>
        </main>
      </>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <>
        <DashboardNavbar />

        <main className="insights-main">
          <section className="insights-state-card error-state">
            <div className="state-icon">!</div>

            <h2>Unable to load insights</h2>

            <p>{error}</p>

            <button
              className="retry-button"
              onClick={loadInsights}
            >
              Try Again
            </button>
          </section>
        </main>
      </>
    );
  }

  // ======================================================
  // NO DATA
  // ======================================================

  if (!data?.available) {
    return (
      <>
        <DashboardNavbar />

        <main className="insights-main">

          <section className="insights-header">
            <span className="section-label">
              YOUR PERSONAL INSIGHTS
            </span>

            <h1>
              Understand your
              <span>inner patterns.</span>
            </h1>

            <p>
              Bring together your palmistry and tarot
              experiences to explore meaningful patterns,
              reflections and personalized guidance.
            </p>
          </section>

          <section className="insights-state-card">
            <div className="state-icon">✧</div>

            <h2>Your insight journey starts here.</h2>

            <p>
              Complete a palmistry or tarot reading to begin
              building your personalized insight journey.
            </p>
          </section>

          <p className="insights-disclaimer">
            ✦ For self-reflection and entertainment purposes.
            Insights are symbolic interpretations and should not
            be treated as professional advice.
          </p>

        </main>
      </>
    );
  }

  // ======================================================
  // DATA
  // ======================================================

  const insight = data.insight || {};

  const palmistry = data.sources?.palmistry;
  const tarot = data.sources?.tarot;

  const strengths = insight.strengths || [];

  const recommendations =
    insight.recommendations || [];


  // ======================================================
  // DYNAMIC LIFE TREND SCORES
  // ======================================================

  /*
   * These scores are derived from the actual insight data.
   * They are NOT fixed values.
   */

  const tarotTopic =
    tarot?.topic?.toLowerCase() || "general";

  const insightScore =
    Number(insight.score) || 0;


  // ------------------------------------------------------
  // CAREER SCORE
  // ------------------------------------------------------

  let careerScore = 55;

  if (tarotTopic === "career") {
    careerScore += 20;
  }

  if (
    strengths.includes("Confidence") ||
    strengths.includes("Leadership") ||
    strengths.includes("Determination")
  ) {
    careerScore += 10;
  }

  if (
    strengths.includes("Balance") ||
    strengths.includes("Patience")
  ) {
    careerScore += 5;
  }


  // ------------------------------------------------------
  // RELATIONSHIP SCORE
  // ------------------------------------------------------

  let relationshipScore = 55;

  const relationshipThemes = [
    "Connection",
    "Harmony",
    "Compassion",
    "Emotional awareness",
    "Balance",
    "Self-awareness",
  ];

  const relationshipStrengthCount =
    strengths.filter((strength) =>
      relationshipThemes.includes(strength)
    ).length;

  relationshipScore +=
    relationshipStrengthCount * 7;


  // ------------------------------------------------------
  // PERSONAL GROWTH SCORE
  // ------------------------------------------------------

  let growthScore = 55;

  const growthThemes = [
    "Self-awareness",
    "Self-reflection",
    "Resilience",
    "Adaptability",
    "Patience",
    "Wisdom",
    "Intuition",
    "Optimism",
    "Inspiration",
  ];

  const growthStrengthCount =
    strengths.filter((strength) =>
      growthThemes.includes(strength)
    ).length;

  growthScore +=
    growthStrengthCount * 6;


  // ------------------------------------------------------
  // COMBINE WITH OVERALL INSIGHT SCORE
  // ------------------------------------------------------

  if (insightScore > 0) {

    careerScore =
      Math.round(
        (careerScore + insightScore) / 2
      );

    relationshipScore =
      Math.round(
        (relationshipScore + insightScore) / 2
      );

    growthScore =
      Math.round(
        (growthScore + insightScore) / 2
      );
  }


  // ------------------------------------------------------
  // KEEP SCORES BETWEEN 0 AND 100
  // ------------------------------------------------------

  careerScore = Math.min(
    100,
    Math.max(0, careerScore)
  );

  relationshipScore = Math.min(
    100,
    Math.max(0, relationshipScore)
  );

  growthScore = Math.min(
    100,
    Math.max(0, growthScore)
  );


  // ======================================================
  // MAIN PAGE
  // ======================================================

  return (
    <>
      <DashboardNavbar activePage="insights" />

      <main className="insights-main">

        {/* ==================================================
            HEADER
        ================================================== */}

        <section className="insights-header">

          <span className="section-label">
            YOUR PERSONAL INSIGHTS
          </span>

          <h1>
            Understand your
            <span>inner patterns.</span>
          </h1>

          <p>
            Bring together your palmistry and tarot
            experiences to explore meaningful patterns,
            reflections and personalized guidance.
          </p>

        </section>


        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <section className="insight-summary">

          {/* PALMISTRY */}

          <div className="summary-card">

            <div className="summary-icon">
              ✋
            </div>

            <div>

              <span>Palmistry</span>

              <strong>
                {palmistry
                  ? "Latest Reading"
                  : "Not Available"}
              </strong>

              <p>
                {palmistry
                  ? palmistry.palm_shape ||
                    "Palm analysis completed."
                  : "Complete a palm reading to unlock more insights."}
              </p>

            </div>

          </div>


          {/* TAROT */}

          <div className="summary-card">

            <div className="summary-icon tarot-icon">
              🃏
            </div>

            <div>

              <span>Tarot</span>

              <strong>
                {tarot
                  ? tarot.topic || "Latest Reading"
                  : "Not Available"}
              </strong>

              <p>
                {tarot
                  ? tarot.question ||
                    "Your latest tarot reading."
                  : "Complete a tarot reading to unlock more insights."}
              </p>

            </div>

          </div>


          {/* INSIGHT SCORE */}

          <div className="summary-card">

            <div className="summary-icon insight-icon">
              ✦
            </div>

            <div>

              <span>PERSONALIZED INSIGHTS</span>

              <strong>
                {insight.score ?? 0}% Insight Score
              </strong>

              <p>
                Your latest readings have been combined
                into a personalized reflection.
              </p>

            </div>

          </div>

        </section>


        {/* ==================================================
            PERSONAL REFLECTION
        ================================================== */}

        <section className="main-insight-card">

          <div className="main-insight-top">

            <div>

              <span className="section-label">
                PERSONAL REFLECTION
              </span>

              <h2>
                Your journey,
                <span>interpreted.</span>
              </h2>

            </div>

            <div className="insight-symbol">
              ✦
            </div>

          </div>


          <div className="insight-content">

            <div className="reflection-icon">
              ✧
            </div>

            <div>

              <h3>
                Your personal reflection
              </h3>

              <p>
                {insight.personal_reflection ||
                  "Your personal reflection will appear here."}
              </p>

            </div>

          </div>

        </section>


        {/* ==================================================
            PERSONALITY + STRENGTHS
        ================================================== */}

        <section className="insight-detail-grid">

          {/* PERSONALITY */}

          <article className="detail-card">

            <span className="detail-label">
              PERSONALITY
            </span>

            <h2>
              Your inner profile
            </h2>

            <p>
              {insight.personality ||
                "Your personality insight will appear here."}
            </p>

          </article>


          {/* STRENGTHS */}

          <article className="detail-card">

            <span className="detail-label">
              YOUR STRENGTHS
            </span>

            <h2>
              Natural strengths
            </h2>

            <div className="strength-list">

              {strengths.length > 0 ? (

                strengths.map(
                  (strength, index) => (

                    <div
                      className="strength-item"
                      key={index}
                    >
                      <span>✓</span>
                      {strength}
                    </div>

                  )
                )

              ) : (

                <p>
                  Complete more readings to identify
                  recurring strengths.
                </p>

              )}

            </div>

          </article>

        </section>


        {/* ==================================================
            RELATIONSHIPS + CAREER
        ================================================== */}

        <section className="insight-detail-grid">

          {/* RELATIONSHIPS */}

          <article className="detail-card">

            <span className="detail-label">
              RELATIONSHIPS
            </span>

            <h2>
              Connection & emotions
            </h2>

            <p>
              {insight.relationships ||
                "Relationship insights will appear here."}
            </p>

          </article>


          {/* CAREER */}

          <article className="detail-card">

            <span className="detail-label">
              CAREER
            </span>

            <h2>
              Work & direction
            </h2>

            <p>
              {insight.career ||
                "Career insights will appear here."}
            </p>

          </article>

        </section>


        {/* ==================================================
            LIFE DIRECTION
        ================================================== */}

        <section className="life-direction-card">

          <div className="life-direction-icon">
            ✦
          </div>

          <div>

            <span className="detail-label">
              LIFE DIRECTION
            </span>

            <h2>
              Your path forward
            </h2>

            <p>
              {insight.life_direction ||
                "Your life direction insight will appear here."}
            </p>

          </div>

        </section>


        {/* ==================================================
            LIFE TRENDS
        ================================================== */}

        <section className="trends-section">

          <div className="trends-header">

            <div>

              <span className="section-label">
                YOUR JOURNEY
              </span>

              <h2>
                Life trends
              </h2>

            </div>

            <span className="trend-status">
              PERSONALIZED
            </span>

          </div>


          <div className="trend-grid">

            {/* CAREER */}

            <div className="trend-card">

              <span>
                Career
              </span>

              <div className="trend-line">

                <div
                  className="trend-progress"
                  style={{
                    width: `${careerScore}%`,
                  }}
                />

              </div>

              <div className="trend-score">
                {careerScore}%
              </div>

              <small>
                Based on your tarot topic, strengths
                and overall insight score.
              </small>

            </div>


            {/* RELATIONSHIPS */}

            <div className="trend-card">

              <span>
                Relationships
              </span>

              <div className="trend-line">

                <div
                  className="trend-progress"
                  style={{
                    width: `${relationshipScore}%`,
                  }}
                />

              </div>

              <div className="trend-score">
                {relationshipScore}%
              </div>

              <small>
                Based on relationship-related strengths
                and your overall insight score.
              </small>

            </div>


            {/* PERSONAL GROWTH */}

            <div className="trend-card">

              <span>
                Personal Growth
              </span>

              <div className="trend-line">

                <div
                  className="trend-progress"
                  style={{
                    width: `${growthScore}%`,
                  }}
                />

              </div>

              <div className="trend-score">
                {growthScore}%
              </div>

              <small>
                Based on resilience, reflection,
                adaptability and self-awareness.
              </small>

            </div>

          </div>

        </section>


        {/* ==================================================
            RECOMMENDATIONS
        ================================================== */}

        <section className="recommendations-section">

          <div className="recommendations-header">

            <span className="section-label">
              PERSONAL GUIDANCE
            </span>

            <h2>
              Recommendations
            </h2>

            <p>
              Simple reflection prompts based on your
              latest symbolic reading journey.
            </p>

          </div>


          <div className="recommendation-grid">

            {recommendations.length > 0 ? (

              recommendations.map(
                (recommendation, index) => (

                  <div
                    className="recommendation-card"
                    key={index}
                  >

                    <span className="recommendation-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <p>
                      {recommendation}
                    </p>

                  </div>

                )
              )

            ) : (

              <div className="recommendation-card">

                <span className="recommendation-number">
                  01
                </span>

                <p>
                  Complete more readings to receive
                  personalized reflection prompts.
                </p>

              </div>

            )}

          </div>

        </section>


        {/* ==================================================
            DISCLAIMER
        ================================================== */}

        <p className="insights-disclaimer">

          ✦{" "}
          {data.disclaimer ||
            "For self-reflection and entertainment purposes. Insights are symbolic interpretations and should not be treated as professional advice."}

        </p>

      </main>
    </>
  );
}

export default Insights;