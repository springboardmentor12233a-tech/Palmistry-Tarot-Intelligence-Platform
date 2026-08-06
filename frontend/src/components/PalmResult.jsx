import api from "../services/api";

function PalmResult({ result }) {
  if (!result) return null;

  return (
    <div className="result-card">

      <h2>Palm Analysis Result</h2>

      {result.annotated_image_url && (
        <div className="annotated-section">

          <img
            src={
              api.defaults.baseURL +
              result.annotated_image_url
            }
            alt="Annotated Palm"
            className="annotated-image"
          />

        </div>
      )}

      <div className="reading-box">

        <h3>AI Interpretation</h3>

        <p>
          {result.reading}
        </p>

      </div>

      {result.pdf_url && (

        <a
          href={
            api.defaults.baseURL +
            result.pdf_url
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="download-btn">
            📄 Download Palm Report
          </button>
        </a>

      )}

    </div>
  );
}

export default PalmResult;