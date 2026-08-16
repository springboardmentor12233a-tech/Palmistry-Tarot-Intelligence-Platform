import api from "../services/api";


function formatReading(text) {

  if (!text) return null;


  const headings = [
    "Overall Energy",
    "Career & Goals",
    "Relationships",
    "Personal Growth",
    "Final Message",
    "Disclaimer:"
  ];


  return text.split("\n").map((line, index) => {

    const cleanLine = line.trim();


    if (headings.includes(cleanLine)) {

      return (
        <h3 key={index}>
          {cleanLine}
        </h3>
      );

    }


    if (cleanLine === "") {

      return <br key={index} />;

    }


    return (

      <p key={index}>
        {cleanLine}
      </p>

    );

  });

}



function TarotResult({ result }) {

  if (!result) return null;

  if (!result.success) {
    return (
      <div className="result-card">
        <p>{result.error || "Something went wrong. Please try again."}</p>
      </div>
    );
  }


  return (

    <div className="result-card">


      <h2>
        Tarot Reading Result
      </h2>



      <div className="tarot-grid">


        {result.cards.map((card, index) => (

          <div
            key={index}
            className="tarot-card"
          >


            <img

              src={
                `${api.defaults.baseURL}/card-images/${card.image_filename}`
              }

              alt={card.name}

              className={
                `tarot-image ${
                  card.reversed ? "reversed" : ""
                }`
              }

            />


            <h3>
              {card.position}
            </h3>


            <h4>
              {card.name}
            </h4>


            <p>

              {card.reversed
                ? "Reversed"
                : "Upright"
              }

            </p>


          </div>

        ))}


      </div>




      <div className="reading-box">


        <h3>
          AI Interpretation
        </h3>


        {formatReading(result.reading)}


      </div>




      {result.pdf_url && (

        <a

          href={
            `${api.defaults.baseURL}${result.pdf_url}`
          }

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