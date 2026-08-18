import "../styles/AboutOracle.css";

function AboutOracle({ goHome }) {
  return (
    <div className="aboutPage">

      <button className="aboutBackBtn" onClick={goHome}>
        ← Back to Home
      </button>

      <div className="aboutContent">

        <h1 className="aboutTitle">
          What is Oracle?
        </h1>

        <p className="aboutIntro">
          Oracle is an AI-powered platform that combines traditional
          palmistry and tarot practices with modern artificial intelligence
          to create personalized readings and reflective guidance.
        </p>

        <div className="aboutCards">

          <div className="aboutCard">
            <h2>✦ Palm Analysis</h2>
            <p>
              Upload an image of your palm and our analysis system identifies
              important palm lines and features. These observations are then
              transformed into a structured interpretation designed to help
              you explore themes related to personality, emotions and life
              patterns.
            </p>
          </div>

          <div className="aboutCard">
            <h2>✦ Tarot Reading</h2>
            <p>
              Explore a personalized tarot reading through a digital card
              selection process. Cards are randomly selected and interpreted
              according to their meanings, orientation and the context of
              your question.
            </p>
          </div>

          <div className="aboutCard">
            <h2>✦ AI Interpretation</h2>
            <p>
              Artificial intelligence transforms the structured results into
              natural-language interpretations, making the reading easier
              to understand and more personalized to the user's question.
            </p>
          </div>

          <div className="aboutCard">
            <h2>✦ Reflective Guidance</h2>
            <p>
              Oracle is designed as a tool for reflection and self-exploration.
              Its readings are not intended to predict the future or replace
              professional advice. Instead, they provide perspectives that
              users can reflect upon in their own lives.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default AboutOracle;