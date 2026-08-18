import { useState } from "react";
import axios from "axios";
import { supabase } from "../supabaseClient";
import "../styles/PalmPage.css";

function PalmPage({ goHome }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // ===========================
  // CLEAN AI INTERPRETATION
  // ===========================

  const cleanInterpretation = (text) => {
    if (!text) return "";

    return text
      .replace(/\*\*/g, "")
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/^\s*[-*]\s+/gm, "")
      .replace(/`/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  // ===========================
  // SAVE PALM READING
  // ===========================

  const savePalmReading = async (interpretation) => {
    try {
      // Get currently logged-in user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) {
        console.error("USER ERROR:", userError);
        return;
      }

      const user = userData?.user;

      if (!user) {
        console.log("No logged-in user. Reading will not be saved.");
        return;
      }

      // Save reading to Supabase
      const { error } = await supabase
        .from("Palmistry")
        .insert([
          {
            user_id: user.id,
            type: "palm",
            interpretation: interpretation,
          },
        ]);

      if (error) {
        console.error("SUPABASE SAVE ERROR:", error);
        return;
      }

      console.log("Palm reading saved successfully!");

    } catch (error) {
      console.error("ERROR SAVING PALM READING:", error);
    }
  };

  // ===========================
  // PALM API
  // ===========================

  const analyzePalm = async () => {
    if (!image) {
      alert("Please select a palm image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", image);

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/palm/reading",
        formData
      );

      setResult(response.data);

      // ===========================
      // SAVE READING TO SUPABASE
      // ===========================

      if (response.data?.interpretation) {
        await savePalmReading(
          response.data.interpretation
        );
      }

    } catch (error) {
      console.error("FULL ERROR:", error);

      if (error.response) {
        console.error("STATUS:", error.response.status);
        console.error("DATA:", error.response.data);

        alert(
          `Palm analysis failed.\n\nStatus: ${
            error.response.status
          }\n${JSON.stringify(error.response.data)}`
        );

      } else if (error.request) {
        console.error(
          "NO RESPONSE FROM BACKEND:",
          error.request
        );

        alert(
          "Could not connect to the backend. Is FastAPI running?"
        );

      } else {
        console.error(
          "REQUEST ERROR:",
          error.message
        );

        alert(
          `Request error: ${error.message}`
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // DOWNLOAD PDF
  // ===========================

  const downloadPDF = () => {
    if (!result || !result.pdf_url) {
      alert("PDF report is not available.");
      return;
    }

    const pdfURL =
      `http://127.0.0.1:8000${result.pdf_url}`;

    window.open(pdfURL, "_blank");
  };

  return (
    <div className="palmPage">

      <div className="palmOverlay">

        {/* BACK BUTTON */}

        <button
          className="backBtn"
          onClick={goHome}
        >
          ← Back
        </button>

        {/* TITLE */}

        <h1 className="palmTitle">
          ✨ Palm Analysis ✨
        </h1>

        <p className="palmSubtitle">
          Upload a clear image of your palm and let the Oracle
          uncover the hidden meanings written within your hand.
        </p>

        {/* UPLOAD */}

        <div className="uploadBox">

          <div className="uploadIcon">
            ✋
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files[0])
            }
          />

        </div>

        {/* ANALYZE */}

        <button
          className="analyzeBtn"
          onClick={analyzePalm}
          disabled={loading}
        >
          {loading
            ? "Reading Your Palm..."
            : "Analyze Palm"}
        </button>

        {/* IMAGE PREVIEW */}

        {image && (

          <div className="previewCard">

            <h2>
              Selected Palm
            </h2>

            <img
              src={URL.createObjectURL(image)}
              alt="Palm"
              className="previewImage"
            />

          </div>

        )}

        {/* RESULTS */}

        {result && (

          <>

            {/* PRINCIPAL LINES */}

            <div className="lineCards">

              <div className="lineCard">
                <h3>
                  ❤️ Heart Line
                </h3>

                <p>
                  {result.lines.heart_line}
                </p>
              </div>

              <div className="lineCard">
                <h3>
                  🧠 Head Line
                </h3>

                <p>
                  {result.lines.head_line}
                </p>
              </div>

              <div className="lineCard">
                <h3>
                  🌿 Life Line
                </h3>

                <p>
                  {result.lines.life_line}
                </p>
              </div>

            </div>

            {/* AI INTERPRETATION */}

            <div className="interpretationCard">

              <h2>
                ✨ AI Interpretation
              </h2>

              <p>
                {cleanInterpretation(
                  result.interpretation
                )}
              </p>

              {/* PDF BUTTON */}

              {result.pdf_url && (

                <button
                  className="downloadBtn"
                  onClick={downloadPDF}
                >
                  📜 Download PDF Report
                </button>

              )}

            </div>

          </>

        )}

      </div>

    </div>
  );
}

export default PalmPage;