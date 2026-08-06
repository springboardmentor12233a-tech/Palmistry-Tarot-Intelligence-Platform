import api from "../services/api";


function formatReading(text) {

  if (!text) return null;

  const headings = [
    "Personality & Character",
    "Education & Learning Style",
    "Career & Professional Strengths",
    "Relationships & Emotional Life",
    "Finance & Growth",
    "Personal Guidance",
    "Overall Summary",
    "Disclaimer:"
  ];


  return text.split("\n").map((line, index) => {

    const clean = line.trim();


    if (headings.includes(clean)) {
      return (
        <h3 key={index}>
          {clean}
        </h3>
      );
    }


    if (clean === "") {
      return <br key={index}/>;
    }


    return (
      <p key={index}>
        {clean}
      </p>
    );

  });

}



function PalmResult({ result }) {

  if (!result) return null;


  return (

    <div className="result-card">

      <h2>Palm Analysis Result</h2>


      {result.annotated_image_url && (

        <img
          src={
            api.defaults.baseURL +
            result.annotated_image_url
          }
          alt="Annotated Palm"
          className="annotated-image"
        />

      )}



      <div className="reading-box">

        <h3>AI Interpretation</h3>

        {formatReading(result.reading)}

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