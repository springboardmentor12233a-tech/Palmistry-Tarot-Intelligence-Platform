import "../styles/AboutTarot.css";

function AboutTarot({ goHome }) {
  return (
    <div className="tarotInfoPage">

      <button className="tarotBackBtn" onClick={goHome}>
        ← Back to Home
      </button>

      <div className="tarotInfoContent">

        <h1 className="tarotInfoTitle">
          How Tarot Works
        </h1>

        <p className="tarotInfoIntro">
          Oracle combines a traditional tarot reading structure with
          AI-powered interpretation to create an interactive and
          personalized reading experience.
        </p>

        <div className="tarotSteps">

          <div className="tarotStep">
            <span>✦</span>

            <h2>01. Choose Your Question</h2>

            <p>
              Begin by entering a question or selecting a reading category.
              Your question provides context for the interpretation that
              follows.
            </p>
          </div>

          <div className="tarotStep">
            <span>◇</span>

            <h2>02. Select a Spread</h2>

            <p>
              Choose a tarot spread according to the type of reading you
              want. Different spreads provide different perspectives on
              your question.
            </p>
          </div>

          <div className="tarotStep">
            <span>♢</span>

            <h2>03. Draw the Cards</h2>

            <p>
              Cards are selected from the tarot deck through a randomized
              digital process, creating a unique combination for each
              reading.
            </p>
          </div>

          <div className="tarotStep">
            <span>☾</span>

            <h2>04. Card Orientation</h2>

            <p>
              Each selected card can appear upright or reversed. Its
              orientation is considered when determining the meaning used
              in the reading.
            </p>
          </div>

          <div className="tarotStep">
            <span>✧</span>

            <h2>05. AI Interpretation</h2>

            <p>
              The meanings of the selected cards are organized together
              with your question and spread to generate a coherent,
              conversational interpretation.
            </p>
          </div>

          <div className="tarotStep">
            <span>∞</span>

            <h2>06. Explore Your Reading</h2>

            <p>
              The final reading highlights themes and perspectives that
              you can use for personal reflection and exploration.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default AboutTarot;