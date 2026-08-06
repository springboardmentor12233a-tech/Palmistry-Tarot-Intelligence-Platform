import api from "../services/api";


function formatReading(text) {

  if (!text) return null;


  const headings = [

    "Combined Insight",
    "Career & Life Direction",
    "Relationships & Balance",
    "Personal Growth",
    "Final Guidance",
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



function CombinedResult({ result }) {


  if (!result) return null;



  return (


    <div className="result-card">


      <h2>
        Combined Reading
      </h2>




      {/* PALM SECTION */}


      <h3>
        Palm Analysis
      </h3>



      {result.annotated_image_url && (

        <img

          src={
            `${api.defaults.baseURL}${result.annotated_image_url}`
          }

          alt="Palm"

          className="annotated-image"

        />

      )}




      <div className="reading-box">


        <h3>
          Palm Interpretation
        </h3>


        {formatReading(result.palm_reading)}


      </div>





      {/* TAROT CARDS */}


      <h3
        style={{
          marginTop:"40px"
        }}
      >

        Tarot Cards

      </h3>




      <div className="tarot-grid">


        {result.tarot_cards.map((card,index)=>(


          <div

            className="tarot-card"

            key={index}

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



            <h4>
              {card.position}
            </h4>



            <p>
              {card.name}
            </p>



            <p>

              {
                card.reversed
                ? "Reversed"
                : "Upright"
              }

            </p>



          </div>


        ))}


      </div>






      {/* TAROT READING */}



      <div className="reading-box">


        <h3>
          Tarot Interpretation
        </h3>


        {formatReading(result.tarot_reading)}


      </div>






      {/* COMBINED READING */}



      <div className="reading-box">


        <h3>
          Combined AI Reading
        </h3>


        {formatReading(result.combined_reading)}


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

            📄 Download Combined PDF

          </button>


        </a>


      )}



    </div>


  );


}


export default CombinedResult;