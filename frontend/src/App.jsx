import { useState } from "react";
import {
  generateInterpretation,
  generatePersonality,
  generateRecommendations,
} from "./services/api";
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
  emptyMessage,
  itemKeyPrefix,
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
        <li key={`${itemKeyPrefix}-${index}`}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function App() {
  const [formData, setFormData] = useState({
    name: "Ankita Pagare",
    age_group: "18-25",
    interests: "Career, Education, Personal Growth",
    spiritual_goal:
      "Improve study focus and personal growth",
    reading_preference: "Detailed",
    question:
      "What should I focus on most in my studies right now?",
    category: "Career",
    heart_line: "short",
    head_line: "long",
    life_line: "long",
  });

  const [
    interpretationResult,
    setInterpretationResult,
  ] = useState(null);

  const [
    personalityResult,
    setPersonalityResult,
  ] = useState(null);

  const [
    recommendationResult,
    setRecommendationResult,
  ] = useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [warningMessage, setWarningMessage] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");
    setWarningMessage("");
    setInterpretationResult(null);
    setPersonalityResult(null);
    setRecommendationResult(null);

    const interestsList = formData.interests
      .split(",")
      .map((interest) => interest.trim())
      .filter(Boolean);

    const readingData = {
      user_profile: {
        name: formData.name.trim(),
        age_group: formData.age_group,
        interests: interestsList,
        spiritual_goal:
          formData.spiritual_goal.trim(),
        reading_preference:
          formData.reading_preference,
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

    console.log("REQUEST PAYLOAD:", readingData);

    try {
      const [
        interpretationResponse,
        personalityResponse,
        recommendationResponse,
      ] = await Promise.allSettled([
        generateInterpretation(readingData),
        generatePersonality(readingData),
        generateRecommendations(readingData),
      ]);

      const failedModules = [];

      if (
        interpretationResponse.status ===
        "fulfilled"
      ) {
        const response =
          interpretationResponse.value;

        const interpretation =
          response?.interpretation || response;

        if (
          interpretation &&
          typeof interpretation === "object"
        ) {
          setInterpretationResult(
            interpretation
          );
        } else {
          failedModules.push(
            "AI Interpretation returned an invalid response."
          );
        }
      } else {
        console.error(
          "Interpretation error:",
          interpretationResponse.reason
        );

        failedModules.push(
          `AI Interpretation: ${
            interpretationResponse.reason
              ?.message ||
            "Generation failed."
          }`
        );
      }

      if (
        personalityResponse.status ===
        "fulfilled"
      ) {
        const response =
          personalityResponse.value;

        const personality =
          response?.personality || response;

        if (
          personality &&
          typeof personality === "object"
        ) {
          setPersonalityResult(personality);
        } else {
          failedModules.push(
            "Personality Intelligence returned an invalid response."
          );
        }
      } else {
        console.error(
          "Personality error:",
          personalityResponse.reason
        );

        failedModules.push(
          `Personality Intelligence: ${
            personalityResponse.reason
              ?.message ||
            "Generation failed."
          }`
        );
      }

      if (
        recommendationResponse.status ===
        "fulfilled"
      ) {
        const response =
          recommendationResponse.value;

        const recommendations =
          response?.recommendations || response;

        if (
          recommendations &&
          typeof recommendations === "object"
        ) {
          setRecommendationResult(
            recommendations
          );
        } else {
          failedModules.push(
            "Recommendation Engine returned an invalid response."
          );
        }
      } else {
        console.error(
          "Recommendation error:",
          recommendationResponse.reason
        );

        failedModules.push(
          `Recommendation Engine: ${
            recommendationResponse.reason
              ?.message ||
            "Generation failed."
          }`
        );
      }

      const allFailed =
        interpretationResponse.status ===
          "rejected" &&
        personalityResponse.status ===
          "rejected" &&
        recommendationResponse.status ===
          "rejected";

      if (allFailed) {
        setErrorMessage(
          failedModules.join(" ")
        );
      } else if (failedModules.length > 0) {
        setWarningMessage(
          `${failedModules.join(
            " "
          )} The available results are shown below.`
        );
      }
    } catch (error) {
      console.error(
        "Frontend error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Failed to generate the personalized reading."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <p className="eyebrow">
          AI-POWERED SPIRITUAL GUIDANCE
        </p>

        <h1>
          Palmistry & Tarot Intelligence
          Platform
        </h1>

        <p className="hero-description">
          Generate a personalized interpretation,
          symbolic personality profile and practical
          recommendations using palm findings, tarot
          cards and Gemini through the FastAPI backend.
        </p>
      </header>

      <main>
        <form
          className="reading-form"
          onSubmit={handleSubmit}
        >
          <h2>Create Personalized Reading</h2>

          <section className="form-section">
            <h3>User Profile</h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  minLength={2}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="age_group">
                  Age group
                </label>

                <select
                  id="age_group"
                  name="age_group"
                  value={formData.age_group}
                  onChange={handleChange}
                >
                  <option value="Under 18">
                    Under 18
                  </option>
                  <option value="18-25">
                    18-25
                  </option>
                  <option value="26-40">
                    26-40
                  </option>
                  <option value="41-60">
                    41-60
                  </option>
                  <option value="60+">
                    60+
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="reading_preference">
                  Reading preference
                </label>

                <select
                  id="reading_preference"
                  name="reading_preference"
                  value={
                    formData.reading_preference
                  }
                  onChange={handleChange}
                >
                  <option value="Concise">
                    Concise
                  </option>
                  <option value="Detailed">
                    Detailed
                  </option>
                  <option value="Practical">
                    Practical
                  </option>
                  <option value="Spiritual">
                    Spiritual
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="category">
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Career">
                    Career
                  </option>
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
              <label htmlFor="question">
                Question
              </label>

              <textarea
                id="question"
                name="question"
                value={formData.question}
                onChange={handleChange}
                rows={4}
                minLength={3}
                required
              />
            </div>
          </section>

          <section className="form-section">
            <h3>Palm Analysis Results</h3>

            <p className="section-note">
              These values currently come from the
              Milestone 2 palm-analysis prototype.
            </p>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="heart_line">
                  Heart line
                </label>

                <select
                  id="heart_line"
                  name="heart_line"
                  value={formData.heart_line}
                  onChange={handleChange}
                >
                  <option value="short">
                    Short
                  </option>
                  <option value="long">
                    Long
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="head_line">
                  Head line
                </label>

                <select
                  id="head_line"
                  name="head_line"
                  value={formData.head_line}
                  onChange={handleChange}
                >
                  <option value="short">
                    Short
                  </option>
                  <option value="long">
                    Long
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="life_line">
                  Life line
                </label>

                <select
                  id="life_line"
                  name="life_line"
                  value={formData.life_line}
                  onChange={handleChange}
                >
                  <option value="short">
                    Short
                  </option>
                  <option value="long">
                    Long
                  </option>
                </select>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3>Tarot Cards</h3>

            <p className="section-note">
              These sample cards will later be
              replaced by the automatic tarot-card
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
              ? "Generating Personalized Reading..."
              : "Generate Personalized Reading"}
          </button>

          {errorMessage && (
            <div
              className="error-message"
              role="alert"
            >
              <strong>
                Generation failed
              </strong>
              <p>{errorMessage}</p>
            </div>
          )}

          {warningMessage && (
            <div
              className="error-message"
              role="status"
            >
              <strong>Partial result</strong>
              <p>{warningMessage}</p>
            </div>
          )}
        </form>

        {interpretationResult && (
          <section className="result-section">
            <p className="eyebrow">
              PERSONALIZED RESULT
            </p>

            <h2>AI Interpretation</h2>

            <article className="result-card">
              <h3>Overall Summary</h3>

              <p>
                {interpretationResult
                  ?.overall_summary ||
                  "No overall summary was returned."}
              </p>
            </article>

            <div className="result-grid">
              <article className="result-card">
                <h3>
                  Palm Interpretation
                </h3>

                <p>
                  {interpretationResult
                    ?.palm_interpretation ||
                    "No palm interpretation was returned."}
                </p>
              </article>

              <article className="result-card">
                <h3>
                  Tarot Interpretation
                </h3>

                <p>
                  {interpretationResult
                    ?.tarot_interpretation ||
                    "No tarot interpretation was returned."}
                </p>
              </article>
            </div>

            <article className="result-card">
              <h3>
                Combined Interpretation
              </h3>

              <p>
                {interpretationResult
                  ?.combined_interpretation ||
                  "No combined interpretation was returned."}
              </p>
            </article>

            <div className="result-grid">
              <article className="result-card">
                <h3>Key Strengths</h3>

                <SafeList
                  items={
                    interpretationResult
                      ?.key_strengths
                  }
                  emptyMessage="No key strengths were returned."
                  itemKeyPrefix="interpretation-strength"
                />
              </article>

              <article className="result-card">
                <h3>Growth Areas</h3>

                <SafeList
                  items={
                    interpretationResult
                      ?.growth_areas
                  }
                  emptyMessage="No growth areas were returned."
                  itemKeyPrefix="interpretation-growth"
                />
              </article>
            </div>

            <article className="result-card">
              <h3>Current Focus</h3>

              <p>
                {interpretationResult
                  ?.current_focus ||
                  "No current focus was returned."}
              </p>
            </article>

            <article className="result-card">
              <h3>Key Message</h3>

              <p>
                {interpretationResult
                  ?.key_message ||
                  "No key message was returned."}
              </p>
            </article>

            <article className="result-card">
              <h3>
                Reflection Question
              </h3>

              <p>
                {interpretationResult
                  ?.reflection_question ||
                  "No reflection question was returned."}
              </p>
            </article>

            <p className="disclaimer">
              {interpretationResult
                ?.disclaimer ||
                "This interpretation is intended for entertainment and personal reflection only."}
            </p>
          </section>
        )}

        {personalityResult && (
          <section className="result-section">
            <p className="eyebrow">
              PERSONALITY INTELLIGENCE
            </p>

            <h2>
              Symbolic Personality Profile
            </h2>

            <article className="result-card">
              <h3>Personality Summary</h3>

              <p>
                {personalityResult
                  ?.personality_summary ||
                  "No personality summary was returned."}
              </p>
            </article>

            <article className="result-card">
              <h3>Dominant Traits</h3>

              <SafeList
                items={
                  personalityResult
                    ?.dominant_traits
                }
                emptyMessage="No dominant traits were returned."
                itemKeyPrefix="dominant-trait"
              />
            </article>

            <div className="result-grid">
              <article className="result-card">
                <h3>Emotional Style</h3>

                <p>
                  {personalityResult
                    ?.emotional_style ||
                    "No emotional style was returned."}
                </p>
              </article>

              <article className="result-card">
                <h3>Thinking Style</h3>

                <p>
                  {personalityResult
                    ?.thinking_style ||
                    "No thinking style was returned."}
                </p>
              </article>
            </div>

            <div className="result-grid">
              <article className="result-card">
                <h3>Decision Style</h3>

                <p>
                  {personalityResult
                    ?.decision_style ||
                    "No decision style was returned."}
                </p>
              </article>

              <article className="result-card">
                <h3>
                  Relationship Style
                </h3>

                <p>
                  {personalityResult
                    ?.relationship_style ||
                    "No relationship style was returned."}
                </p>
              </article>
            </div>

            <div className="result-grid">
              <article className="result-card">
                <h3>
                  Personality Strengths
                </h3>

                <SafeList
                  items={
                    personalityResult
                      ?.strengths
                  }
                  emptyMessage="No personality strengths were returned."
                  itemKeyPrefix="personality-strength"
                />
              </article>

              <article className="result-card">
                <h3>
                  Development Areas
                </h3>

                <SafeList
                  items={
                    personalityResult
                      ?.development_areas
                  }
                  emptyMessage="No development areas were returned."
                  itemKeyPrefix="development-area"
                />
              </article>
            </div>

            <article className="result-card">
              <h3>Growth Advice</h3>

              <SafeList
                items={
                  personalityResult
                    ?.growth_advice
                }
                emptyMessage="No growth advice was returned."
                itemKeyPrefix="growth-advice"
              />
            </article>

            <p className="disclaimer">
              This personality profile uses
              palmistry and tarot as symbolic
              self-reflection tools. It is not a
              scientific personality assessment or
              medical diagnosis.
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
              <h3>
                Recommendation Summary
              </h3>

              <p>
                {recommendationResult
                  ?.recommendation_summary ||
                  "No recommendation summary was returned."}
              </p>
            </article>

            <div className="result-grid">
              <article className="result-card">
                <h3>Personal Growth</h3>

                <SafeList
                  items={
                    recommendationResult
                      ?.personal_growth
                  }
                  emptyMessage="No personal-growth recommendations were returned."
                  itemKeyPrefix="personal-growth"
                />
              </article>

              <article className="result-card">
                <h3>Career</h3>

                <SafeList
                  items={
                    recommendationResult?.career
                  }
                  emptyMessage="No career recommendations were returned."
                  itemKeyPrefix="career"
                />
              </article>
            </div>

            <div className="result-grid">
              <article className="result-card">
                <h3>Relationships</h3>

                <SafeList
                  items={
                    recommendationResult
                      ?.relationships
                  }
                  emptyMessage="No relationship recommendations were returned."
                  itemKeyPrefix="relationship"
                />
              </article>

              <article className="result-card">
                <h3>Goal Alignment</h3>

                <SafeList
                  items={
                    recommendationResult
                      ?.goal_alignment
                  }
                  emptyMessage="No goal-alignment recommendations were returned."
                  itemKeyPrefix="goal-alignment"
                />
              </article>
            </div>

            <article className="result-card">
              <h3>
                Spiritual Development
              </h3>

              <SafeList
                items={
                  recommendationResult
                    ?.spiritual_development
                }
                emptyMessage="No spiritual-development recommendations were returned."
                itemKeyPrefix="spiritual-development"
              />
            </article>

            <div className="result-grid">
              <article className="result-card">
                <h3>Immediate Actions</h3>

                <p className="section-note">
                  Actions for the next seven
                  days.
                </p>

                <SafeList
                  items={
                    recommendationResult
                      ?.immediate_actions
                  }
                  emptyMessage="No immediate actions were returned."
                  itemKeyPrefix="immediate-action"
                />
              </article>

              <article className="result-card">
                <h3>Long-Term Actions</h3>

                <p className="section-note">
                  Actions for the next one to
                  six months.
                </p>

                <SafeList
                  items={
                    recommendationResult
                      ?.long_term_actions
                  }
                  emptyMessage="No long-term actions were returned."
                  itemKeyPrefix="long-term-action"
                />
              </article>
            </div>

            <p className="disclaimer">
              These recommendations use
              palmistry and tarot as symbolic
              reflection tools. They are not
              medical, legal, financial or
              professional advice.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;