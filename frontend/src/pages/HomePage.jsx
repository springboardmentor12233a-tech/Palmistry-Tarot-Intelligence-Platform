import "../styles/HomePage.css";

function HomePage({ goHome, goToPalm, goToTarot }) {
  return (
    <div className="oracle">

      <div className="oracleOverlay">

        <h1 className="oracleTitle">
          ✨ Choose Your Oracle ✨
        </h1>

        <p className="oracleSubtitle">
          Every palm holds a hidden story.
          Every tarot card reveals a new possibility.
          Choose your path and uncover your destiny.
        </p>

        <div className="oracleCards">

          {/* Palm Card */}

          <div className="oracleCard">

            <div className="icon">
              ✋
            </div>

            <h2>Palm Reading</h2>

            <p>
              Discover the secrets engraved within your palm through
              AI-powered palm line analysis and personalized interpretations.
            </p>

            <button
              className="oracleButton"
              onClick={goToPalm}
            >
              Begin Reading →
            </button>

          </div>

          {/* Tarot Card */}

          <div className="oracleCard">

            <div className="icon">
              🔮
            </div>

            <h2>Tarot Reading</h2>

            <p>
              Draw mystical tarot cards and receive thoughtful guidance
              with AI-generated interpretations and follow-up conversations.
            </p>

            <button
              className="oracleButton"
              onClick={goToTarot}
            >
              Begin Reading →
            </button>

          </div>

        </div>

        <button
          className="backButton"
          onClick={goHome}
        >
          ← Back to Home Page
        </button>

      </div>

    </div>
  );
}

export default HomePage;