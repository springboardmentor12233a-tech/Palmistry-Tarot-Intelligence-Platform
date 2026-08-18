import "../styles/Landingpage.css";
import Navbar from "../components/Navbar";

function LandingPage({
  enterOracle,
  goToAbout,
  goToAboutPalm,
  goToAboutTarot,
  goToCompare,
  goToDailyQuestion,
  goToAIInsights,
  goToOverview,
  goToReadings,
  goToOracleJourney
}) {
  return (
    <div className="landing">

      <Navbar
        goHome={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth"
          })
        }

        goToLogin={enterOracle}

        goToAbout={goToAbout}
        goToAboutPalm={goToAboutPalm}
        goToAboutTarot={goToAboutTarot}

        goToCompare={goToCompare}
        goToDailyQuestion={goToDailyQuestion}
        goToAIInsights={goToAIInsights}
        goToOverview={goToOverview}
        goToReadings={goToReadings}
        goToOracleJourney={goToOracleJourney}
      />

      <div className="overlay">

        <h1 className="title">
          Mystical Palm & Tarot
        </h1>

        <p className="subtitle">
          Discover the hidden stories written in your palm
          and the wisdom revealed through tarot cards.
        </p>

        <div className="buttons">

          <button
            className="goldButton"
            onClick={enterOracle}
          >
            Enter the Oracle
          </button>

        </div>

      </div>

    </div>
  );
}

export default LandingPage;
