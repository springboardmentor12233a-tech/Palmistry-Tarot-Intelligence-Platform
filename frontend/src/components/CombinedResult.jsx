import api from "../services/api";

function CombinedResult({ result }) {

  if (!result) return null;

  return (

    <div className="result-card">

      <h2>Combined Reading</h2>

      {/* Palm */}

      <h3>Palm Analysis</h3>

      <img
        src={`${api.defaults.baseURL}${result.annotated_image_url}`}
        alt="Palm"
        className="annotated-image"
      />

      <div className="reading-box">

        <p>

          {result.palm_reading}

        </p>

      </div>

      {/* Tarot */}

      <h3
        style={{
          marginTop: "40px",
        }}
      >
        Tarot Cards
      </h3>

      <div className="tarot-grid">

        {result.tarot_cards.map((card, index) => (

          <div
            className="tarot-card"
            key={index}
          >

            <img
              src={`${api.defaults.baseURL}/card-images/${card.image_filename}`}
              alt={card.name}
              className={`tarot-image ${
                card.reversed ? "reversed" : ""
              }`}
            />

            <h4>

              {card.position}

            </h4>

            <p>

              {card.name}

            </p>

          </div>

        ))}

      </div>

      <div className="reading-box">

        <h3>Tarot Reading</h3>

        <p>

          {result.tarot_reading}

        </p>

      </div>

      <div className="reading-box">

        <h3>Combined AI Reading</h3>

        <p>

          {result.combined_reading}

        </p>

      </div>

      {result.pdf_url && (

        <a
          href={`${api.defaults.baseURL}${result.pdf_url}`}
          target="_blank"
          rel="noreferrer"
        >

          <button className="download-btn">

            📄 Download Combined PDF

          </button>

        </a>

      )}

    </div>

  );

}

export default CombinedResult;