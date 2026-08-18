import Navbar from "../components/Navbar";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">
      <Navbar />

      <main className="home-content">

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-content">
          <div className="hero-badge">
            ✦ INTELLIGENT SELF-DISCOVERY PLATFORM
          </div>

          <h1>
            Discover Your
            <span> Inner Path</span>
          </h1>

          <p className="hero-description">
            Explore symbolic insights through palmistry and tarot,
            enhanced with intelligent interpretation and personalized
            guidance.
          </p>

          <div className="hero-buttons">
            <a href="#register" className="primary-button">
              Start Your Reading →
            </a>

            <a href="#features" className="secondary-button">
              Explore Features
            </a>
          </div>

          <p className="hero-note">
            ✦ For self-reflection and entertainment purposes
          </p>
        </div>

        <div className="hero-visual">
          <div className="symbol-card palm-symbol">
            <span>✋</span>
            <small>Palmistry</small>
          </div>

          <div className="center-symbol">
            ✦
          </div>

          <div className="symbol-card tarot-symbol">
            <span>🃏</span>
            <small>Tarot</small>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section" id="how-it-works">
        <div className="section-heading">
          <span>HOW IT WORKS</span>

          <h2>
            Your journey to
            <br />
            <strong>personal insight</strong>
          </h2>

          <p>
            A simple experience that brings palmistry, tarot and
            intelligent insights together.
          </p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">✋</div>
            <h3>Share Your Palm</h3>
            <p>
              Upload a clear palm image for analysis of major
              palm lines.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">🃏</div>
            <h3>Explore Tarot</h3>
            <p>
              Choose a reading type and explore symbolic tarot
              card meanings.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">✨</div>
            <h3>Receive Insights</h3>
            <p>
              Explore interpretations, recommendations and
              personal trends.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-heading">
          <span>EXPLORE THE PLATFORM</span>

          <h2>
            One platform,
            <br />
            <strong>multiple perspectives</strong>
          </h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">✋</div>
            <h3>Palm Analysis</h3>
            <p>
              Explore symbolic interpretations of major palm
              lines.
            </p>
            <a href="#palm">Explore Palmistry →</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🃏</div>
            <h3>Tarot Reading</h3>
            <p>
              Explore tarot cards and their traditional
              meanings.
            </p>
            <a href="#tarot">Explore Tarot →</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Intelligent Insights</h3>
            <p>
              Combine reading information into personalized
              self-reflection insights.
            </p>
            <a href="#insights">Explore Insights →</a>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="cta-section">
        <div className="cta-content">
          <span>READY TO BEGIN?</span>

          <h2>
            Start exploring your
            <br />
            personal journey.
          </h2>

          <p>
            Discover palmistry, tarot and intelligent
            self-reflection in one place.
          </p>

          <a href="#register" className="primary-button">
            Create Your Account →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            <div className="footer-logo">
              ✦ P&T Intelligence
            </div>

            <p>
              Palmistry & Tarot Intelligence Platform
            </p>
          </div>

          <div className="footer-links">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 Palmistry & Tarot Intelligence Platform.
          For self-reflection and entertainment purposes.
        </div>
            </footer>
      </main>
    </div>
  );
}

export default Home;