import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { analyzePalm } from "../services/api";
import "./Palmistry.css";

/* =========================================================
   DETAILED PALM LINE INFORMATION
========================================================= */

const palmLineDetails = {
  life: {
    title: "Life Line",
    icon: "🌱",
    description:
      "The Life Line is traditionally associated with vitality, resilience, energy and the way a person experiences major phases of change. In symbolic palmistry, its shape, depth and flow are often interpreted as reflections of how someone approaches stability, challenges and personal transformation. A clear and continuous line is traditionally viewed as representing consistency and grounded energy, while variations or interruptions may be interpreted symbolically as periods of transition, adjustment or renewed direction.",
  },

  head: {
    title: "Head Line",
    icon: "🧠",
    description:
      "The Head Line is traditionally connected with thinking patterns, decision-making, curiosity, concentration and the way a person approaches problems. Its direction and character are often interpreted symbolically to explore whether someone tends toward practical reasoning, imagination, independence or careful analysis. A long or clearly defined line may be associated with sustained mental focus, while a more curved pattern is sometimes interpreted as openness to creativity and intuitive thinking.",
  },

  heart: {
    title: "Heart Line",
    icon: "❤️",
    description:
      "The Heart Line is traditionally associated with emotional expression, relationships, affection and interpersonal sensitivity. In symbolic palmistry, the line is interpreted as a reflection of how a person may approach emotional connections and communicate feelings. A pronounced line may traditionally suggest strong emotional awareness, while variations in its shape can be interpreted as representing different approaches to trust, attachment, communication and emotional balance.",
  },

  fate: {
    title: "Fate Line",
    icon: "⭐",
    description:
      "The Fate Line is traditionally associated with direction, purpose, career themes and significant changes throughout a person's journey. Symbolic palmistry often considers its presence, strength and direction when discussing ambition, responsibility and changing life circumstances. A strong and continuous pattern may traditionally be associated with a clear sense of direction, while changes or breaks can be interpreted symbolically as periods of transition, new opportunities or shifts in priorities.",
  },
};


/* =========================================================
   INTERACTIVE PALM ANALYSIS IMAGE
========================================================= */

function PalmAnalysisImage({
  previewUrl,
  scanning = false,
}) {
  const [activeLine, setActiveLine] = useState(null);

  const activateLine = (line) => {
    setActiveLine(line);
  };

  const deactivateLine = () => {
    setActiveLine(null);
  };

  return (
    <div
      className={`palm-analysis-visual ${
        scanning ? "is-scanning" : "scan-complete"
      }`}
    >
      {/* DIGITAL GRID */}
      <div className="scan-grid"></div>

      {/* PALM IMAGE */}
      <img
        src={previewUrl}
        alt="Analyzed palm"
        className="analysis-palm-image"
      />

      {/* SCANNING EFFECT */}
      {scanning && (
        <>
          <div className="analysis-scanner"></div>

          <div className="scan-status-overlay">
            <span className="scan-spinner">✦</span>

            <div>
              <strong>Scanning palm...</strong>
              <small>Detecting major palm features</small>
            </div>
          </div>
        </>
      )}

      {/* =====================================================
          PALM LINE OVERLAY

          Coordinates are normalized to 0–100 so the lines
          remain aligned when the image scales.
      ===================================================== */}

      <svg
        className="palm-line-overlay"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* HEART LINE */}

        <path
          className={`palm-line heart-line ${
            activeLine === "heart" ? "line-active" : ""
          }`}
          d="
            M 22 34
            C 30 30, 38 28, 47 30
            C 55 31, 61 36, 68 37
            C 74 38, 80 36, 84 32
          "
          onMouseEnter={() => activateLine("heart")}
          onMouseLeave={deactivateLine}
        />

        {/* HEAD LINE */}

        <path
          className={`palm-line head-line ${
            activeLine === "head" ? "line-active" : ""
          }`}
          d="
            M 24 42
            C 32 46, 39 48, 48 49
            C 57 50, 66 48, 73 45
            C 77 43, 80 41, 83 40
          "
          onMouseEnter={() => activateLine("head")}
          onMouseLeave={deactivateLine}
        />

        {/* LIFE LINE */}

        <path
          className={`palm-line life-line ${
            activeLine === "life" ? "line-active" : ""
          }`}
          d="
            M 25 34
            C 20 39, 17 46, 17 54
            C 17 63, 21 71, 27 77
            C 32 82, 37 86, 42 89
          "
          onMouseEnter={() => activateLine("life")}
          onMouseLeave={deactivateLine}
        />

        {/* FATE LINE */}

        <path
          className={`palm-line fate-line ${
            activeLine === "fate" ? "line-active" : ""
          }`}
          d="
            M 50 89
            C 49 80, 49 71, 49 62
            C 49 54, 50 47, 50 41
            C 50 36, 49 31, 48 27
          "
          onMouseEnter={() => activateLine("fate")}
          onMouseLeave={deactivateLine}
        />
      </svg>

      {/* =====================================================
          LABELS
      ===================================================== */}

      <div
        className={`palm-label heart-label ${
          activeLine === "heart" ? "label-active" : ""
        }`}
        onMouseEnter={() => activateLine("heart")}
        onMouseLeave={deactivateLine}
      >
        ❤️ Heart Line
      </div>

      <div
        className={`palm-label head-label ${
          activeLine === "head" ? "label-active" : ""
        }`}
        onMouseEnter={() => activateLine("head")}
        onMouseLeave={deactivateLine}
      >
        🧠 Head Line
      </div>

      <div
        className={`palm-label life-label ${
          activeLine === "life" ? "label-active" : ""
        }`}
        onMouseEnter={() => activateLine("life")}
        onMouseLeave={deactivateLine}
      >
        🌱 Life Line
      </div>

      <div
        className={`palm-label fate-label ${
          activeLine === "fate" ? "label-active" : ""
        }`}
        onMouseEnter={() => activateLine("fate")}
        onMouseLeave={deactivateLine}
      >
        ⭐ Fate Line
      </div>

      {/* =====================================================
          DETECTION POINTS
      ===================================================== */}

      {!scanning && (
        <>
          <span className="detection-point point-heart"></span>
          <span className="detection-point point-head"></span>
          <span className="detection-point point-life"></span>
          <span className="detection-point point-fate"></span>
        </>
      )}
    </div>
  );
}


/* =========================================================
   DETAILED PALM LINE CARD
========================================================= */

function PalmLineCard({
  type,
  backendReading,
}) {

  const details =
    palmLineDetails[type];

  return (

    <div className="palm-line-card">

      <div
        className={`line-card-icon ${type}-icon`}
      >
        {details.icon}
      </div>


      <div className="line-card-content">

        <div className="line-card-heading">

          <div>

            <span className="line-card-label">
              PALM FEATURE
            </span>


            <h3>
              {details.title}
            </h3>

          </div>


          <span className="line-indicator">
            SYMBOLIC
          </span>

        </div>


        {/* Detailed explanation */}

        <p className="line-description">
          {details.description}
        </p>


        {/* Personalized backend reading */}

        {backendReading && (

          <div className="personal-reading">

            <strong>
              Your symbolic reading
            </strong>


            <p>
              {backendReading}
            </p>

          </div>

        )}

      </div>

    </div>

  );
}


/* =========================================================
   PALMISTRY PAGE
========================================================= */

function Palmistry() {

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [analysis, setAnalysis] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =======================================================
     IMAGE SELECTION
  ======================================================= */

  const handleImageChange = (event) => {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }


    /* Validate image type */

    if (!file.type.startsWith("image/")) {

      setError(
        "Please select a valid image file."
      );

      return;

    }


    /* Validate image size */

    if (
      file.size >
      10 * 1024 * 1024
    ) {

      setError(
        "Image size should be less than 10 MB."
      );

      return;

    }


    /* Save image */

    setSelectedImage(file);

    setError("");

    setAnalysis(null);


    /* Create preview */

    const url =
      URL.createObjectURL(file);

    setPreviewUrl(url);

  };


  /* =======================================================
     CLEANUP IMAGE PREVIEW
  ======================================================= */

  useEffect(() => {

    return () => {

      if (previewUrl) {

        URL.revokeObjectURL(
          previewUrl
        );

      }

    };

  }, [previewUrl]);


  /* =======================================================
     ANALYZE PALM
  ======================================================= */

  const handleAnalyzePalm =
    async () => {

      if (!selectedImage) {

        setError(
          "Please select a palm image first."
        );

        return;

      }


      setLoading(true);

      setError("");

      setAnalysis(null);


      try {

        console.log(
          "Sending palm image for analysis..."
        );


        const data =
          await analyzePalm(
            selectedImage
          );


        console.log(
          "Palmistry analysis:",
          data
        );


        setAnalysis(data);

      } catch (error) {

        console.error(
          "Palmistry analysis error:",
          error
        );


        setError(
          error?.message ||
          "Unable to analyze the palm. Please try again."
        );

      } finally {

        setLoading(false);

      }

    };


  /* =======================================================
     RESET READING
  ======================================================= */

  const handleNewReading = () => {

    setSelectedImage(null);

    setPreviewUrl("");

    setAnalysis(null);

    setError("");

  };


  /* =======================================================
     HELPER
  ======================================================= */

  const getValue =
    (...values) => {

      for (
        const value of values
      ) {

        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {

          return value;

        }

      }

      return null;

    };


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <>

      <Navbar />


      <main className="palmistry-main">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="palmistry-header">

          <Link
            to="/dashboard"
            className="back-link"
          >
            ← Back to Dashboard
          </Link>


          <span className="dashboard-eyebrow">
            PALMISTRY
          </span>


          <h1>

            Discover what

            <span>
              your hands reveal.
            </span>

          </h1>


          <p>
            Upload a clear image of your palm to explore
            symbolic interpretations of your major palm
            lines and discover personalized insights.
          </p>

        </div>


        {/* =================================================
            UPLOAD / RESULT
        ================================================= */}

        {!analysis ? (

          /* =================================================
             UPLOAD SCREEN
          ================================================= */

          <section className="palm-upload-section">


            {/* =================================================
               UPLOAD CARD
            ================================================= */}

            <div className="upload-card">

              <div className="upload-icon">
                ✋
              </div>


              <h2>
                Upload your palm image
              </h2>


              <p>
                For the best experience, use a clear,
                well-lit image showing your complete palm,
                including the major lines and surrounding
                areas.
              </p>


              {/* =================================================
                 UPLOAD AREA
              ================================================= */}

              <label className="upload-area">

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={
                    handleImageChange
                  }
                />


                {selectedImage ? (

                  <div className="selected-file">

                    {previewUrl && (

                      <img
                        src={previewUrl}
                        alt="Selected palm"
                        className="selected-palm-preview"
                      />

                    )}


                    <span className="file-icon">
                      ✓
                    </span>


                    <strong>
                      {selectedImage.name}
                    </strong>


                    <small>
                      Image selected successfully
                    </small>

                  </div>

                ) : (

                  <div className="upload-placeholder">

                    <span className="upload-cloud">
                      ↑
                    </span>


                    <strong>
                      Click to upload
                    </strong>


                    <span>
                      PNG, JPG or JPEG • Maximum 10 MB
                    </span>

                  </div>

                )}

              </label>


              {/* =================================================
                 ERROR
              ================================================= */}

              {error && (

                <div className="palm-error">
                  {error}
                </div>

              )}


              {/* =================================================
                 SCANNING STATUS
              ================================================= */}

              {loading && (

                <div className="palm-scanning">

                  <div className="scanning-icon">
                    ✋
                  </div>


                  <div className="scanning-content">

                    <strong>
                      Analyzing your palm...
                    </strong>


                    <span>
                      Detecting symbolic palm features
                    </span>


                    <div className="scanning-progress">

                      <div className="scanning-progress-bar"></div>

                    </div>

                  </div>

                </div>

              )}


              {/* =================================================
                 ANALYZE BUTTON
              ================================================= */}

              <button
                className="analyze-button"
                disabled={
                  !selectedImage ||
                  loading
                }
                type="button"
                onClick={
                  handleAnalyzePalm
                }
              >

                {loading
                  ? "Analyzing Your Palm..."
                  : "Analyze My Palm →"}

              </button>


              <p className="upload-note">

                ✦ Palmistry interpretations are provided
                for self-reflection and entertainment.

              </p>

            </div>


            {/* =================================================
               INFORMATION CARD
            ================================================= */}

            <div className="palm-info">

              <span className="dashboard-eyebrow">
                HOW IT WORKS
              </span>


              <h2>

                Your palm,

                <span>
                  your journey.
                </span>

              </h2>


              {/* Step 01 */}

              <div className="info-step">

                <div className="step-number">
                  01
                </div>


                <div>

                  <h3>
                    Upload
                  </h3>


                  <p>
                    Provide a clear image of your palm.
                    A well-lit image with the complete
                    palm visible provides the best visual
                    reference.
                  </p>

                </div>

              </div>


              {/* Step 02 */}

              <div className="info-step">

                <div className="step-number">
                  02
                </div>


                <div>

                  <h3>
                    Analyze
                  </h3>


                  <p>
                    The platform processes the uploaded
                    image and retrieves the symbolic palm
                    interpretation associated with the
                    reading.
                  </p>

                </div>

              </div>


              {/* Step 03 */}

              <div className="info-step">

                <div className="step-number">
                  03
                </div>


                <div>

                  <h3>
                    Explore
                  </h3>


                  <p>
                    Explore the major palm lines and
                    review their symbolic meanings,
                    interpretations and personalized
                    observations returned by the analysis
                    service.
                  </p>

                </div>

              </div>


              {/* Feature preview */}

              <div className="palm-feature-preview">

                <div className="feature-preview-icon">
                  ✨
                </div>


                <div>

                  <strong>
                    Interactive palm analysis
                  </strong>


                  <p>
                    Your result includes a visual palm
                    analysis area with highlighted
                    symbolic line references.
                  </p>

                </div>

              </div>

            </div>

          </section>

        ) : (

          /* =================================================
             ANALYSIS RESULT
          ================================================= */

          <section className="palm-result-section">


            {/* =================================================
               RESULT HEADER
            ================================================= */}

            <div className="analysis-result-header">

              <div>

                <span className="dashboard-eyebrow">
                  PALM ANALYSIS COMPLETE
                </span>


                <h2>

                  Your palm

                  <span>
                    reading is ready.
                  </span>

                </h2>


                <p>
                  Explore the symbolic interpretation of
                  your palm and review the major features
                  identified in your reading.
                </p>

              </div>


              <div className="analysis-complete-badge">

                <span>
                  ✓
                </span>

                Analysis Complete

              </div>

            </div>


            {/* =================================================
               VISUAL + SUMMARY
            ================================================= */}

            <div className="analysis-top-grid">


              {/* =================================================
                 PALM VISUAL
              ================================================= */}

              <div className="analysis-visual-card">

                <div className="visual-card-header">

                  <div>

                    <span className="card-label">
                      PALM SCAN
                    </span>


                    <h3>
                      Interactive Line Map
                    </h3>

                  </div>


                  <span className="scan-status">
                    ● SCANNED
                  </span>

                </div>


                {previewUrl && (

                  <PalmAnalysisImage
                    previewUrl={
                      previewUrl
                    }
                    scanning={
                      loading
                    }
                  />

                )}


                <div className="visual-legend">

                  <span>
                    <i className="legend-dot heart-dot"></i>
                    Heart
                  </span>


                  <span>
                    <i className="legend-dot head-dot"></i>
                    Head
                  </span>


                  <span>
                    <i className="legend-dot life-dot"></i>
                    Life
                  </span>


                  <span>
                    <i className="legend-dot fate-dot"></i>
                    Fate
                  </span>

                </div>

              </div>


              {/* =================================================
                 SUMMARY
              ================================================= */}

              <div className="analysis-summary-card">

                <span className="card-label">
                  YOUR READING
                </span>


                <h3>
                  Symbolic overview
                </h3>


                {getValue(
                  analysis?.palm_shape,
                  analysis?.palmShape,
                  analysis?.shape
                ) && (

                  <div className="shape-result">

                    <span>
                      PALM SHAPE
                    </span>


                    <strong>

                      {getValue(
                        analysis?.palm_shape,
                        analysis?.palmShape,
                        analysis?.shape
                      )}

                    </strong>

                  </div>

                )}


                {getValue(
                  analysis?.overall_reading,
                  analysis?.overallReading,
                  analysis?.reading,
                  analysis?.interpretation,
                  analysis?.analysis
                ) ? (

                  <div className="overall-reading">

                    <span>
                      OVERALL INTERPRETATION
                    </span>


                    <p>

                      {getValue(
                        analysis?.overall_reading,
                        analysis?.overallReading,
                        analysis?.reading,
                        analysis?.interpretation,
                        analysis?.analysis
                      )}

                    </p>

                  </div>

                ) : (

                  <div className="overall-reading">

                    <span>
                      OVERALL INTERPRETATION
                    </span>


                    <p>
                      Your palm reading has been completed.
                      Explore the individual palm features
                      below for detailed symbolic descriptions
                      and any personalized observations returned
                      by the analysis service.
                    </p>

                  </div>

                )}


                <div className="summary-disclaimer">

                  ✦ These interpretations are symbolic
                  and intended for self-reflection and
                  entertainment purposes.

                </div>

              </div>

            </div>


            {/* =================================================
               MAJOR PALM LINES
            ================================================= */}

            <section className="major-lines-section">

              <div className="section-heading">

                <div>

                  <span className="dashboard-eyebrow">
                    DETAILED ANALYSIS
                  </span>


                  <h2>
                    Explore your major palm lines.
                  </h2>


                  <p>
                    Each line has a traditional symbolic
                    interpretation. Your personalized reading
                    is shown alongside the general explanation
                    whenever the analysis service provides it.
                  </p>

                </div>

              </div>


              <div className="palm-lines-grid">


                {/* LIFE */}

                <PalmLineCard
                  type="life"
                  backendReading={getValue(
                    analysis?.life_line,
                    analysis?.lifeLine
                  )}
                />


                {/* HEAD */}

                <PalmLineCard
                  type="head"
                  backendReading={getValue(
                    analysis?.head_line,
                    analysis?.headLine
                  )}
                />


                {/* HEART */}

                <PalmLineCard
                  type="heart"
                  backendReading={getValue(
                    analysis?.heart_line,
                    analysis?.heartLine
                  )}
                />


                {/* FATE */}

                <PalmLineCard
                  type="fate"
                  backendReading={getValue(
                    analysis?.fate_line,
                    analysis?.fateLine
                  )}
                />

              </div>

            </section>


            {/* =================================================
               ANALYSIS FEATURES
            ================================================= */}

            <section className="analysis-features">


              {/* Palm Image */}

              <div className="analysis-feature">

                <div className="feature-check">
                  ✓
                </div>


                <div>

                  <strong>
                    Palm Image
                  </strong>


                  <p>
                    Your uploaded palm image has been
                    processed successfully.
                  </p>

                </div>

              </div>


              {/* Symbolic Analysis */}

              <div className="analysis-feature">

                <div className="feature-check">
                  ✓
                </div>


                <div>

                  <strong>
                    Symbolic Analysis
                  </strong>


                  <p>
                    Major palm features are presented
                    using the platform's palmistry
                    interpretation system.
                  </p>

                </div>

              </div>


              {/* Personalized Reading */}

              <div className="analysis-feature">

                <div className="feature-check">
                  ✓
                </div>


                <div>

                  <strong>
                    Personalized Reading
                  </strong>


                  <p>
                    This reading is associated with
                    your authenticated account.
                  </p>

                </div>

              </div>

            </section>


            {/* =================================================
               ACTIONS
            ================================================= */}

            <div className="analysis-actions">

              <button
                type="button"
                className="secondary-analysis-button"
                onClick={
                  handleNewReading
                }
              >
                ← Analyze Another Palm
              </button>


              <Link
                to="/readings"
                className="primary-analysis-button"
              >
                View Reading History →
              </Link>

            </div>

          </section>

        )}


        {/* =================================================
           DISCLAIMER
        ================================================= */}

        <div className="palm-disclaimer">

          ✦ Palmistry interpretations are provided for
          self-reflection and entertainment purposes only.
          They should not be treated as medical, financial,
          legal or professional advice.

        </div>

      </main>

    </>

  );

}


export default Palmistry;