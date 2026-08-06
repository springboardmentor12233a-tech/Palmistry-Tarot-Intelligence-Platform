import api from "../services/api";

function TarotResult({ result }) {

  if (!result) return null;

  return (

    <div className="result-card">

      <h2>Tarot Reading Result</h2>

      <div className="tarot-grid">

        {result.cards.map((card, index) => (

          <div
            key={index}
            className="tarot-card"
          >

            <img
              src={`${api.defaults.baseURL}/card-images/${card.image_filename}`}
              alt={card.name}
              className={`tarot-image ${
                card.reversed ? "reversed" : ""
              }`}
            />

            <h3>{card.position}</h3>

            <h4>{card.name}</h4>

            <p>

              {card.reversed ? "Reversed" : "Upright"}

            </p>

          </div>

        ))}

      </div>

      <div className="reading-box">

        <h2>AI Interpretation</h2>

        <p>

          {result.reading}

        </p>

      </div>

      {result.pdf_url && (

        <a
          href={`${api.defaults.baseURL}${result.pdf_url}`}
          target="_blank"
          rel="noreferrer"
        >

          <button className="download-btn">

            📄 Download Tarot Report

          </button>

        </a>

      )}

    </div>

  );

}

export default TarotResult;