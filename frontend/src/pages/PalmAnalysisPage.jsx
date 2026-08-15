import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router";

import {
  analyzePalmImage,
  buildBackendUrl,
} from "../services/api";

import {
  getReadingSession,
  getReadingSessions,
} from "../services/chatApi";

import "./PalmAnalysisPage.css";


// ============================================================
// HELPERS
// ============================================================

function formatDate(
  value
) {

  if (!value) {
    return "Unknown";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(value);

  }


  return date.toLocaleString();
}


function PalmResultCard({
  title,
  value,
  description,
}) {

  return (
    <article className="palm-module-result-card">

      <p className="palm-module-result-label">
        {title}
      </p>


      <h3>
        {
          value ||
          "Not detected"
        }
      </h3>


      {description && (

        <p className="palm-module-result-description">
          {description}
        </p>

      )}

    </article>
  );
}


// ============================================================
// PALM ANALYSIS PAGE
// ============================================================

function PalmAnalysisPage() {

  // ==========================================================
  // CURRENT ANALYSIS
  // ==========================================================

  const [
    palmFile,
    setPalmFile,
  ] = useState(null);


  const [
    previewUrl,
    setPreviewUrl,
  ] = useState("");


  const [
    result,
    setResult,
  ] = useState(null);


  const [
    isAnalyzing,
    setIsAnalyzing,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // ==========================================================
  // SAVED HISTORY
  // ==========================================================

  const [
    sessions,
    setSessions,
  ] = useState([]);


  const [
    selectedSession,
    setSelectedSession,
  ] = useState(null);


  const [
    isLoadingHistory,
    setIsLoadingHistory,
  ] = useState(true);


  const [
    historyError,
    setHistoryError,
  ] = useState("");


  // ==========================================================
  // CLEAN PREVIEW URL
  // ==========================================================

  useEffect(() => {

    return () => {

      if (previewUrl) {

        URL.revokeObjectURL(
          previewUrl
        );

      }

    };

  }, [previewUrl]);


  // ==========================================================
  // LOAD SAVED PALM HISTORY
  // ==========================================================

  useEffect(() => {

    const loadHistory =
      async () => {

        setIsLoadingHistory(
          true
        );

        setHistoryError("");


        try {

          const response =
            await getReadingSessions(
              20
            );


          const readingSessions =
            Array.isArray(
              response
            )
              ? response
              : [];


          setSessions(
            readingSessions
          );


          if (
            readingSessions.length > 0
          ) {

            try {

              const detail =
                await getReadingSession(
                  readingSessions[0].id
                );


              setSelectedSession(
                detail
              );


            } catch (
              detailError
            ) {

              console.error(
                "PALM HISTORY DETAIL ERROR:",
                detailError
              );

            }

          }


        } catch (
          loadError
        ) {

          console.error(
            "PALM HISTORY ERROR:",
            loadError
          );


          setHistoryError(
            loadError?.message ||
            "Saved palm history could not be loaded."
          );


        } finally {

          setIsLoadingHistory(
            false
          );

        }
      };


    loadHistory();

  }, []);


  // ==========================================================
  // FILE CHANGE
  // ==========================================================

  const handleFileChange =
    (event) => {

      const file =
        event.target
          .files?.[0];


      if (!file) {
        return;
      }


      const allowedExtensions = [

        ".jpg",

        ".jpeg",

        ".jfif",

        ".png",

        ".webp",

        ".heic",

        ".heif",

      ];


      const fileName =
        file.name
          .toLowerCase();


      const validExtension =
        allowedExtensions.some(
          (extension) =>
            fileName.endsWith(
              extension
            )
        );


      if (!validExtension) {

        setError(
          "Please upload a JPG, JPEG, JFIF, PNG, WEBP, HEIC or HEIF palm image."
        );

        event.target.value = "";

        return;
      }


      if (
        file.size >
        10 * 1024 * 1024
      ) {

        setError(
          "Palm image must be smaller than 10 MB."
        );

        event.target.value = "";

        return;
      }


      if (previewUrl) {

        URL.revokeObjectURL(
          previewUrl
        );

      }


      setPalmFile(
        file
      );


      setPreviewUrl(
        URL.createObjectURL(
          file
        )
      );


      setResult(
        null
      );

      setError("");
    };


  // ==========================================================
  // ANALYZE PALM
  // ==========================================================

  const handleAnalyze =
    async () => {

      if (!palmFile) {

        setError(
          "Please select a palm image first."
        );

        return;
      }


      setIsAnalyzing(
        true
      );

      setError("");

      setResult(
        null
      );


      try {

        const response =
          await analyzePalmImage(
            palmFile
          );


        console.log(
          "PALM MODULE RESPONSE:",
          response
        );


        if (
          !response
            ?.palm_analysis
        ) {

          throw new Error(
            "The backend returned an invalid palm-analysis response."
          );

        }


        const {
          heart_line,
          head_line,
          life_line,
        } =
          response
            .palm_analysis;


        if (
          !heart_line ||
          !head_line ||
          !life_line
        ) {

          throw new Error(
            "The palm model did not return all three supported palm-line results."
          );

        }


        setResult(
          response
        );


      } catch (
        analysisError
      ) {

        console.error(
          "PALM MODULE ERROR:",
          analysisError
        );


        setError(
          analysisError?.message ||
          "The palm image could not be analyzed."
        );


      } finally {

        setIsAnalyzing(
          false
        );

      }
    };


  // ==========================================================
  // OPEN SAVED SESSION
  // ==========================================================

  const openSavedSession =
    async (
      sessionId
    ) => {

      setHistoryError("");


      try {

        const response =
          await getReadingSession(
            sessionId
          );


        setSelectedSession(
          response
        );


      } catch (
        sessionError
      ) {

        console.error(
          "SAVED PALM SESSION ERROR:",
          sessionError
        );


        setHistoryError(
          sessionError?.message ||
          "The saved palm analysis could not be opened."
        );

      }
    };


  // ==========================================================
  // CURRENT OUTPUT DATA
  // ==========================================================

  const palmAnalysis =
    result
      ?.palm_analysis ||
    {};


  const descriptions =
    result
      ?.descriptions ||
    {};


  const outputFiles =
    result
      ?.output_files ||
    {};


  const savedPalm =
    selectedSession
      ?.palm_analysis ||
    {};


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="palm-module-page">

      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <div className="palm-module-header">

        <div>

          <p className="palm-module-eyebrow">
            PALM INTELLIGENCE
          </p>


          <h1>
            Palm Analysis
          </h1>


          <p className="palm-module-description">

            Upload a clear palm image
            and analyze the currently
            supported heart, head and
            life lines.

          </p>

        </div>


        <Link
          to="/reading"
          className="palm-module-reading-link"
        >
          Open Reading Studio
        </Link>

      </div>


      {/* ==================================================== */}
      {/* SUPPORT NOTICE */}
      {/* ==================================================== */}

      <div className="palm-module-support-notice">

        <strong>
          Current prototype support
        </strong>


        <p>

          The current palm model supports
          Heart Line, Head Line and Life
          Line analysis. Unsupported
          features are intentionally not
          generated.

        </p>

      </div>


      {/* ==================================================== */}
      {/* ANALYSIS WORKSPACE */}
      {/* ==================================================== */}

      <section className="palm-module-section">

        <div className="palm-module-section-heading">

          <p className="palm-module-eyebrow">
            NEW ANALYSIS
          </p>

          <h2>
            Upload Palm Image
          </h2>

        </div>


        <div className="palm-module-upload-layout">


          {/* LEFT */}

          <div className="palm-module-upload-card">

            <label
              htmlFor="palm-module-file"
              className="palm-module-file-label"
            >
              Select Palm Image
            </label>


            <input
              id="palm-module-file"
              type="file"
              accept=".jpg,.jpeg,.jfif,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp"
              onChange={
                handleFileChange
              }
              disabled={
                isAnalyzing
              }
            />


            <p className="palm-module-help">

              Use a clear front-facing
              image with the complete
              palm visible.

            </p>


            <button
              type="button"
              className="palm-module-analyze-button"
              onClick={
                handleAnalyze
              }
              disabled={
                !palmFile ||
                isAnalyzing
              }
            >

              {
                isAnalyzing
                  ? "Analyzing Palm..."
                  : result
                    ? "Analyze Again"
                    : "Analyze Palm"
              }

            </button>


            {error && (

              <div
                className="palm-module-error"
                role="alert"
              >

                <strong>
                  Analysis failed
                </strong>

                <p>
                  {error}
                </p>

              </div>

            )}

          </div>


          {/* RIGHT */}

          <div className="palm-module-preview-card">

            <h3>
              Palm Preview
            </h3>


            {previewUrl
              ? (

                <img
                  src={
                    previewUrl
                  }
                  alt="Selected palm"
                  className="palm-module-preview-image"
                />

              )
              : (

                <div className="palm-module-preview-empty">

                  <span>
                    No palm selected
                  </span>

                </div>

              )
            }

          </div>

        </div>

      </section>


      {/* ==================================================== */}
      {/* CURRENT RESULTS */}
      {/* ==================================================== */}

      {result && (

        <section className="palm-module-section">

          <div className="palm-module-section-heading">

            <p className="palm-module-eyebrow">
              DETECTION RESULTS
            </p>

            <h2>
              Palm Line Analysis
            </h2>

          </div>


          <div className="palm-module-result-grid">

            <PalmResultCard
              title="Heart Line"
              value={
                palmAnalysis
                  .heart_line
              }
              description={
                descriptions
                  .heart_line
              }
            />


            <PalmResultCard
              title="Head Line"
              value={
                palmAnalysis
                  .head_line
              }
              description={
                descriptions
                  .head_line
              }
            />


            <PalmResultCard
              title="Life Line"
              value={
                palmAnalysis
                  .life_line
              }
              description={
                descriptions
                  .life_line
              }
            />

          </div>

        </section>

      )}


      {/* ==================================================== */}
      {/* MODEL OUTPUT IMAGES */}
      {/* ==================================================== */}

      {result && (

        <section className="palm-module-section">

          <div className="palm-module-section-heading">

            <p className="palm-module-eyebrow">
              COMPUTER VISION OUTPUT
            </p>

            <h2>
              Processed Palm Images
            </h2>

          </div>


          <div className="palm-module-image-grid">


            {outputFiles
              ?.result_image_url && (

              <article className="palm-module-image-card">

                <h3>
                  Analysis Result
                </h3>

                <img
                  src={
                    buildBackendUrl(
                      outputFiles
                        .result_image_url
                    )
                  }
                  alt="Palm analysis result"
                />

              </article>

            )}


            {outputFiles
              ?.warped_palm_url && (

              <article className="palm-module-image-card">

                <h3>
                  Warped Palm
                </h3>

                <img
                  src={
                    buildBackendUrl(
                      outputFiles
                        .warped_palm_url
                    )
                  }
                  alt="Warped palm"
                />

              </article>

            )}


            {outputFiles
              ?.palm_lines_url && (

              <article className="palm-module-image-card">

                <h3>
                  Detected Palm Lines
                </h3>

                <img
                  src={
                    buildBackendUrl(
                      outputFiles
                        .palm_lines_url
                    )
                  }
                  alt="Detected palm lines"
                />

              </article>

            )}

          </div>

        </section>

      )}


      {/* ==================================================== */}
      {/* SAVED ANALYSES */}
      {/* ==================================================== */}

      <section className="palm-module-section">

        <div className="palm-module-section-heading">

          <p className="palm-module-eyebrow">
            SAVED ACTIVITY
          </p>

          <h2>
            Previous Palm Analyses
          </h2>

          <p>
            Palm results stored inside
            your previous complete reading
            sessions.
          </p>

        </div>


        {historyError && (

          <div className="palm-module-error">

            <strong>
              History unavailable
            </strong>

            <p>
              {historyError}
            </p>

          </div>

        )}


        {isLoadingHistory
          ? (

            <div className="palm-module-history-empty">
              Loading saved palm analyses...
            </div>

          )
          : sessions.length === 0
            ? (

              <div className="palm-module-history-empty">

                <h3>
                  No saved readings yet
                </h3>

                <p>
                  Complete a reading to
                  create saved palm history.
                </p>

              </div>

            )
            : (

              <div className="palm-module-history-layout">


                {/* SESSION LIST */}

                <div className="palm-module-session-list">

                  {sessions.map(
                    (session) => {

                      const selected =
                        Number(
                          selectedSession
                            ?.id
                        ) ===
                        Number(
                          session.id
                        );


                      return (
                        <button
                          key={
                            session.id
                          }
                          type="button"
                          className={
                            selected
                              ? "palm-module-session-button palm-module-session-selected"
                              : "palm-module-session-button"
                          }
                          onClick={
                            () =>
                              openSavedSession(
                                session.id
                              )
                          }
                        >

                          <strong>
                            {
                              session.title ||
                              "Saved Reading"
                            }
                          </strong>


                          <span>
                            {
                              session.category ||
                              "General"
                            }
                          </span>


                          <small>
                            {
                              formatDate(
                                session.created_at
                              )
                            }
                          </small>

                        </button>
                      );

                    }
                  )}

                </div>


                {/* SELECTED SAVED PALM */}

                <article className="palm-module-saved-detail">

                  {selectedSession
                    ? (

                      <>

                        <div className="palm-module-saved-header">

                          <div>

                            <p className="palm-module-eyebrow">
                              SAVED SESSION #
                              {
                                selectedSession.id
                              }
                            </p>

                            <h3>
                              {
                                selectedSession.title
                              }
                            </h3>

                          </div>


                          <Link
                            to="/history"
                            className="palm-module-history-link"
                          >
                            Full History
                          </Link>

                        </div>


                        <p className="palm-module-saved-question">

                          <strong>
                            Original question:
                          </strong>{" "}

                          {
                            selectedSession
                              .original_question ||
                            "Not available"
                          }

                        </p>


                        <div className="palm-module-result-grid">

                          <PalmResultCard
                            title="Heart Line"
                            value={
                              savedPalm
                                .heart_line
                            }
                          />


                          <PalmResultCard
                            title="Head Line"
                            value={
                              savedPalm
                                .head_line
                            }
                          />


                          <PalmResultCard
                            title="Life Line"
                            value={
                              savedPalm
                                .life_line
                            }
                          />

                        </div>

                      </>

                    )
                    : (

                      <div className="palm-module-history-empty">
                        Select a saved reading.
                      </div>

                    )
                  }

                </article>

              </div>

            )
        }

      </section>


      {/* ==================================================== */}
      {/* DISCLAIMER */}
      {/* ==================================================== */}

      <p className="palm-module-disclaimer">

        Palmistry results in this prototype
        are provided for entertainment,
        reflection and software-demonstration
        purposes. They are not scientific,
        medical or diagnostic conclusions.

      </p>

    </div>
  );
}


export default PalmAnalysisPage;