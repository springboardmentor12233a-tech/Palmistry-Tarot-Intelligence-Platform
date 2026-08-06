import { useState } from "react";
import { generateCompleteReading } from "./services/api";
import "./App.css";

const sampleTarotCards = [
  {
    position: "Past",
    name: "The Empress",
    orientation: "upright",
    keywords: ["growth", "creativity", "support"],
    selected_meaning: "A period of growth and support.",
  },
  {
    position: "Present",
    name: "Judgement",
    orientation: "upright",
    keywords: ["evaluation", "decision", "awakening"],
    selected_meaning:
      "A time for honest evaluation and important decisions.",
  },
  {
    position: "Future",
    name: "Seven of Wands",
    orientation: "reversed",
    keywords: ["pressure", "self-doubt", "exhaustion"],
    selected_meaning:
      "Avoid becoming overwhelmed or losing confidence.",
  },
];

function SafeList({
  items,
  emptyMessage = "No items were returned.",
  itemKeyPrefix = "item",
}) {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <ul>
        <li>{emptyMessage}</li>
      </ul>
    );
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={`${itemKeyPrefix}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function ScoreCard({ title, value }) {
  const numericValue = Number(value);
  const formattedValue = Number.isFinite(numericValue)
    ? numericValue.toFixed(2)
    : "0.00";

  return (
    <article className="result-card">
      <h3>{title}</h3>
      <p>
        <strong>{formattedValue} / 100</strong>
      </p>
    </article>
  );
}

function App() {
  const [formData, setFormData] = useState({
    name: "Ankita Pagare",
    age_group: "18-25",
    interests: "Career, Education, Personal Growth",
    spiritual_goal: "Improve study focus and personal growth",
    reading_preference: "Detailed",
    question:
      "What should I focus on most in my studies right now?",
    category: "Career",
    heart_line: "short",
    head_line: "long",
    life_line: "long",
  });

  const [interpretationResult, setInterpretationResult] =
    useState(null);

  const [personalityResult, setPersonalityResult] =
    useState(null);

  const [recommendationResult, setRecommendationResult] =
    useState(null);

  const [trendResult, setTrendResult] = useState(null);

  const [scoreResult, setScoreResult] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const clearPreviousResults = () => {
    setInterpretationResult(null);
    setPersonalityResult(null);
    setRecommendationResult(null);
    setTrendResult(null);
    setScoreResult(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");
    clearPreviousResults();

    const interestsList = formData.interests
      .split(",")
      .map((interest) => interest.trim())
      .filter(Boolean);

    const readingData = {
      user_profile: {
        name: formData.name.trim(),
        age_group: formData.age_group,
        interests: interestsList,
        spiritual_goal: formData.spiritual_goal.trim(),
        reading_preference: formData.reading_preference,
      },

      reading_context: {
        question: formData.question.trim(),
        category: formData.category,
      },

      palm_analysis: {
        heart_line: formData.heart_line,
        head_line: formData.head_line,
        life_line: formData.life_line,
      },

      tarot_analysis: {
        spread: "Past-Present-Future",
        cards: sampleTarotCards,
      },
    };

    console.log("COMPLETE READING REQUEST:", readingData);

    try {
      const response = await generateCompleteReading(readingData);

      console.log("COMPLETE READING RESPONSE:", response);

      if (!response || typeof response !== "object") {
        throw new Error(
          "The backend returned an invalid response."
        );
      }

      const reading = response?.reading;
      const scores = response?.scores;

      if (!reading || typeof reading !== "object") {
        throw new Error(
          "The complete reading was missing from the backend response."
        );
      }

      if (
        !reading.interpretation ||
        !reading.personality ||
        !reading.recommendations ||
        !reading.trends
      ) {
        throw new Error(
          "One or more reading modules were missing from the response."
        );
      }

      setInterpretationResult(reading.interpretation);
      setPersonalityResult(reading.personality);
      setRecommendationResult(reading.recommendations);
      setTrendResult(reading.trends);

      if (scores && typeof scores === "object") {
        setScoreResult(scores);
      }
    } catch (error) {
      console.error("COMPLETE READING ERROR:", error);

      setErrorMessage(
        error?.message ||
          "The complete personalized reading could not be generated."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const hasResults =
    interpretationResult ||
    personalityResult ||
    recommendationResult ||
    trendResult ||
    scoreResult;

  return (
    <div className="app">
      <header className="hero">
        <p className="eyebrow">
          AI-POWERED SPIRITUAL GUIDANCE
        </p>

        <h1>Palmistry & Tarot Intelligence Platform</h1>

        <p className="hero-description">
          Generate one complete personalized reading containing
          palm and tarot interpretation, personality intelligence,
          recommendations, life trends and guidance scores.
        </p>
      </header>

      <main>
        <form className="reading-form" onSubmit={handleSubmit}>
          <h2>Create Personalized Reading</h2>

          <section className="form-section">
            <h3>User Profile</h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Name</label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="age_group">Age group</label>

                <select
                  id="age_group"
                  name="age_group"
                  value={formData.age_group}
                  onChange={handleChange}
                >
                  <option value="Under 18">Under 18</option>
                  <option value="18-25">18-25</option>
                  <option value="26-40">26-40</option>
                  <option value="41-60">41-60</option>
                  <option value="60+">60+</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="reading_preference">
                  Reading preference
                </label>

                <select
                  id="reading_preference"
                  name="reading_preference"
                  value={formData.reading_preference}
                  onChange={handleChange}
                >
                  <option value="Concise">Concise</option>
                  <option value="Detailed">Detailed</option>
                  <option value="Practical">Practical</option>
                  <option value="Spiritual">Spiritual</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Career">Career</option>
                  <option value="Relationship">
                    Relationship
                  </option>
                  <option value="Personal Growth">
                    Personal Growth
                  </option>
                  <option value="General Guidance">
                    General Guidance
                  </option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="interests">
                Interests, separated by commas
              </label>

              <input
                id="interests"
                name="interests"
                type="text"
                value={formData.interests}
                onChange={handleChange}
                placeholder="Career, Education, Personal Growth"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="spiritual_goal">
                Personal or spiritual goal
              </label>

              <textarea
                id="spiritual_goal"
                name="spiritual_goal"
                value={formData.spiritual_goal}
                onChange={handleChange}
                rows={3}
                minLength={3}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="question">Question</label>

              <textarea
                id="question"
                name="question"
                value={formData.question}
                onChange={handleChange}
                rows={4}
                minLength={3}
                maxLength={500}
                required
              />
            </div>
          </section>

          <section className="form-section">
            <h3>Palm Analysis Results</h3>

            <p className="section-note">
              The current prototype supports only heart line,
              head line and life line results.
            </p>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="heart_line">Heart line</label>

                <select
                  id="heart_line"
                  name="heart_line"
                  value={formData.heart_line}
                  onChange={handleChange}
                >
                  <option value="short">Short</option>
                  <option value="long">Long</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="head_line">Head line</label>

                <select
                  id="head_line"
                  name="head_line"
                  value={formData.head_line}
                  onChange={handleChange}
                >
                  <option value="short">Short</option>
                  <option value="long">Long</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="life_line">Life line</label>

                <select
                  id="life_line"
                  name="life_line"
                  value={formData.life_line}
                  onChange={handleChange}
                >
                  <option value="short">Short</option>
                  <option value="long">Long</option>
                </select>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3>Tarot Cards</h3>

            <p className="section-note">
              These cards are currently sample input. They will
              later be replaced by the automatic tarot-card
              drawing engine.
            </p>

            <div className="tarot-grid">
              {sampleTarotCards.map((card) => (
                <article
                  className="tarot-card"
                  key={card.position}
                >
                  <span>{card.position}</span>
                  <h4>{card.name}</h4>
                  <p>{card.orientation}</p>
                </article>
              ))}
            </div>
          </section>

          <button
            className="generate-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading
              ? "Generating Complete Reading..."
              : "Generate Complete Reading"}
          </button>

          {errorMessage && (
            <div className="error-message" role="alert">
              <strong>Generation failed</strong>
              <p>{errorMessage}</p>
            </div>
          )}
        </form>

        {hasResults && (
          <section className="result-section">
            <p className="eyebrow">PERSONALIZED DASHBOARD</p>
            <h2>Complete Reading Results</h2>

            <article className="result-card">
              <h3>User Question</h3>
              <p>{formData.question}</p>
            </article>
          </section>
        )}

        {interpretationResult && (
          <section className="result-section">
            <p className="eyebrow">AI INTERPRETATION</p>
            <h2>Combined Palm and Tarot Reading</h2>

            <article className="result-card">
              <h3>Overall Summary</h3>
              <p>
                {interpretationResult?.overall_summary ||
                  "No overall summary was returned."}
              </p>
            </article>

            <div className="result-grid">
              <article className="result-card">
                <h3>Palm Interpretation</h3>
                <p>
                  {interpretationResult?.palm_interpretation ||
                    "No palm interpretation was returned."}
                </p>
              </article>

              <article className="result-card">
                <h3>Tarot Interpretation</h3>
                <p>
                  {interpretationResult?.tarot_interpretation ||
                    "No tarot interpretation was returned."}
                </p>
              </article>
            </div>

            <article className="result-card">
              <h3>Combined Interpretation</h3>
              <p>
                {interpretationResult?.combined_interpretation ||
                  "No combined interpretation was returned."}
              </p>
            </article>

            <div className="result-grid">
              <article className="result-card">
                <h3>Key Strengths</h3>

                <SafeList
                  items={interpretationResult?.key_strengths}
                  emptyMessage="No key strengths were returned."
                  itemKeyPrefix="interpretation-strength"
                />
              </article>

              <article className="result-card">
                <h3>Growth Areas</h3>

                <SafeList
                  items={interpretationResult?.growth_areas}
                  emptyMessage="No growth areas were returned."
                  itemKeyPrefix="interpretation-growth"
                />
              </article>
            </div>

            <article className="result-card">
              <h3>Current Focus</h3>
              <p>
                {interpretationResult?.current_focus ||
                  "No current focus was returned."}
              </p>
            </article>

            <article className="result-card">
              <h3>Key Message</h3>
              <p>
                {interpretationResult?.key_message ||
                  "No key message was returned."}
              </p>
            </article>

            <article className="result-card">
              <h3>Reflection Question</h3>
              <p>
                {interpretationResult?.reflection_question ||
                  "No reflection question was returned."}
              </p>
            </article>

            <p className="disclaimer">
              {interpretationResult?.disclaimer ||
                "This reading is intended for entertainment and personal reflection only."}
            </p>
          </section>
        )}

        {personalityResult && (
          <section className="result-section">
            <p className="eyebrow">
              PERSONALITY INTELLIGENCE
            </p>

            <h2>Symbolic Personality Profile</h2>

            <article className="result-card">
              <h3>Personality Summary</h3>
              <p>
                {personalityResult?.personality_summary ||
                  "No personality summary was returned."}
              </p>
            </article>

            <article className="result-card">
              <h3>Dominant Traits</h3>

              <SafeList
                items={personalityResult?.dominant_traits}
                emptyMessage="No dominant traits were returned."
                itemKeyPrefix="dominant-trait"
              />
            </article>

            <div className="result-grid">
              <article className="result-card">
                <h3>Emotional Style</h3>
                <p>
                  {personalityResult?.emotional_style ||
                    "No emotional style was returned."}
                </p>
              </article>

              <article className="result-card">
                <h3>Thinking Style</h3>
                <p>
                  {personalityResult?.thinking_style ||
                    "No thinking style was returned."}
                </p>
              </article>
            </div>

            <div className="result-grid">
              <article className="result-card">
                <h3>Decision Style</h3>
                <p>
                  {personalityResult?.decision_style ||
                    "No decision style was returned."}
                </p>
              </article>

              <article className="result-card">
                <h3>Relationship Style</h3>
                <p>
                  {personalityResult?.relationship_style ||
                    "No relationship style was returned."}
                </p>
              </article>
            </div>

            <div className="result-grid">
              <article className="result-card">
                <h3>Personality Strengths</h3>

                <SafeList
                  items={personalityResult?.strengths}
                  emptyMessage="No personality strengths were returned."
                  itemKeyPrefix="personality-strength"
                />
              </article>

              <article className="result-card">
                <h3>Development Areas</h3>

                <SafeList
                  items={personalityResult?.development_areas}
                  emptyMessage="No development areas were returned."
                  itemKeyPrefix="development-area"
                />
              </article>
            </div>

            <article className="result-card">
              <h3>Growth Advice</h3>

              <SafeList
                items={personalityResult?.growth_advice}
                emptyMessage="No growth advice was returned."
                itemKeyPrefix="growth-advice"
              />
            </article>

            <p className="disclaimer">
              This personality profile is a symbolic
              self-reflection output. It is not a scientific
              personality assessment or diagnosis.
            </p>
          </section>
        )}

        {recommendationResult && (
          <section className="result-section">
            <p className="eyebrow">
              PERSONALIZED RECOMMENDATIONS
            </p>

            <h2>Recommendation Engine</h2>

            <article className="result-card">
              <h3>Recommendation Summary</h3>
              <p>
                {recommendationResult?.recommendation_summary ||
                  "No recommendation summary was returned."}
              </p>
            </article>

            <div className="result-grid">
              <article className="result-card">
                <h3>Personal Growth</h3>

                <SafeList
                  items={recommendationResult?.personal_growth}
                  emptyMessage="No personal-growth recommendations were returned."
                  itemKeyPrefix="personal-growth"
                />
              </article>

              <article className="result-card">
                <h3>Career</h3>

                <SafeList
                  items={recommendationResult?.career}
                  emptyMessage="No career recommendations were returned."
                  itemKeyPrefix="career"
                />
              </article>
            </div>

            <div className="result-grid">
              <article className="result-card">
                <h3>Relationships</h3>

                <SafeList
                  items={recommendationResult?.relationships}
                  emptyMessage="No relationship recommendations were returned."
                  itemKeyPrefix="relationship"
                />
              </article>

              <article className="result-card">
                <h3>Goal Alignment</h3>

                <SafeList
                  items={recommendationResult?.goal_alignment}
                  emptyMessage="No goal-alignment recommendations were returned."
                  itemKeyPrefix="goal-alignment"
                />
              </article>
            </div>

            <article className="result-card">
              <h3>Spiritual Development</h3>

              <SafeList
                items={
                  recommendationResult?.spiritual_development
                }
                emptyMessage="No spiritual-development recommendations were returned."
                itemKeyPrefix="spiritual-development"
              />
            </article>

            <div className="result-grid">
              <article className="result-card">
                <h3>Immediate Actions</h3>

                <p className="section-note">
                  Suggested actions for the next seven days.
                </p>

                <SafeList
                  items={recommendationResult?.immediate_actions}
                  emptyMessage="No immediate actions were returned."
                  itemKeyPrefix="immediate-action"
                />
              </article>

              <article className="result-card">
                <h3>Long-Term Actions</h3>

                <p className="section-note">
                  Suggested actions for the next one to six
                  months.
                </p>

                <SafeList
                  items={recommendationResult?.long_term_actions}
                  emptyMessage="No long-term actions were returned."
                  itemKeyPrefix="long-term-action"
                />
              </article>
            </div>

            <p className="disclaimer">
              These recommendations are reflective guidance. They
              are not medical, legal, financial or professional
              advice.
            </p>
          </section>
        )}

        {trendResult && (
          <section className="result-section">
            <p className="eyebrow">LIFE TREND ANALYSIS</p>
            <h2>Symbolic Life Trends</h2>

            <article className="result-card">
              <h3>Trend Summary</h3>
              <p>
                {trendResult?.trend_summary ||
                  "No trend summary was returned."}
              </p>
            </article>

            <article className="result-card">
              <h3>Current Theme</h3>
              <p>
                {trendResult?.current_theme ||
                  "No current theme was returned."}
              </p>
            </article>

            <div className="result-grid">
              <article className="result-card">
                <h3>Possible Theme for the Next 30 Days</h3>
                <p>
                  {trendResult?.next_30_days ||
                    "No short-term theme was returned."}
                </p>
              </article>

              <article className="result-card">
                <h3>Possible Theme for the Next 3 Months</h3>
                <p>
                  {trendResult?.next_3_months ||
                    "No three-month theme was returned."}
                </p>
              </article>
            </div>

            <div className="result-grid">
              <article className="result-card">
                <h3>Opportunities</h3>

                <SafeList
                  items={trendResult?.opportunities}
                  emptyMessage="No opportunities were returned."
                  itemKeyPrefix="trend-opportunity"
                />
              </article>

              <article className="result-card">
                <h3>Challenges</h3>

                <SafeList
                  items={trendResult?.challenges}
                  emptyMessage="No challenges were returned."
                  itemKeyPrefix="trend-challenge"
                />
              </article>
            </div>

            <div className="result-grid">
              <article className="result-card">
                <h3>Recommended Focus</h3>

                <SafeList
                  items={trendResult?.recommended_focus}
                  emptyMessage="No recommended focus was returned."
                  itemKeyPrefix="trend-focus"
                />
              </article>

              <article className="result-card">
                <h3>Practical Actions</h3>

                <SafeList
                  items={trendResult?.practical_actions}
                  emptyMessage="No practical actions were returned."
                  itemKeyPrefix="trend-action"
                />
              </article>
            </div>

            <p className="disclaimer">
              {trendResult?.disclaimer ||
                "Life trends are symbolic themes, not guaranteed predictions."}
            </p>
          </section>
        )}

        {scoreResult && (
          <section className="result-section">
            <p className="eyebrow">GUIDANCE SCORING</p>
            <h2>Reading Quality and Alignment Scores</h2>

            <div className="result-grid">
              <ScoreCard
                title="Palm Analysis Confidence"
                value={
                  scoreResult?.palm_analysis_confidence
                }
              />

              <ScoreCard
                title="Tarot Interpretation Relevance"
                value={
                  scoreResult?.tarot_interpretation_relevance
                }
              />
            </div>

            <div className="result-grid">
              <ScoreCard
                title="Personality Alignment"
                value={scoreResult?.personality_alignment}
              />

              <ScoreCard
                title="User-Context Relevance"
                value={scoreResult?.user_context_relevance}
              />
            </div>

            <div className="result-grid">
              <ScoreCard
                title="Reading Consistency"
                value={scoreResult?.reading_consistency}
              />

              <article className="result-card">
                <h3>Overall Insight Score</h3>

                <p>
                  <strong>
                    {Number(
                      scoreResult?.overall_insight_score || 0
                    ).toFixed(2)}{" "}
                    / 100
                  </strong>
                </p>

                <p>
                  {scoreResult?.score_label ||
                    "No score label was returned."}
                </p>
              </article>
            </div>

            <article className="result-card">
              <h3>Calculation Method</h3>
              <p>
                {scoreResult?.calculation_method ||
                  "No calculation method was returned."}
              </p>
            </article>

            <p className="disclaimer">
              {scoreResult?.disclaimer ||
                "These scores measure prototype completeness, relevance and consistency. They do not measure scientific accuracy."}
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;