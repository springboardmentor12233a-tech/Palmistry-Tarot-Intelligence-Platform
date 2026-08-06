import { useState } from "react";
import { generateInterpretation } from "./services/api";
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

function App() {
  const [formData, setFormData] = useState({
    name: "Ankita Pagare",
    age_group: "18-25",
    interests: "Career, Education, Personal Growth",
    spiritual_goal: "Improve study focus and personal growth",
    reading_preference: "Detailed",
    question: "What should I focus on most in my studies right now?",
    category: "Career",
    heart_line: "short",
    head_line: "long",
    life_line: "long",
  });

  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    setResult(null);

    const interestsList = formData.interests
      .split(",")
      .map((interest) => interest.trim())
      .filter(Boolean);

    const readingData = {
      user_profile: {
        name: formData.name,
        age_group: formData.age_group,
        interests: interestsList,
        spiritual_goal: formData.spiritual_goal,
        reading_preference: formData.reading_preference,
      },
      reading_context: {
        question: formData.question,
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

    try {
      const response = await generateInterpretation(readingData);
      setResult(response.interpretation);
    } catch (error) {
      console.error("Frontend error:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <p className="eyebrow">AI-POWERED SPIRITUAL GUIDANCE</p>

        <h1>Palmistry & Tarot Intelligence Platform</h1>

        <p className="hero-description">
          Generate a personalized interpretation using palm findings, tarot
          cards and Gemini through the FastAPI backend.
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
                  value={formData.name}
                  onChange={handleChange}
                  minLength="2"
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
                  <option value="Relationship">Relationship</option>
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
                rows="3"
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
                rows="4"
                minLength="3"
                required
              />
            </div>
          </section>

          <section className="form-section">
            <h3>Palm Analysis Results</h3>

            <p className="section-note">
              These values currently come from the Milestone 2 palm-analysis
              prototype.
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

            <div className="tarot-grid">
              {sampleTarotCards.map((card) => (
                <article className="tarot-card" key={card.position}>
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
              ? "Generating Interpretation..."
              : "Generate AI Interpretation"}
          </button>

          {errorMessage && (
            <div className="error-message">
              <strong>Generation failed</strong>
              <p>{errorMessage}</p>
            </div>
          )}
        </form>

        {result && (
          <section className="result-section">
            <p className="eyebrow">PERSONALIZED RESULT</p>
            <h2>AI Interpretation</h2>

            <article className="result-card">
              <h3>Overall Summary</h3>
              <p>{result.overall_summary}</p>
            </article>

            <div className="result-grid">
              <article className="result-card">
                <h3>Palm Interpretation</h3>
                <p>{result.palm_interpretation}</p>
              </article>

              <article className="result-card">
                <h3>Tarot Interpretation</h3>
                <p>{result.tarot_interpretation}</p>
              </article>
            </div>

            <article className="result-card">
              <h3>Combined Interpretation</h3>
              <p>{result.combined_interpretation}</p>
            </article>

            <div className="result-grid">
              <article className="result-card">
                <h3>Key Strengths</h3>

                <ul>
                  {result.key_strengths.map((strength, index) => (
                    <li key={`${strength}-${index}`}>{strength}</li>
                  ))}
                </ul>
              </article>

              <article className="result-card">
                <h3>Growth Areas</h3>

                <ul>
                  {result.growth_areas.map((area, index) => (
                    <li key={`${area}-${index}`}>{area}</li>
                  ))}
                </ul>
              </article>
            </div>

            <article className="result-card">
              <h3>Current Focus</h3>
              <p>{result.current_focus}</p>
            </article>

            <article className="result-card">
              <h3>Key Message</h3>
              <p>{result.key_message}</p>
            </article>

            <article className="result-card">
              <h3>Reflection Question</h3>
              <p>{result.reflection_question}</p>
            </article>

            <p className="disclaimer">{result.disclaimer}</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;