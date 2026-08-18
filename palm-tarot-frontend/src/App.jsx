import { useEffect, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Hand,
  Layers3,
  Menu,
  Moon,
  Sparkles,
  Stars,
  UserRound,
  X,
} from "lucide-react";

import PalmAnalysis from "./components/PalmAnalysis";
import TarotReading from "./components/TarotReading";
import AuthPage from "./components/AuthPage";
import ProfilePage from "./components/ProfilePage";
import HistoryPage from "./components/HistoryPage";

import "./App.css";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);

  // Restore the login session after a refresh.
  useEffect(() => {
    const storedUser = localStorage.getItem("arcana_user");
    const token = localStorage.getItem("arcana_access_token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("arcana_user");
        localStorage.removeItem("arcana_access_token");
      }
    }
  }, []);

  const goTo = (target) => {
    setMenuOpen(false);
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const requireAuth = (target) => {
    if (!user) {
      setPage("auth");
      return;
    }

    goTo(target);
  };

  const handleAuthenticated = (authenticatedUser) => {
    setUser(authenticatedUser);
    goTo("home");
  };

  const logout = () => {
    localStorage.removeItem("arcana_access_token");
    localStorage.removeItem("arcana_user");
    setUser(null);
    goTo("home");
  };

  if (page === "auth") {
    return (
      <AuthPage
        onAuthenticated={handleAuthenticated}
        onBack={() => goTo("home")}
      />
    );
  }

  if (page === "palm") {
    return (
      <PalmAnalysis
        onBack={() => setPage("home")}
        onTarot={() => requireAuth("tarot")}
      />
    );
  }

  if (page === "tarot") {
    return (
      <TarotReading
        onBack={() => setPage("home")}
      />
    );
  }

  if (page === "history") {
    return (
      <HistoryPage
        onBack={() => goTo("home")}
      />
    );
  }

  if (page === "profile") {
    return (
      <ProfilePage
        user={user}
        onBack={() => goTo("home")}
        onLogout={logout}
      />
    );
  }

  return (
    <div className="app">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <nav className="navbar">
        <button
          className="brand"
          onClick={() => goTo("home")}
        >
          <div className="brand-icon">
            <Moon size={21} />
          </div>

          <div>
            <h2>Arcana AI</h2>
            <span>Palmistry & Tarot Intelligence</span>
          </div>
        </button>

        <div className="nav-links">
          <a href="#home">
            Home
          </a>

          <a
            href="#readings"
            onClick={(event) => {
              event.preventDefault();
              requireAuth("history");
            }}
          >
            Readings
          </a>

          <a href="#how-it-works">
            How it works
          </a>

          <a href="#about">
            About
          </a>

          {user ? (
            <>
              <button
                className="nav-profile-button"
                onClick={() => goTo("profile")}
              >
                <UserRound size={15} />
                {user.name}
              </button>

              <button
                className="nav-button"
                onClick={logout}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                className="nav-secondary-button"
                onClick={() => goTo("auth")}
              >
                Sign in
              </button>

              <button
                className="nav-button"
                onClick={() => requireAuth("tarot")}
              >
                Start Reading
              </button>
            </>
          )}
        </div>

        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        {menuOpen && (
          <div className="mobile-menu">
            <a
              href="#home"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </a>

            <a
              href="#readings"
              onClick={(event) => {
                event.preventDefault();
                requireAuth("history");
              }}
            >
              Readings
            </a>

            <a
              href="#how-it-works"
              onClick={() => setMenuOpen(false)}
            >
              How it works
            </a>

            <a
              href="#about"
              onClick={() => setMenuOpen(false)}
            >
              About
            </a>

            {user ? (
              <>
                <button
                  onClick={() => goTo("profile")}
                >
                  Profile
                </button>

                <button onClick={logout}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => goTo("auth")}
                >
                  Sign in
                </button>

                <button
                  onClick={() => requireAuth("tarot")}
                >
                  Start Reading
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      <main id="home" className="hero">
        <div className="hero-badge">
          <Sparkles size={15} />
          AI-powered spiritual intelligence
        </div>

        <h1>
          Discover the stories
          <br />
          <span>written within you.</span>
        </h1>

        <p className="hero-description">
          Arcana AI brings palm analysis and Tarot intelligence together
          with computer vision, structured symbolism, and generative AI
          to create personalized insights for reflection, growth, and
          discovery.
        </p>

        <div className="hero-buttons">
          <button
            className="primary-button"
            onClick={() => requireAuth("tarot")}
          >
            Begin your reading
            <ArrowRight size={18} />
          </button>

          <a
            href="#about"
            className="secondary-button"
          >
            Explore Arcana AI
          </a>
        </div>

        {/* =====================================================
            WELCOME BACK
        ====================================================== */}

        {user && (
          <div className="auth-welcome">
            <span>WELCOME BACK</span>
            <strong>{user.name}</strong>
          </div>
        )}

        <div className="hero-proof">
          <span>
            <CheckCircle2 size={14} />
            Palm intelligence
          </span>

          <span>
            <CheckCircle2 size={14} />
            78-card Tarot knowledge
          </span>

          <span>
            <CheckCircle2 size={14} />
            Generative AI interpretation
          </span>
        </div>

        <section
          id="about"
          className="intro-section"
        >
          <div className="section-kicker">
            <Sparkles size={14} />
            WHAT IS ARCANA AI?
          </div>

          <div className="intro-grid">
            <div>
              <h2>
                Ancient symbolism.
                <br />
                <span>Modern intelligence.</span>
              </h2>
            </div>

            <div className="intro-copy">
              <p>
                Arcana AI is an intelligent palmistry and Tarot platform
                designed to turn symbolic inputs into meaningful,
                personalized reflection.
              </p>

              <p>
                Palm images can be processed for visible characteristics,
                while Tarot readings use a structured 78-card knowledge
                base. Generative AI then transforms that context into an
                easy-to-understand interpretation.
              </p>
            </div>
          </div>
        </section>

        <section
          id="readings"
          className="readings-section"
        >
          <div className="section-heading">
            <div>
              <div className="section-kicker">
                <Stars size={14} />
                EXPLORE YOUR PATH
              </div>

              <h2>Two ways to begin.</h2>
            </div>

            <p>
              Choose the experience that matches what you want to explore.
            </p>
          </div>

          <div className="reading-grid">
            <article className="reading-card">
              <div className="card-top">
                <div className="card-icon">
                  <Hand size={31} />
                </div>

                <span className="card-number">
                  01
                </span>
              </div>

              <div className="card-content">
                <p className="eyebrow">
                  PALM INTELLIGENCE
                </p>

                <h3>Palm Analysis</h3>

                <p>
                  Upload a clear palm photograph and let the analysis
                  engine process visible palm characteristics to prepare
                  personalized, reflective insights.
                </p>

                <button
                  className="card-action"
                  onClick={() => requireAuth("palm")}
                >
                  Analyze my palm
                  <ArrowRight size={18} />
                </button>
              </div>
            </article>

            <article className="reading-card tarot-card">
              <div className="card-top">
                <div className="card-icon">
                  <Stars size={31} />
                </div>

                <span className="card-number">
                  02
                </span>
              </div>

              <div className="card-content">
                <p className="eyebrow">
                  TAROT INTELLIGENCE
                </p>

                <h3>Tarot Reading</h3>

                <p>
                  Bring a question to the cards. Arcana AI draws a
                  three-card Past, Present, and Future spread and creates
                  a contextual AI-generated interpretation.
                </p>

                <button
                  className="card-action"
                  onClick={() => requireAuth("tarot")}
                >
                  Begin Tarot reading
                  <ArrowRight size={18} />
                </button>
              </div>
            </article>
          </div>
        </section>

        <section
          id="how-it-works"
          className="workflow-section"
        >
          <div className="section-heading centered">
            <div>
              <div className="section-kicker">
                <Layers3 size={14} />
                HOW IT WORKS
              </div>

              <h2>From input to insight.</h2>
            </div>

            <p>
              A simple experience backed by multiple intelligence layers.
            </p>
          </div>

          <div className="workflow-grid">
            <article className="workflow-step">
              <span>01</span>

              <div className="workflow-icon">
                <Hand size={21} />
              </div>

              <h3>Provide your input</h3>

              <p>
                Upload a palm image or bring a question to start your
                reading.
              </p>
            </article>

            <article className="workflow-step">
              <span>02</span>

              <div className="workflow-icon">
                <BrainCircuit size={21} />
              </div>

              <h3>Process the signals</h3>

              <p>
                Computer vision and structured Tarot knowledge prepare
                the relevant information for interpretation.
              </p>
            </article>

            <article className="workflow-step">
              <span>03</span>

              <div className="workflow-icon">
                <Sparkles size={21} />
              </div>

              <h3>Generate your insight</h3>

              <p>
                Generative AI turns the available context into clear,
                personalized reflective guidance.
              </p>
            </article>
          </div>
        </section>

        <section className="intelligence-section">
          <div className="intelligence-copy">
            <div className="section-kicker">
              <BrainCircuit size={14} />
              THE INTELLIGENCE LAYER
            </div>

            <h2>
              Symbolism meets
              <span> intelligent interpretation.</span>
            </h2>

            <p>
              Arcana AI is designed around a combination of specialized
              components rather than a single black-box experience.
            </p>
          </div>

          <div className="intelligence-list">
            <div>
              <strong>Computer Vision</strong>
              <span>Visible palm characteristics</span>
            </div>

            <div>
              <strong>Tarot Knowledge</strong>
              <span>Structured 78-card dataset</span>
            </div>

            <div>
              <strong>Generative AI</strong>
              <span>Contextual interpretation</span>
            </div>

            <div>
              <strong>Personalized Output</strong>
              <span>Readable reflective guidance</span>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="final-orbit orbit-one" />
          <div className="final-orbit orbit-two" />

          <div className="section-kicker">
            <Sparkles size={14} />
            YOUR STORY. YOUR REFLECTION.
          </div>

          <h2>
            Ready to explore
            <span> what lies within?</span>
          </h2>

          <p>
            Start with your palm or ask the cards a question.
          </p>

          <button
            className="primary-button"
            onClick={() => requireAuth("tarot")}
          >
            Start your reading
            <ArrowRight size={18} />
          </button>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <Moon size={18} />
          <span>Arcana AI</span>
        </div>

        <p>
          Palmistry & Tarot Intelligence Platform
        </p>
      </footer>
    </div>
  );
}

export default App;