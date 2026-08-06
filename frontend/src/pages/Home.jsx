import { Link } from "react-router-dom";
import hero from "../assets/hero.png";

function Home() {
  return (
    <div className="home">

      {/* Hero Section */}

      <section className="hero">

        <div className="hero-content">

          <h1>
            AI Palmistry & Tarot
            <br />
            Intelligence Platform
          </h1>

          <p>
            Discover insights about yourself using Computer Vision,
            Artificial Intelligence and Tarot Reading.
            Upload your palm, draw tarot cards, or combine both
            for a complete AI-powered spiritual guidance experience.
          </p>

          <div className="hero-buttons">

            <Link to="/palm-reading">
              <button className="primary-btn">
                Palm Reading
              </button>
            </Link>

            <Link to="/tarot-reading">
              <button className="secondary-btn">
                Tarot Reading
              </button>
            </Link>

          </div>

        </div>

        <div className="hero-image">

          <img
            src={hero}
            alt="Hero"
          />

        </div>

      </section>

      {/* Features */}

      <section className="features">

        <h2>Our Features</h2>

        <div className="feature-grid">

          <div className="feature-card">

            <div className="feature-icon">
              🖐
            </div>

            <h3>Palm Reading</h3>

            <p>
              Upload your palm image and let our AI detect
              palm lines, analyze them and generate
              personalized interpretations.
            </p>

            <Link to="/palm-reading">
              <button>
                Try Now
              </button>
            </Link>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              🔮
            </div>

            <h3>Tarot Reading</h3>

            <p>
              Draw a Single Card or a Three Card Spread
              and receive AI-generated tarot interpretations
              with downloadable reports.
            </p>

            <Link to="/tarot-reading">
              <button>
                Explore
              </button>
            </Link>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              ✨
            </div>

            <h3>Combined Reading</h3>

            <p>
              Merge Palmistry and Tarot Reading into one
              powerful AI guidance report and download
              a professional PDF.
            </p>

            <Link to="/combined-reading">
              <button>
                Start
              </button>
            </Link>

          </div>

        </div>

      </section>

      {/* About Section */}

      <section className="about-home">

        <h2>Why Choose Our Platform?</h2>

        <p>
          This project combines Computer Vision,
          Artificial Intelligence,
          Large Language Models,
          and Tarot Intelligence
          into one modern platform.
          It provides palm analysis,
          tarot guidance,
          and an integrated reading,
          all with downloadable PDF reports.
        </p>

      </section>

    </div>
  );
}

export default Home;