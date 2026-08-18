import "../styles/AboutPalm.css";

function AboutPalm({ goHome }) {
  return (
    <div className="palmInfoPage">

      <button className="palmBackBtn" onClick={goHome}>
        ← Back to Home
      </button>

      <div className="palmInfoContent">

        <h1 className="palmInfoTitle">
          How Palmistry Works
        </h1>

        <p className="palmInfoIntro">
          Oracle uses computer vision and AI-assisted analysis to examine
          important features of a palm image and generate a structured
          palmistry interpretation.
        </p>

        <div className="palmSteps">

          <div className="palmStep">
            <span>✋</span>

            <h2>01. Upload Your Palm</h2>

            <p>
              Upload a clear image of your palm. A well-lit image with the
              major palm lines clearly visible provides better input for
              the analysis process.
            </p>
          </div>

          <div className="palmStep">
            <span>⌁</span>

            <h2>02. Palm Analysis</h2>

            <p>
              The analysis system examines the uploaded image and identifies
              important palm features, including the Heart Line, Head Line
              and Life Line.
            </p>
          </div>

          <div className="palmStep">
            <span>✦</span>

            <h2>03. AI Interpretation</h2>

            <p>
              The detected palm features are converted into structured
              information and passed through the AI interpretation system
              to generate an understandable reading.
            </p>
          </div>

          <div className="palmStep">
            <span>◈</span>

            <h2>04. Personalized Reading</h2>

            <p>
              The final interpretation presents the detected characteristics
              in a conversational format, allowing you to explore the
              themes associated with your palm reading.
            </p>
          </div>

          <div className="palmStep">
            <span>☾</span>

            <h2>05. Reflect & Explore</h2>

            <p>
              Use the reading as a starting point for personal reflection
              rather than as a fixed prediction of your future.
            </p>
          </div>

          <div className="palmStep">
            <span>✧</span>

            <h2>06. Save Your Reading</h2>

            <p>
              Your generated reading can be turned into a report so that
              you can revisit the interpretation whenever you want.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default AboutPalm;