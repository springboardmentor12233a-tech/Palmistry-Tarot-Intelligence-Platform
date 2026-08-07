import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  analyzePalmImage,
  drawTarotCards,
  generateCompleteReading,
  getAnalyticsSummary,
  getReadingHistory,
  downloadReadingPdf,
} from "./services/api";

import AnalyticsDashboard from
  "./components/AnalyticsDashboard";

import "./App.css";


function SafeList({
  items,
  emptyMessage = "No items were returned.",
  itemKeyPrefix = "item",
}) {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return (
      <ul>
        <li>{emptyMessage}</li>
      </ul>
    );
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li
          key={`${itemKeyPrefix}-${index}`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}


function ScoreCard({
  title,
  value,
}) {
  const numericValue = Number(value);

  const formattedValue =
    Number.isFinite(numericValue)
      ? numericValue.toFixed(2)
      : "0.00";

  return (
    <article className="result-card">
      <h3>{title}</h3>

      <p>
        <strong>
          {formattedValue} / 100
        </strong>
      </p>
    </article>
  );
}


function App() {
  const backendBaseUrl =
    "http://127.0.0.1:8000";


  // ==========================================
  // USER FORM
  // ==========================================

  const [formData, setFormData] =
    useState({
      name: "Ankita Pagare",

      age_group: "18-25",

      interests:
        "Career, Education, Personal Growth",

      spiritual_goal:
        "Improve study focus and personal growth",

      reading_preference:
        "Detailed",

      question:
        "What should I focus on most in my studies right now?",

      category: "Career",

      spread:
        "Past-Present-Future",
    });


  // ==========================================
  // PALM STATES
  // ==========================================

  const [
    palmFile,
    setPalmFile,
  ] = useState(null);

  const [
    palmPreview,
    setPalmPreview,
  ] = useState("");

  const [
    palmResult,
    setPalmResult,
  ] = useState(null);

  const [
    isAnalyzingPalm,
    setIsAnalyzingPalm,
  ] = useState(false);


  // ==========================================
  // TAROT STATES
  // ==========================================

  const [
    tarotCards,
    setTarotCards,
  ] = useState([]);

  const [
    isDrawingTarot,
    setIsDrawingTarot,
  ] = useState(false);


  // ==========================================
  // READING RESULT STATES
  // ==========================================

  const [
    interpretationResult,
    setInterpretationResult,
  ] = useState(null);

  const [
    personalityResult,
    setPersonalityResult,
  ] = useState(null);

  const [
    recommendationResult,
    setRecommendationResult,
  ] = useState(null);

  const [
    trendResult,
    setTrendResult,
  ] = useState(null);

  const [
    scoreResult,
    setScoreResult,
  ] = useState(null);

  const [
    submittedQuestion,
    setSubmittedQuestion,
  ] = useState("");


  // ==========================================
  // PDF REPORT STATES
  // ==========================================

  const [
    lastReadingRequest,
    setLastReadingRequest,
  ] = useState(null);

  const [
    lastReadingResponse,
    setLastReadingResponse,
  ] = useState(null);

  const [
    isDownloadingPdf,
    setIsDownloadingPdf,
  ] = useState(false);


  // ==========================================
  // ANALYTICS STATES
  // ==========================================

  const [
    analyticsSummary,
    setAnalyticsSummary,
  ] = useState(null);

  const [
    readingHistory,
    setReadingHistory,
  ] = useState([]);

  const [
    isLoadingAnalytics,
    setIsLoadingAnalytics,
  ] = useState(false);

  const [
    analyticsError,
    setAnalyticsError,
  ] = useState("");


  // ==========================================
  // GENERAL UI STATES
  // ==========================================

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);


  // ==========================================
  // CLEAR PREVIOUS AI RESULTS
  // ==========================================

  const clearPreviousResults = () => {
    setInterpretationResult(null);

    setPersonalityResult(null);

    setRecommendationResult(null);

    setTrendResult(null);

    setScoreResult(null);

    setSubmittedQuestion("");

    setLastReadingRequest(null);

    setLastReadingResponse(null);
  };


  // ==========================================
  // LOAD ANALYTICS
  // ==========================================

  const loadAnalytics =
    useCallback(async () => {
      setIsLoadingAnalytics(true);

      setAnalyticsError("");

      try {
        const [
          summaryResponse,
          historyResponse,
        ] = await Promise.all([
          getAnalyticsSummary(),
          getReadingHistory(10),
        ]);

        setAnalyticsSummary(
          summaryResponse
        );

        setReadingHistory(
          historyResponse
        );
      } catch (error) {
        console.error(
          "ANALYTICS ERROR:",
          error
        );

        setAnalyticsError(
          error?.message ||
            "Analytics could not be loaded."
        );
      } finally {
        setIsLoadingAnalytics(false);
      }
    }, []);


  // ==========================================
  // LOAD ANALYTICS ON PAGE OPEN
  // ==========================================

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);


  // ==========================================
  // CLEAN PALM PREVIEW URL
  // ==========================================

  useEffect(() => {
    return () => {
      if (palmPreview) {
        URL.revokeObjectURL(
          palmPreview
        );
      }
    };
  }, [palmPreview]);


  // ==========================================
  // FORM FIELD CHANGE
  // ==========================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previousData) => ({
        ...previousData,
        [name]: value,
      })
    );

    if (name === "spread") {
      setTarotCards([]);

      clearPreviousResults();

      setErrorMessage("");
    }
  };


  // ==========================================
  // PALM IMAGE SELECTION
  // ==========================================

  const handlePalmFileChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".heic",
      ".heif",
    ];

    const fileName =
      file.name.toLowerCase();

    const hasValidExtension =
      allowedExtensions.some(
        (extension) =>
          fileName.endsWith(
            extension
          )
      );

    if (!hasValidExtension) {
      setErrorMessage(
        "Please upload a JPG, JPEG, PNG, HEIC or HEIF image."
      );

      event.target.value = "";

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setErrorMessage(
        "Palm image must be smaller than 10 MB."
      );

      event.target.value = "";

      return;
    }

    if (palmPreview) {
      URL.revokeObjectURL(
        palmPreview
      );
    }

    const previewUrl =
      URL.createObjectURL(file);

    setPalmFile(file);

    setPalmPreview(
      previewUrl
    );

    setPalmResult(null);

    clearPreviousResults();

    setErrorMessage("");
  };


  // ==========================================
  // ANALYZE PALM
  // ==========================================

  const handleAnalyzePalm =
    async () => {
      if (!palmFile) {
        setErrorMessage(
          "Please select a palm image first."
        );

        return;
      }

      setIsAnalyzingPalm(true);

      setErrorMessage("");

      setPalmResult(null);

      clearPreviousResults();

      try {
        const response =
          await analyzePalmImage(
            palmFile
          );

        console.log(
          "PALM ANALYSIS RESPONSE:",
          response
        );

        if (
          !response ||
          !response.palm_analysis ||
          !response.output_files
        ) {
          throw new Error(
            "The backend returned an invalid palm analysis response."
          );
        }

        if (
          !response.palm_analysis
            .heart_line ||
          !response.palm_analysis
            .head_line ||
          !response.palm_analysis
            .life_line
        ) {
          throw new Error(
            "The palm model did not return all three palm-line results."
          );
        }

        setPalmResult(
          response
        );
      } catch (error) {
        console.error(
          "PALM ANALYSIS ERROR:",
          error
        );

        setErrorMessage(
          error?.message ||
            "Palm image could not be analyzed."
        );
      } finally {
        setIsAnalyzingPalm(
          false
        );
      }
    };


  // ==========================================
  // DRAW TAROT CARDS
  // ==========================================

  const handleDrawTarot =
    async () => {
      setIsDrawingTarot(true);

      setErrorMessage("");

      setTarotCards([]);

      clearPreviousResults();

      try {
        const response =
          await drawTarotCards(
            formData.spread
          );

        console.log(
          "TAROT DRAW RESPONSE:",
          response
        );

        if (
          !response ||
          !Array.isArray(
            response.cards
          ) ||
          response.cards.length === 0
        ) {
          throw new Error(
            "The backend did not return any tarot cards."
          );
        }

        setTarotCards(
          response.cards
        );
      } catch (error) {
        console.error(
          "TAROT DRAW ERROR:",
          error
        );

        setErrorMessage(
          error?.message ||
            "Tarot cards could not be drawn."
        );
      } finally {
        setIsDrawingTarot(
          false
        );
      }
    };


  // ==========================================
  // DOWNLOAD COMPLETE READING PDF
  // ==========================================

  const handleDownloadReadingPdf =
    async () => {
      if (
        !lastReadingRequest ||
        !lastReadingResponse
      ) {
        setErrorMessage(
          "Generate a complete reading before downloading the PDF report."
        );

        return;
      }

      setIsDownloadingPdf(true);

      setErrorMessage("");

      try {
        await downloadReadingPdf(
          lastReadingRequest,
          lastReadingResponse
        );
      } catch (error) {
        console.error(
          "PDF DOWNLOAD ERROR:",
          error
        );

        setErrorMessage(
          error?.message ||
            "The PDF report could not be downloaded."
        );
      } finally {
        setIsDownloadingPdf(
          false
        );
      }
    };


  // ==========================================
  // GENERATE COMPLETE READING
  // ==========================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setErrorMessage("");

      clearPreviousResults();


      // Palm analysis required
      if (
        !palmResult?.palm_analysis
      ) {
        setErrorMessage(
          "Please upload and analyze a palm image before generating the reading."
        );

        return;
      }


      // Tarot cards required
      if (
        !Array.isArray(
          tarotCards
        ) ||
        tarotCards.length === 0
      ) {
        setErrorMessage(
          "Please draw tarot cards before generating the reading."
        );

        return;
      }


      setIsLoading(true);


      const interestsList =
        formData.interests
          .split(",")
          .map(
            (interest) =>
              interest.trim()
          )
          .filter(Boolean);


      const readingData = {
        user_profile: {
          name:
            formData.name.trim(),

          age_group:
            formData.age_group,

          interests:
            interestsList,

          spiritual_goal:
            formData.spiritual_goal.trim(),

          reading_preference:
            formData.reading_preference,
        },


        reading_context: {
          question:
            formData.question.trim(),

          category:
            formData.category,
        },


        palm_analysis: {
          heart_line:
            palmResult
              .palm_analysis
              .heart_line,

          head_line:
            palmResult
              .palm_analysis
              .head_line,

          life_line:
            palmResult
              .palm_analysis
              .life_line,
        },


        tarot_analysis: {
          spread:
            formData.spread,

          cards:
            tarotCards.map(
              (card) => ({
                position:
                  card.position,

                name:
                  card.name,

                orientation:
                  card.orientation,

                keywords:
                  Array.isArray(
                    card.keywords
                  )
                    ? card.keywords
                    : [],

                selected_meaning:
                  card.selected_meaning,
              })
            ),
        },
      };


      console.log(
        "COMPLETE READING REQUEST:",
        readingData
      );


      try {
        const response =
          await generateCompleteReading(
            readingData
          );

        console.log(
          "COMPLETE READING RESPONSE:",
          response
        );


        if (
          !response ||
          typeof response !==
            "object"
        ) {
          throw new Error(
            "The backend returned an invalid response."
          );
        }


        const reading =
          response.reading;

        const scores =
          response.scores;


        if (
          !reading ||
          typeof reading !==
            "object"
        ) {
          throw new Error(
            "The complete reading was missing from the backend response."
          );
        }


        if (
          !reading.interpretation ||
          !reading.personality ||
          !reading.recommendations ||
          !reading.trends
        ) {
          throw new Error(
            "One or more reading modules were missing from the response."
          );
        }


        // Store request and response
        // for PDF generation
        setLastReadingRequest(
          readingData
        );

        setLastReadingResponse(
          response
        );


        setInterpretationResult(
          reading.interpretation
        );

        setPersonalityResult(
          reading.personality
        );

        setRecommendationResult(
          reading.recommendations
        );

        setTrendResult(
          reading.trends
        );


        if (
          scores &&
          typeof scores ===
            "object"
        ) {
          setScoreResult(
            scores
          );
        }


        setSubmittedQuestion(
          formData.question.trim()
        );


        // Refresh analytics after
        // successful reading
        await loadAnalytics();

      } catch (error) {
        console.error(
          "COMPLETE READING ERROR:",
          error
        );

        setErrorMessage(
          error?.message ||
            "The complete personalized reading could not be generated."
        );
      } finally {
        setIsLoading(false);
      }
    };


  // ==========================================
  // READING RESULT CHECK
  // ==========================================

  const hasResults =
    interpretationResult ||
    personalityResult ||
    recommendationResult ||
    trendResult ||
    scoreResult;


  return (
    <div className="app">

      {/* ===================================== */}
      {/* HERO */}
      {/* ===================================== */}

      <header className="hero">

        <p className="eyebrow">
          AI-POWERED SPIRITUAL GUIDANCE
        </p>

        <h1>
          Palmistry & Tarot
          Intelligence Platform
        </h1>

        <p className="hero-description">
          Upload a palm image,
          automatically analyze the
          principal palm lines, draw
          tarot cards from the complete
          78-card tarot dataset and
          generate a personalized
          AI-powered reading.
        </p>

      </header>


      <main>

        {/* =================================== */}
        {/* USER READING FORM */}
        {/* =================================== */}

        <form
          className="reading-form"
          onSubmit={handleSubmit}
        >

          <h2>
            Create Personalized Reading
          </h2>


          {/* ================================= */}
          {/* USER PROFILE */}
          {/* ================================= */}

          <section className="form-section">

            <h3>User Profile</h3>


            <div className="form-grid">

              <div className="form-group">

                <label htmlFor="name">
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  minLength={2}
                  maxLength={100}
                  required
                />

              </div>


              <div className="form-group">

                <label htmlFor="age_group">
                  Age group
                </label>

                <select
                  id="age_group"
                  name="age_group"
                  value={
                    formData.age_group
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="Under 18">
                    Under 18
                  </option>

                  <option value="18-25">
                    18-25
                  </option>

                  <option value="26-40">
                    26-40
                  </option>

                  <option value="41-60">
                    41-60
                  </option>

                  <option value="60+">
                    60+
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label
                  htmlFor="reading_preference"
                >
                  Reading preference
                </label>

                <select
                  id="reading_preference"
                  name="reading_preference"
                  value={
                    formData
                      .reading_preference
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="Concise">
                    Concise
                  </option>

                  <option value="Detailed">
                    Detailed
                  </option>

                  <option value="Practical">
                    Practical
                  </option>

                  <option value="Spiritual">
                    Spiritual
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label htmlFor="category">
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="Career">
                    Career
                  </option>

                  <option value="Relationship">
                    Relationship
                  </option>

                  <option value="Personal Growth">
                    Personal Growth
                  </option>

                  <option value="General Guidance">
                    General Guidance
                  </option>

                </select>

              </div>

            </div>


            <div className="form-group">

              <label htmlFor="interests">
                Interests, separated
                by commas
              </label>

              <input
                id="interests"
                name="interests"
                type="text"
                value={
                  formData.interests
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>


            <div className="form-group">

              <label htmlFor="spiritual_goal">
                Personal or spiritual
                goal
              </label>

              <textarea
                id="spiritual_goal"
                name="spiritual_goal"
                value={
                  formData.spiritual_goal
                }
                onChange={
                  handleChange
                }
                rows={3}
                required
              />

            </div>


            <div className="form-group">

              <label htmlFor="question">
                Question
              </label>

              <textarea
                id="question"
                name="question"
                value={
                  formData.question
                }
                onChange={
                  handleChange
                }
                rows={4}
                minLength={3}
                maxLength={500}
                required
              />

            </div>

          </section>


          {/* ================================= */}
          {/* PALM ANALYSIS */}
          {/* ================================= */}

          <section className="form-section">

            <h3>
              Palm Image Analysis
            </h3>

            <p className="section-note">
              Upload a clear front-facing
              palm image. The model will
              automatically analyze the
              heart line, head line and
              life line.
            </p>


            <div className="form-group">

              <label htmlFor="palm-image">
                Upload palm image
              </label>

              <input
                id="palm-image"
                type="file"
                accept=".jpg,.jpeg,.png,.heic,.heif,image/jpeg,image/png"
                onChange={
                  handlePalmFileChange
                }
                disabled={
                  isAnalyzingPalm ||
                  isLoading
                }
              />

            </div>


            {palmPreview && (

              <div
                className="palm-preview-container"
              >

                <h4>
                  Selected Palm Image
                </h4>

                <img
                  src={palmPreview}
                  alt="Selected palm preview"
                  className="palm-preview-image"
                />

              </div>

            )}


            <button
              className="generate-button"
              type="button"
              onClick={
                handleAnalyzePalm
              }
              disabled={
                !palmFile ||
                isAnalyzingPalm ||
                isLoading
              }
            >

              {isAnalyzingPalm
                ? "Analyzing Palm..."
                : palmResult
                  ? "Analyze Palm Again"
                  : "Analyze Palm"}

            </button>


            {isAnalyzingPalm && (

              <p className="section-note">
                Palm analysis is running.
                This may take several
                seconds.
              </p>

            )}


            {palmResult && (

              <div
                className="palm-analysis-results"
              >

                <article
                  className="result-card"
                >

                  <h4>
                    Palm Analysis Result
                  </h4>

                  <p>
                    <strong>
                      Heart line:
                    </strong>{" "}
                    {
                      palmResult
                        .palm_analysis
                        .heart_line
                    }
                  </p>

                  <p>
                    <strong>
                      Head line:
                    </strong>{" "}
                    {
                      palmResult
                        .palm_analysis
                        .head_line
                    }
                  </p>

                  <p>
                    <strong>
                      Life line:
                    </strong>{" "}
                    {
                      palmResult
                        .palm_analysis
                        .life_line
                    }
                  </p>

                </article>


                {palmResult.descriptions && (

                  <article
                    className="result-card"
                  >

                    <h4>
                      Palm Line Descriptions
                    </h4>

                    <p>
                      <strong>
                        Heart:
                      </strong>{" "}
                      {
                        palmResult
                          .descriptions
                          .heart_line
                      }
                    </p>

                    <p>
                      <strong>
                        Head:
                      </strong>{" "}
                      {
                        palmResult
                          .descriptions
                          .head_line
                      }
                    </p>

                    <p>
                      <strong>
                        Life:
                      </strong>{" "}
                      {
                        palmResult
                          .descriptions
                          .life_line
                      }
                    </p>

                  </article>

                )}


                {palmResult
                  .output_files
                  ?.result_image_url && (

                  <article
                    className="result-card"
                  >

                    <h4>
                      Processed Palm Result
                    </h4>

                    <img
                      src={
                        backendBaseUrl +
                        palmResult
                          .output_files
                          .result_image_url
                      }
                      alt="Palm analysis result"
                      className="palm-result-image"
                    />

                  </article>

                )}


                {palmResult
                  .output_files
                  ?.warped_palm_url && (

                  <article
                    className="result-card"
                  >

                    <h4>
                      Warped Palm
                    </h4>

                    <img
                      src={
                        backendBaseUrl +
                        palmResult
                          .output_files
                          .warped_palm_url
                      }
                      alt="Warped palm"
                      className="palm-result-image"
                    />

                  </article>

                )}


                {palmResult
                  .output_files
                  ?.palm_lines_url && (

                  <article
                    className="result-card"
                  >

                    <h4>
                      Detected Palm Lines
                    </h4>

                    <img
                      src={
                        backendBaseUrl +
                        palmResult
                          .output_files
                          .palm_lines_url
                      }
                      alt="Detected palm lines"
                      className="palm-result-image"
                    />

                  </article>

                )}

              </div>

            )}

          </section>


          {/* ================================= */}
          {/* TAROT */}
          {/* ================================= */}

          <section className="form-section">

            <h3>Tarot Reading</h3>

            <p className="section-note">
              Select a spread and draw
              random cards from the
              complete 78-card tarot
              dataset.
            </p>


            <div className="form-group">

              <label htmlFor="spread">
                Tarot spread
              </label>

              <select
                id="spread"
                name="spread"
                value={
                  formData.spread
                }
                onChange={
                  handleChange
                }
              >

                <option value="Single Card">
                  Single Card
                </option>

                <option value="Past-Present-Future">
                  Past-Present-Future
                </option>

              </select>

            </div>


            <button
              className="generate-button"
              type="button"
              onClick={
                handleDrawTarot
              }
              disabled={
                isDrawingTarot ||
                isAnalyzingPalm ||
                isLoading
              }
            >

              {isDrawingTarot
                ? "Drawing Tarot Cards..."
                : tarotCards.length > 0
                  ? "Draw New Tarot Cards"
                  : "Draw Tarot Cards"}

            </button>


            {tarotCards.length > 0 && (

              <div className="tarot-grid">

                {tarotCards.map(
                  (card, index) => (

                    <article
                      className="tarot-card"
                      key={
                        `${card.name}-` +
                        `${card.position}-` +
                        `${index}`
                      }
                    >

                      <span>
                        {card.position}
                      </span>

                      <h4>
                        {card.name}
                      </h4>


                      <p>
                        <strong>
                          Orientation:
                        </strong>{" "}
                        {
                          card.orientation
                        }
                      </p>


                      {card.number && (

                        <p>
                          <strong>
                            Number:
                          </strong>{" "}
                          {
                            card.number
                          }
                        </p>

                      )}


                      {card.arcana && (

                        <p>
                          <strong>
                            Arcana:
                          </strong>{" "}
                          {
                            card.arcana
                          }
                        </p>

                      )}


                      {card.suit && (

                        <p>
                          <strong>
                            Suit:
                          </strong>{" "}
                          {
                            card.suit
                          }
                        </p>

                      )}


                      {Array.isArray(
                        card.keywords
                      ) &&
                        card.keywords.length > 0 && (

                        <p>
                          <strong>
                            Keywords:
                          </strong>{" "}
                          {
                            card.keywords
                              .join(", ")
                          }
                        </p>

                      )}


                      <p>
                        <strong>
                          Selected Meaning:
                        </strong>{" "}
                        {
                          card
                            .selected_meaning
                        }
                      </p>

                    </article>

                  )
                )}

              </div>

            )}

          </section>


          {/* ================================= */}
          {/* COMPLETE READING BUTTON */}
          {/* ================================= */}

          <button
            className="generate-button"
            type="submit"
            disabled={
              isLoading ||
              isDrawingTarot ||
              isAnalyzingPalm ||
              !palmResult ||
              tarotCards.length === 0
            }
          >

            {isLoading
              ? "Generating Complete Reading..."
              : "Generate Complete Reading"}

          </button>


          {!palmResult &&
            !errorMessage && (

            <p className="section-note">
              Upload and analyze a palm
              image before generating the
              complete reading.
            </p>

          )}


          {palmResult &&
            tarotCards.length === 0 &&
            !errorMessage && (

            <p className="section-note">
              Palm analysis is complete.
              Draw tarot cards to continue.
            </p>

          )}


          {errorMessage && (

            <div
              className="error-message"
              role="alert"
            >

              <strong>
                Operation failed
              </strong>

              <p>
                {errorMessage}
              </p>

            </div>

          )}

        </form>


        {/* =================================== */}
        {/* PERSONALIZED DASHBOARD */}
        {/* =================================== */}

        {hasResults && (

          <section
            className="result-section"
          >

            <p className="eyebrow">
              PERSONALIZED DASHBOARD
            </p>

            <h2>
              Complete Reading Results
            </h2>


            {/* PDF DOWNLOAD */}

            <button
              type="button"
              className="generate-button"
              onClick={
                handleDownloadReadingPdf
              }
              disabled={
                isDownloadingPdf ||
                !lastReadingResponse
              }
            >

              {isDownloadingPdf
                ? "Preparing PDF..."
                : "Download Complete Reading PDF"}

            </button>


            <article
              className="result-card"
            >

              <h3>User Question</h3>

              <p>
                {submittedQuestion}
              </p>

            </article>


            <article
              className="result-card"
            >

              <h3>
                Palm Results Used
              </h3>

              <p>
                <strong>
                  Heart line:
                </strong>{" "}
                {
                  palmResult
                    ?.palm_analysis
                    ?.heart_line
                }
              </p>

              <p>
                <strong>
                  Head line:
                </strong>{" "}
                {
                  palmResult
                    ?.palm_analysis
                    ?.head_line
                }
              </p>

              <p>
                <strong>
                  Life line:
                </strong>{" "}
                {
                  palmResult
                    ?.palm_analysis
                    ?.life_line
                }
              </p>

            </article>


            <article
              className="result-card"
            >

              <h3>
                Selected Tarot Spread
              </h3>

              <p>
                {formData.spread}
              </p>

            </article>


            <article
              className="result-card"
            >

              <h3>
                Cards Used in This Reading
              </h3>

              <SafeList
                items={
                  tarotCards.map(
                    (card) =>
                      `${card.position}: ` +
                      `${card.name} ` +
                      `(${card.orientation})`
                  )
                }
                emptyMessage="No tarot cards were used."
                itemKeyPrefix="used-tarot-card"
              />

            </article>

          </section>

        )}


        {/* =================================== */}
        {/* AI INTERPRETATION */}
        {/* =================================== */}

        {interpretationResult && (

          <section
            className="result-section"
          >

            <p className="eyebrow">
              AI INTERPRETATION
            </p>

            <h2>
              Combined Palm and Tarot
              Reading
            </h2>


            <article
              className="result-card"
            >

              <h3>
                Overall Summary
              </h3>

              <p>
                {
                  interpretationResult
                    ?.overall_summary ||
                  "No overall summary was returned."
                }
              </p>

            </article>


            <div className="result-grid">

              <article
                className="result-card"
              >

                <h3>
                  Palm Interpretation
                </h3>

                <p>
                  {
                    interpretationResult
                      ?.palm_interpretation ||
                    "No palm interpretation was returned."
                  }
                </p>

              </article>


              <article
                className="result-card"
              >

                <h3>
                  Tarot Interpretation
                </h3>

                <p>
                  {
                    interpretationResult
                      ?.tarot_interpretation ||
                    "No tarot interpretation was returned."
                  }
                </p>

              </article>

            </div>


            <article
              className="result-card"
            >

              <h3>
                Combined Interpretation
              </h3>

              <p>
                {
                  interpretationResult
                    ?.combined_interpretation ||
                  "No combined interpretation was returned."
                }
              </p>

            </article>


            <div className="result-grid">

              <article
                className="result-card"
              >

                <h3>
                  Key Strengths
                </h3>

                <SafeList
                  items={
                    interpretationResult
                      ?.key_strengths
                  }
                  emptyMessage="No key strengths were returned."
                  itemKeyPrefix="interpretation-strength"
                />

              </article>


              <article
                className="result-card"
              >

                <h3>
                  Growth Areas
                </h3>

                <SafeList
                  items={
                    interpretationResult
                      ?.growth_areas
                  }
                  emptyMessage="No growth areas were returned."
                  itemKeyPrefix="interpretation-growth"
                />

              </article>

            </div>


            <article
              className="result-card"
            >

              <h3>
                Current Focus
              </h3>

              <p>
                {
                  interpretationResult
                    ?.current_focus ||
                  "No current focus was returned."
                }
              </p>

            </article>


            <article
              className="result-card"
            >

              <h3>
                Key Message
              </h3>

              <p>
                {
                  interpretationResult
                    ?.key_message ||
                  "No key message was returned."
                }
              </p>

            </article>


            <article
              className="result-card"
            >

              <h3>
                Reflection Question
              </h3>

              <p>
                {
                  interpretationResult
                    ?.reflection_question ||
                  "No reflection question was returned."
                }
              </p>

            </article>


            <p className="disclaimer">

              {
                interpretationResult
                  ?.disclaimer ||
                "This reading is intended for entertainment and personal reflection only."
              }

            </p>

          </section>

        )}


        {/* =================================== */}
        {/* PERSONALITY */}
        {/* =================================== */}

        {personalityResult && (

          <section
            className="result-section"
          >

            <p className="eyebrow">
              PERSONALITY INTELLIGENCE
            </p>

            <h2>
              Symbolic Personality
              Profile
            </h2>


            <article
              className="result-card"
            >

              <h3>
                Personality Summary
              </h3>

              <p>
                {
                  personalityResult
                    ?.personality_summary ||
                  "No personality summary was returned."
                }
              </p>

            </article>


            <article
              className="result-card"
            >

              <h3>
                Dominant Traits
              </h3>

              <SafeList
                items={
                  personalityResult
                    ?.dominant_traits
                }
                emptyMessage="No dominant traits were returned."
                itemKeyPrefix="dominant-trait"
              />

            </article>


            <div className="result-grid">

              <article
                className="result-card"
              >

                <h3>
                  Emotional Style
                </h3>

                <p>
                  {
                    personalityResult
                      ?.emotional_style ||
                    "No emotional style was returned."
                  }
                </p>

              </article>


              <article
                className="result-card"
              >

                <h3>
                  Thinking Style
                </h3>

                <p>
                  {
                    personalityResult
                      ?.thinking_style ||
                    "No thinking style was returned."
                  }
                </p>

              </article>

            </div>


            <div className="result-grid">

              <article
                className="result-card"
              >

                <h3>
                  Decision Style
                </h3>

                <p>
                  {
                    personalityResult
                      ?.decision_style ||
                    "No decision style was returned."
                  }
                </p>

              </article>


              <article
                className="result-card"
              >

                <h3>
                  Relationship Style
                </h3>

                <p>
                  {
                    personalityResult
                      ?.relationship_style ||
                    "No relationship style was returned."
                  }
                </p>

              </article>

            </div>


            <div className="result-grid">

              <article
                className="result-card"
              >

                <h3>
                  Personality Strengths
                </h3>

                <SafeList
                  items={
                    personalityResult
                      ?.strengths
                  }
                  emptyMessage="No personality strengths were returned."
                  itemKeyPrefix="personality-strength"
                />

              </article>


              <article
                className="result-card"
              >

                <h3>
                  Development Areas
                </h3>

                <SafeList
                  items={
                    personalityResult
                      ?.development_areas
                  }
                  emptyMessage="No development areas were returned."
                  itemKeyPrefix="development-area"
                />

              </article>

            </div>


            <article
              className="result-card"
            >

              <h3>
                Growth Advice
              </h3>

              <SafeList
                items={
                  personalityResult
                    ?.growth_advice
                }
                emptyMessage="No growth advice was returned."
                itemKeyPrefix="growth-advice"
              />

            </article>


            <p className="disclaimer">
              This personality profile is
              a symbolic self-reflection
              output. It is not a
              scientific personality
              assessment or diagnosis.
            </p>

          </section>

        )}


        {/* =================================== */}
        {/* RECOMMENDATIONS */}
        {/* =================================== */}

        {recommendationResult && (

          <section
            className="result-section"
          >

            <p className="eyebrow">
              PERSONALIZED
              RECOMMENDATIONS
            </p>

            <h2>
              Recommendation Engine
            </h2>


            <article
              className="result-card"
            >

              <h3>
                Recommendation Summary
              </h3>

              <p>
                {
                  recommendationResult
                    ?.recommendation_summary ||
                  "No recommendation summary was returned."
                }
              </p>

            </article>


            <div className="result-grid">

              <article
                className="result-card"
              >

                <h3>
                  Personal Growth
                </h3>

                <SafeList
                  items={
                    recommendationResult
                      ?.personal_growth
                  }
                  emptyMessage="No personal-growth recommendations were returned."
                  itemKeyPrefix="personal-growth"
                />

              </article>


              <article
                className="result-card"
              >

                <h3>Career</h3>

                <SafeList
                  items={
                    recommendationResult
                      ?.career
                  }
                  emptyMessage="No career recommendations were returned."
                  itemKeyPrefix="career"
                />

              </article>

            </div>


            <div className="result-grid">

              <article
                className="result-card"
              >

                <h3>
                  Relationships
                </h3>

                <SafeList
                  items={
                    recommendationResult
                      ?.relationships
                  }
                  emptyMessage="No relationship recommendations were returned."
                  itemKeyPrefix="relationship"
                />

              </article>


              <article
                className="result-card"
              >

                <h3>
                  Goal Alignment
                </h3>

                <SafeList
                  items={
                    recommendationResult
                      ?.goal_alignment
                  }
                  emptyMessage="No goal-alignment recommendations were returned."
                  itemKeyPrefix="goal-alignment"
                />

              </article>

            </div>


            <article
              className="result-card"
            >

              <h3>
                Spiritual Development
              </h3>

              <SafeList
                items={
                  recommendationResult
                    ?.spiritual_development
                }
                emptyMessage="No spiritual-development recommendations were returned."
                itemKeyPrefix="spiritual-development"
              />

            </article>


            <div className="result-grid">

              <article
                className="result-card"
              >

                <h3>
                  Immediate Actions
                </h3>

                <SafeList
                  items={
                    recommendationResult
                      ?.immediate_actions
                  }
                  emptyMessage="No immediate actions were returned."
                  itemKeyPrefix="immediate-action"
                />

              </article>


              <article
                className="result-card"
              >

                <h3>
                  Long-Term Actions
                </h3>

                <SafeList
                  items={
                    recommendationResult
                      ?.long_term_actions
                  }
                  emptyMessage="No long-term actions were returned."
                  itemKeyPrefix="long-term-action"
                />

              </article>

            </div>


            <p className="disclaimer">
              These recommendations are
              reflective guidance and are
              not medical, legal, financial
              or professional advice.
            </p>

          </section>

        )}


        {/* =================================== */}
        {/* LIFE TRENDS */}
        {/* =================================== */}

        {trendResult && (

          <section
            className="result-section"
          >

            <p className="eyebrow">
              LIFE TREND ANALYSIS
            </p>

            <h2>
              Symbolic Life Trends
            </h2>


            <article
              className="result-card"
            >

              <h3>
                Trend Summary
              </h3>

              <p>
                {
                  trendResult
                    ?.trend_summary ||
                  "No trend summary was returned."
                }
              </p>

            </article>


            <article
              className="result-card"
            >

              <h3>
                Current Theme
              </h3>

              <p>
                {
                  trendResult
                    ?.current_theme ||
                  "No current theme was returned."
                }
              </p>

            </article>


            <div className="result-grid">

              <article
                className="result-card"
              >

                <h3>
                  Possible Theme for
                  the Next 30 Days
                </h3>

                <p>
                  {
                    trendResult
                      ?.next_30_days ||
                    "No short-term theme was returned."
                  }
                </p>

              </article>


              <article
                className="result-card"
              >

                <h3>
                  Possible Theme for
                  the Next 3 Months
                </h3>

                <p>
                  {
                    trendResult
                      ?.next_3_months ||
                    "No three-month theme was returned."
                  }
                </p>

              </article>

            </div>


            <div className="result-grid">

              <article
                className="result-card"
              >

                <h3>
                  Opportunities
                </h3>

                <SafeList
                  items={
                    trendResult
                      ?.opportunities
                  }
                  emptyMessage="No opportunities were returned."
                  itemKeyPrefix="trend-opportunity"
                />

              </article>


              <article
                className="result-card"
              >

                <h3>
                  Challenges
                </h3>

                <SafeList
                  items={
                    trendResult
                      ?.challenges
                  }
                  emptyMessage="No challenges were returned."
                  itemKeyPrefix="trend-challenge"
                />

              </article>

            </div>


            <div className="result-grid">

              <article
                className="result-card"
              >

                <h3>
                  Recommended Focus
                </h3>

                <SafeList
                  items={
                    trendResult
                      ?.recommended_focus
                  }
                  emptyMessage="No recommended focus was returned."
                  itemKeyPrefix="trend-focus"
                />

              </article>


              <article
                className="result-card"
              >

                <h3>
                  Practical Actions
                </h3>

                <SafeList
                  items={
                    trendResult
                      ?.practical_actions
                  }
                  emptyMessage="No practical actions were returned."
                  itemKeyPrefix="trend-action"
                />

              </article>

            </div>


            <p className="disclaimer">

              {
                trendResult
                  ?.disclaimer ||
                "Life trends are symbolic themes, not guaranteed predictions."
              }

            </p>

          </section>

        )}


        {/* =================================== */}
        {/* GUIDANCE SCORES */}
        {/* =================================== */}

        {scoreResult && (

          <section
            className="result-section"
          >

            <p className="eyebrow">
              GUIDANCE SCORING
            </p>

            <h2>
              Reading Quality and
              Alignment Scores
            </h2>


            <div className="result-grid">

              <ScoreCard
                title="Palm Analysis Confidence"
                value={
                  scoreResult
                    ?.palm_analysis_confidence
                }
              />

              <ScoreCard
                title="Tarot Interpretation Relevance"
                value={
                  scoreResult
                    ?.tarot_interpretation_relevance
                }
              />

            </div>


            <div className="result-grid">

              <ScoreCard
                title="Personality Alignment"
                value={
                  scoreResult
                    ?.personality_alignment
                }
              />

              <ScoreCard
                title="User-Context Relevance"
                value={
                  scoreResult
                    ?.user_context_relevance
                }
              />

            </div>


            <div className="result-grid">

              <ScoreCard
                title="Reading Consistency"
                value={
                  scoreResult
                    ?.reading_consistency
                }
              />


              <article
                className="result-card"
              >

                <h3>
                  Overall Insight Score
                </h3>

                <p>
                  <strong>

                    {
                      Number(
                        scoreResult
                          ?.overall_insight_score ||
                          0
                      ).toFixed(2)
                    }{" "}
                    / 100

                  </strong>
                </p>

                <p>
                  {
                    scoreResult
                      ?.score_label ||
                    "No score label was returned."
                  }
                </p>

              </article>

            </div>


            <article
              className="result-card"
            >

              <h3>
                Calculation Method
              </h3>

              <p>
                {
                  scoreResult
                    ?.calculation_method ||
                  "No calculation method was returned."
                }
              </p>

            </article>


            <p className="disclaimer">

              {
                scoreResult
                  ?.disclaimer ||
                "These scores measure prototype completeness, relevance and consistency. They do not measure scientific accuracy."
              }

            </p>

          </section>

        )}


        {/* =================================== */}
        {/* MILESTONE 4 ANALYTICS DASHBOARD */}
        {/* =================================== */}

        <AnalyticsDashboard
          summary={
            analyticsSummary
          }
          history={
            readingHistory
          }
          isLoading={
            isLoadingAnalytics
          }
          error={
            analyticsError
          }
          onRefresh={
            loadAnalytics
          }
        />

      </main>

    </div>
  );
}


export default App;