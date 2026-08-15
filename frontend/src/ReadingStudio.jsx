import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router";

import {
  useAuth,
} from "./auth/AuthContext";

import {
  API_BASE_URL,
  analyzePalmImage,
  buildBackendUrl,
  drawTarotCards,
  generateCompleteReading,
  downloadReadingPdf,
} from "./services/api";

import ReadingChat from
  "./components/ReadingChat";

import "./App.css";


// ============================================================
// REUSABLE COMPONENTS
// ============================================================

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
        <li>
          {emptyMessage}
        </li>
      </ul>
    );
  }

  return (
    <ul>
      {items.map(
        (item, index) => (
          <li
            key={`${itemKeyPrefix}-${index}`}
          >
            {String(item)}
          </li>
        )
      )}
    </ul>
  );
}


function ScoreCard({
  title,
  value,
}) {
  const numericValue =
    Number(value);

  const formattedValue =
    Number.isFinite(
      numericValue
    )
      ? numericValue.toFixed(2)
      : "0.00";

  return (
    <article className="result-card">

      <h3>
        {title}
      </h3>

      <p>
        <strong>
          {formattedValue} / 100
        </strong>
      </p>

    </article>
  );
}


function TextCard({
  title,
  children,
}) {
  return (
    <article className="result-card">

      <h3>
        {title}
      </h3>

      <p>
        {
          children ||
          "No information was returned."
        }
      </p>

    </article>
  );
}


// ============================================================
// MAIN READING STUDIO
// ============================================================

function ReadingStudio() {

  // ==========================================================
  // AUTHENTICATED USER
  // ==========================================================

  const {
    user,
  } = useAuth();


  // ==========================================================
  // READING FORM
  // ==========================================================

  const [
    formData,
    setFormData,
  ] = useState({

    name: "",

    age_group: "",

    interests: "",

    spiritual_goal: "",

    reading_preference: "",

    question: "",

    category: "",

    spread: "",

  });


  // ==========================================================
  // LOAD PROFILE INTO READING STUDIO
  // ==========================================================

  useEffect(() => {

    if (!user) {
      return;
    }


    setFormData(
      (previous) => ({

        ...previous,

        name:
          user.full_name || "",

        age_group:
          user.age_group || "",

        interests:
          user.interests || "",

        spiritual_goal:
          user.spiritual_goal || "",

        reading_preference:
          user.reading_preference || "",

      })
    );

  }, [user]);


  // ==========================================================
  // PROFILE COMPLETENESS
  // ==========================================================

  const profileReady =
    Boolean(
      formData.name.trim() &&
      formData.age_group &&
      formData.interests.trim() &&
      formData.spiritual_goal.trim() &&
      formData.reading_preference
    );


  // ==========================================================
  // PALM
  // ==========================================================

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


  // ==========================================================
  // TAROT
  // ==========================================================

  const [
    tarotCards,
    setTarotCards,
  ] = useState([]);

  const [
    isDrawingTarot,
    setIsDrawingTarot,
  ] = useState(false);


  // ==========================================================
  // COMPLETE READING
  // ==========================================================

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


  // ==========================================================
  // READING DATA FOR PDF + CHAT
  // ==========================================================

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


  // ==========================================================
  // GENERAL
  // ==========================================================

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);


  // ==========================================================
  // CLEAR PREVIOUS READING
  // ==========================================================

  const clearPreviousResults =
    () => {

      setInterpretationResult(
        null
      );

      setPersonalityResult(
        null
      );

      setRecommendationResult(
        null
      );

      setTrendResult(
        null
      );

      setScoreResult(
        null
      );

      setSubmittedQuestion("");

      setLastReadingRequest(
        null
      );

      setLastReadingResponse(
        null
      );
    };


  // ==========================================================
  // CLEAN PALM PREVIEW
  // ==========================================================

  useEffect(() => {

    return () => {

      if (palmPreview) {

        URL.revokeObjectURL(
          palmPreview
        );

      }
    };

  }, [palmPreview]);


  // ==========================================================
  // READING INPUT CHANGE
  // ==========================================================

  const handleChange =
    (event) => {

      const {
        name,
        value,
      } = event.target;


      setFormData(
        (previous) => ({

          ...previous,

          [name]: value,

        })
      );


      setErrorMessage("");


      if (
        name === "spread"
      ) {

        setTarotCards([]);

        clearPreviousResults();

      }
    };


  // ==========================================================
  // PALM FILE
  // ==========================================================

  const handlePalmFileChange =
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
        file.name.toLowerCase();


      const isAllowed =
        allowedExtensions.some(
          (extension) =>
            fileName.endsWith(
              extension
            )
        );


      if (!isAllowed) {

        setErrorMessage(
          "Please upload a JPG, JPEG, JFIF, PNG, WEBP, HEIC or HEIF image."
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
        URL.createObjectURL(
          file
        );


      setPalmFile(
        file
      );

      setPalmPreview(
        previewUrl
      );

      setPalmResult(
        null
      );

      clearPreviousResults();

      setErrorMessage("");
    };


  // ==========================================================
  // ANALYZE PALM
  // ==========================================================

  const handleAnalyzePalm =
    async () => {

      if (!palmFile) {

        setErrorMessage(
          "Please select a palm image first."
        );

        return;
      }


      setIsAnalyzingPalm(
        true
      );

      setErrorMessage("");

      setPalmResult(
        null
      );

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
          !response
            ?.palm_analysis
        ) {

          throw new Error(
            "The backend returned an invalid palm analysis response."
          );

        }


        const {
          heart_line,
          head_line,
          life_line,
        } =
          response.palm_analysis;


        if (
          !heart_line ||
          !head_line ||
          !life_line
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


  // ==========================================================
  // DRAW TAROT
  // ==========================================================

  const handleDrawTarot =
    async () => {

      if (
        !formData.spread
      ) {

        setErrorMessage(
          "Please select a tarot spread first."
        );

        return;
      }


      setIsDrawingTarot(
        true
      );

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
          !Array.isArray(
            response?.cards
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


  // ==========================================================
  // COMPLETE READING
  // ==========================================================

  const handleSubmit =
    async (event) => {

      event.preventDefault();

      setErrorMessage("");

      clearPreviousResults();


      // ------------------------------------------------------
      // PROFILE VALIDATION
      // ------------------------------------------------------

      if (!profileReady) {

        setErrorMessage(
          "Your profile is incomplete. Please complete your Profile before generating a personalized reading."
        );

        return;
      }


      // ------------------------------------------------------
      // READING VALIDATION
      // ------------------------------------------------------

      if (
        !formData.category
      ) {

        setErrorMessage(
          "Please select a reading category."
        );

        return;
      }


      if (
        !formData.question.trim()
      ) {

        setErrorMessage(
          "Please enter your question."
        );

        return;
      }


      if (
        !formData.spread
      ) {

        setErrorMessage(
          "Please select a tarot spread."
        );

        return;
      }


      if (
        !palmResult
          ?.palm_analysis
      ) {

        setErrorMessage(
          "Please upload and analyze a palm image before generating the reading."
        );

        return;
      }


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


      // ------------------------------------------------------
      // INTERESTS
      // ------------------------------------------------------

      const interestsList =
        formData.interests

          .split(",")

          .map(
            (interest) =>
              interest.trim()
          )

          .filter(Boolean);


      // ------------------------------------------------------
      // REQUEST BODY
      // ------------------------------------------------------

      const readingData = {

        user_profile: {

          name:
            formData
              .name
              .trim(),

          age_group:
            formData
              .age_group,

          interests:
            interestsList,

          spiritual_goal:
            formData
              .spiritual_goal
              .trim(),

          reading_preference:
            formData
              .reading_preference,

        },


        reading_context: {

          question:
            formData
              .question
              .trim(),

          category:
            formData
              .category,

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

                image:
                  card.image || null,

              })
            ),

        },

      };


      setIsLoading(
        true
      );


      try {

        console.log(
          "COMPLETE READING REQUEST:",
          readingData
        );


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

        setIsLoading(
          false
        );

      }
    };


  // ==========================================================
  // PDF
  // ==========================================================

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


      setIsDownloadingPdf(
        true
      );

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


  // ==========================================================
  // RESULTS
  // ==========================================================

  const hasResults =
    Boolean(
      interpretationResult ||
      personalityResult ||
      recommendationResult ||
      trendResult ||
      scoreResult
    );


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div>

      {/* ==================================================== */}
      {/* HERO */}
      {/* ==================================================== */}

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
          draw tarot cards and generate
          a personalized AI-assisted
          spiritual reading.

        </p>


        <p className="section-note">
          Backend: {API_BASE_URL}
        </p>

      </header>


      <main>

        {/* ================================================== */}
        {/* READING FORM */}
        {/* ================================================== */}

        <form
          className="reading-form"
          onSubmit={
            handleSubmit
          }
        >

          <h2>
            Create Personalized Reading
          </h2>


          {/* ================================================= */}
          {/* SAVED PROFILE */}
          {/* ================================================= */}

          <section className="form-section">

            <h3>
              Saved Profile
            </h3>


            <p className="section-note">

              Your account profile is
              automatically used for this
              reading.

            </p>


            {!profileReady && (

              <div
                className="error-message"
                role="alert"
              >

                <strong>
                  Profile incomplete
                </strong>

                <p>
                  Complete your age group,
                  interests, personal goal
                  and reading preference
                  before generating a reading.
                </p>

                <p>
                  <Link to="/profile">
                    Open My Profile
                  </Link>
                </p>

              </div>

            )}


            <div className="form-grid">


              <article className="result-card">

                <h4>
                  Name
                </h4>

                <p>
                  {
                    formData.name ||
                    "Not provided"
                  }
                </p>

              </article>


              <article className="result-card">

                <h4>
                  Age Group
                </h4>

                <p>
                  {
                    formData.age_group ||
                    "Not provided"
                  }
                </p>

              </article>


              <article className="result-card">

                <h4>
                  Reading Preference
                </h4>

                <p>
                  {
                    formData
                      .reading_preference ||
                    "Not provided"
                  }
                </p>

              </article>


              <article className="result-card">

                <h4>
                  Account
                </h4>

                <p>
                  {
                    user?.email ||
                    "Unavailable"
                  }
                </p>

              </article>

            </div>


            <article className="result-card">

              <h4>
                Interests
              </h4>

              <p>
                {
                  formData.interests ||
                  "Not provided"
                }
              </p>

            </article>


            <article className="result-card">

              <h4>
                Personal or Spiritual Goal
              </h4>

              <p>
                {
                  formData.spiritual_goal ||
                  "Not provided"
                }
              </p>

            </article>


            <p className="section-note">

              Need to change these details?{" "}

              <Link to="/profile">
                Edit your profile
              </Link>

            </p>

          </section>


          {/* ================================================= */}
          {/* READING QUESTION */}
          {/* ================================================= */}

          <section className="form-section">

            <h3>
              Reading Question
            </h3>


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
                required
              >

                <option
                  value=""
                  disabled
                >
                  Select category
                </option>

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
                placeholder="Enter the question you would like guidance about"
                rows={4}
                minLength={3}
                maxLength={500}
                required
              />

            </div>

          </section>


          {/* ================================================= */}
          {/* PALM */}
          {/* ================================================= */}

          <section className="form-section">

            <h3>
              Palm Image Analysis
            </h3>


            <p className="section-note">

              Upload a clear front-facing
              palm image. The current
              prototype analyzes the
              heart line, head line
              and life line.

            </p>


            <div className="form-group">

              <label htmlFor="palm-image">
                Upload palm image
              </label>

              <input
                id="palm-image"
                type="file"
                accept=".jpg,.jpeg,.jfif,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp"
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

              <div className="palm-preview-container">

                <h4>
                  Selected Palm Image
                </h4>

                <img
                  src={
                    palmPreview
                  }
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

              {
                isAnalyzingPalm
                  ? "Analyzing Palm..."
                  : palmResult
                    ? "Analyze Palm Again"
                    : "Analyze Palm"
              }

            </button>


            {palmResult && (

              <div className="palm-analysis-results">

                <article className="result-card">

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
                        ?.heart_line
                    }
                  </p>


                  <p>
                    <strong>
                      Head line:
                    </strong>{" "}

                    {
                      palmResult
                        .palm_analysis
                        ?.head_line
                    }
                  </p>


                  <p>
                    <strong>
                      Life line:
                    </strong>{" "}

                    {
                      palmResult
                        .palm_analysis
                        ?.life_line
                    }
                  </p>

                </article>


                {palmResult.descriptions && (

                  <article className="result-card">

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
                          ?.heart_line
                      }
                    </p>


                    <p>
                      <strong>
                        Head:
                      </strong>{" "}

                      {
                        palmResult
                          .descriptions
                          ?.head_line
                      }
                    </p>


                    <p>
                      <strong>
                        Life:
                      </strong>{" "}

                      {
                        palmResult
                          .descriptions
                          ?.life_line
                      }
                    </p>

                  </article>

                )}


                {palmResult
                  .output_files
                  ?.result_image_url && (

                  <article className="result-card">

                    <h4>
                      Processed Palm Result
                    </h4>

                    <img
                      src={
                        buildBackendUrl(
                          palmResult
                            .output_files
                            .result_image_url
                        )
                      }
                      alt="Palm analysis result"
                      className="palm-result-image"
                    />

                  </article>

                )}


                {palmResult
                  .output_files
                  ?.warped_palm_url && (

                  <article className="result-card">

                    <h4>
                      Warped Palm
                    </h4>

                    <img
                      src={
                        buildBackendUrl(
                          palmResult
                            .output_files
                            .warped_palm_url
                        )
                      }
                      alt="Warped palm"
                      className="palm-result-image"
                    />

                  </article>

                )}


                {palmResult
                  .output_files
                  ?.palm_lines_url && (

                  <article className="result-card">

                    <h4>
                      Detected Palm Lines
                    </h4>

                    <img
                      src={
                        buildBackendUrl(
                          palmResult
                            .output_files
                            .palm_lines_url
                        )
                      }
                      alt="Detected palm lines"
                      className="palm-result-image"
                    />

                  </article>

                )}

              </div>

            )}

          </section>


          {/* ================================================= */}
          {/* TAROT */}
          {/* ================================================= */}

          <section className="form-section">

            <h3>
              Tarot Reading
            </h3>


            <p className="section-note">

              Select a tarot spread and
              draw cards from the tarot dataset.

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
                required
              >

                <option
                  value=""
                  disabled
                >
                  Select tarot spread
                </option>

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
                !formData.spread ||
                isDrawingTarot ||
                isAnalyzingPalm ||
                isLoading
              }
            >

              {
                isDrawingTarot
                  ? "Drawing Tarot Cards..."
                  : tarotCards.length > 0
                    ? "Draw New Tarot Cards"
                    : "Draw Tarot Cards"
              }

            </button>


            {tarotCards.length > 0 && (

              <div className="tarot-grid">

                {tarotCards.map(
                  (
                    card,
                    index
                  ) => (

                    <article
                      className="tarot-card"
                      key={
                        `${card.name}-${card.position}-${index}`
                      }
                    >

                      <span>
                        {card.position}
                      </span>


                      {card.image && (

                        <div className="reading-tarot-image-wrapper">

                          <img
                            src={
                              buildBackendUrl(
                                card.image
                              )
                            }
                            alt={
                              card.name ||
                              "Tarot card"
                            }
                            className={
                              String(
                                card.orientation
                              ).toLowerCase() ===
                              "reversed"

                                ? "reading-tarot-image reading-tarot-image-reversed"

                                : "reading-tarot-image"
                            }
                            loading="lazy"
                          />

                        </div>

                      )}


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


                      {
                        Array.isArray(
                          card.keywords
                        ) &&
                        card.keywords.length > 0 && (

                          <p>
                            <strong>
                              Keywords:
                            </strong>{" "}

                            {
                              card.keywords.join(
                                ", "
                              )
                            }
                          </p>

                        )
                      }


                      <p>
                        <strong>
                          Selected Meaning:
                        </strong>{" "}

                        {
                          card.selected_meaning
                        }
                      </p>

                    </article>

                  )
                )}

              </div>

            )}

          </section>


          {/* ================================================= */}
          {/* GENERATE */}
          {/* ================================================= */}

          <button
            className="generate-button"
            type="submit"
            disabled={
              isLoading ||
              isDrawingTarot ||
              isAnalyzingPalm ||
              !profileReady ||
              !palmResult ||
              tarotCards.length === 0
            }
          >

            {
              isLoading
                ? "Generating Complete Reading..."
                : "Generate Complete Reading"
            }

          </button>


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


        {/* ================================================== */}
        {/* READING HEADER */}
        {/* ================================================== */}

        {hasResults && (

          <section className="result-section">

            <p className="eyebrow">
              COMPLETE PERSONALIZED READING
            </p>


            <h2>
              Reading for {
                formData.name
              }
            </h2>


            {submittedQuestion && (

              <TextCard
                title="Question"
              >
                {submittedQuestion}
              </TextCard>

            )}


            <button
              type="button"
              className="generate-button"
              onClick={
                handleDownloadReadingPdf
              }
              disabled={
                isDownloadingPdf
              }
            >

              {
                isDownloadingPdf
                  ? "Preparing PDF..."
                  : "Download Complete Reading PDF"
              }

            </button>

          </section>

        )}


        {/* ================================================== */}
        {/* AI INTERPRETATION */}
        {/* ================================================== */}

        {interpretationResult && (

          <section className="result-section">

            <p className="eyebrow">
              AI INTERPRETATION
            </p>

            <h2>
              Combined Palm and Tarot Reading
            </h2>


            <TextCard
              title="Overall Summary"
            >
              {
                interpretationResult
                  ?.overall_summary
              }
            </TextCard>


            <div className="result-grid">

              <TextCard
                title="Palm Interpretation"
              >
                {
                  interpretationResult
                    ?.palm_interpretation
                }
              </TextCard>


              <TextCard
                title="Tarot Interpretation"
              >
                {
                  interpretationResult
                    ?.tarot_interpretation
                }
              </TextCard>

            </div>


            <TextCard
              title="Combined Interpretation"
            >
              {
                interpretationResult
                  ?.combined_interpretation
              }
            </TextCard>


            <div className="result-grid">

              <article className="result-card">

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


              <article className="result-card">

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


            <TextCard
              title="Current Focus"
            >
              {
                interpretationResult
                  ?.current_focus
              }
            </TextCard>


            <TextCard
              title="Key Message"
            >
              {
                interpretationResult
                  ?.key_message
              }
            </TextCard>


            <TextCard
              title="Reflection Question"
            >
              {
                interpretationResult
                  ?.reflection_question
              }
            </TextCard>


            <p className="disclaimer">

              {
                interpretationResult
                  ?.disclaimer ||
                "This reading is intended for entertainment and personal reflection only."
              }

            </p>

          </section>

        )}


        {/* ================================================== */}
        {/* PERSONALITY */}
        {/* ================================================== */}

        {personalityResult && (

          <section className="result-section">

            <p className="eyebrow">
              PERSONALITY INTELLIGENCE
            </p>

            <h2>
              Symbolic Personality Profile
            </h2>


            <TextCard
              title="Personality Summary"
            >
              {
                personalityResult
                  ?.personality_summary
              }
            </TextCard>


            <article className="result-card">

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

              <TextCard
                title="Emotional Style"
              >
                {
                  personalityResult
                    ?.emotional_style
                }
              </TextCard>


              <TextCard
                title="Thinking Style"
              >
                {
                  personalityResult
                    ?.thinking_style
                }
              </TextCard>

            </div>


            <div className="result-grid">

              <TextCard
                title="Decision Style"
              >
                {
                  personalityResult
                    ?.decision_style
                }
              </TextCard>


              <TextCard
                title="Relationship Style"
              >
                {
                  personalityResult
                    ?.relationship_style
                }
              </TextCard>

            </div>


            <div className="result-grid">

              <article className="result-card">

                <h3>
                  Strengths
                </h3>

                <SafeList
                  items={
                    personalityResult
                      ?.strengths
                  }
                  emptyMessage="No strengths were returned."
                  itemKeyPrefix="personality-strength"
                />

              </article>


              <article className="result-card">

                <h3>
                  Development Areas
                </h3>

                <SafeList
                  items={
                    personalityResult
                      ?.development_areas
                  }
                  emptyMessage="No development areas were returned."
                  itemKeyPrefix="personality-development"
                />

              </article>

            </div>


            <article className="result-card">

              <h3>
                Growth Advice
              </h3>

              <SafeList
                items={
                  personalityResult
                    ?.growth_advice
                }
                emptyMessage="No growth advice was returned."
                itemKeyPrefix="personality-growth"
              />

            </article>

          </section>

        )}


        {/* ================================================== */}
        {/* RECOMMENDATIONS */}
        {/* ================================================== */}

        {recommendationResult && (

          <section className="result-section">

            <p className="eyebrow">
              RECOMMENDATION ENGINE
            </p>

            <h2>
              Personalized Recommendations
            </h2>


            <TextCard
              title="Recommendation Summary"
            >
              {
                recommendationResult
                  ?.recommendation_summary
              }
            </TextCard>


            <article className="result-card">

              <h3>
                Personal Growth
              </h3>

              <SafeList
                items={
                  recommendationResult
                    ?.personal_growth
                }
                emptyMessage="No personal-growth recommendations were returned."
                itemKeyPrefix="recommendation-growth"
              />

            </article>


            <article className="result-card">

              <h3>
                Career Suggestions
              </h3>

              <SafeList
                items={
                  recommendationResult
                    ?.career
                }
                emptyMessage="No career suggestions were returned."
                itemKeyPrefix="recommendation-career"
              />

            </article>


            <article className="result-card">

              <h3>
                Relationship Guidance
              </h3>

              <SafeList
                items={
                  recommendationResult
                    ?.relationships
                }
                emptyMessage="No relationship guidance was returned."
                itemKeyPrefix="recommendation-relationships"
              />

            </article>


            <article className="result-card">

              <h3>
                Goal Alignment
              </h3>

              <SafeList
                items={
                  recommendationResult
                    ?.goal_alignment
                }
                emptyMessage="No goal-alignment recommendations were returned."
                itemKeyPrefix="recommendation-goal"
              />

            </article>


            <article className="result-card">

              <h3>
                Spiritual Development
              </h3>

              <SafeList
                items={
                  recommendationResult
                    ?.spiritual_development
                }
                emptyMessage="No spiritual-development recommendations were returned."
                itemKeyPrefix="recommendation-spiritual"
              />

            </article>


            <div className="result-grid">

              <article className="result-card">

                <h3>
                  Immediate Actions
                </h3>

                <SafeList
                  items={
                    recommendationResult
                      ?.immediate_actions
                  }
                  emptyMessage="No immediate actions were returned."
                  itemKeyPrefix="recommendation-immediate"
                />

              </article>


              <article className="result-card">

                <h3>
                  Long-Term Actions
                </h3>

                <SafeList
                  items={
                    recommendationResult
                      ?.long_term_actions
                  }
                  emptyMessage="No long-term actions were returned."
                  itemKeyPrefix="recommendation-long-term"
                />

              </article>

            </div>

          </section>

        )}


        {/* ================================================== */}
        {/* LIFE TRENDS */}
        {/* ================================================== */}

        {trendResult && (

          <section className="result-section">

            <p className="eyebrow">
              LIFE TREND ANALYSIS
            </p>

            <h2>
              Life Themes and Growth Trends
            </h2>


            <TextCard
              title="Trend Summary"
            >
              {
                trendResult
                  ?.trend_summary
              }
            </TextCard>


            <TextCard
              title="Current Theme"
            >
              {
                trendResult
                  ?.current_theme
              }
            </TextCard>


            <div className="result-grid">

              <TextCard
                title="Next 30 Days"
              >
                {
                  trendResult
                    ?.next_30_days
                }
              </TextCard>


              <TextCard
                title="Next 3 Months"
              >
                {
                  trendResult
                    ?.next_3_months
                }
              </TextCard>

            </div>


            <div className="result-grid">

              <article className="result-card">

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


              <article className="result-card">

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


            <article className="result-card">

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


            <article className="result-card">

              <h3>
                Practical Actions
              </h3>

              <SafeList
                items={
                  trendResult
                    ?.practical_actions
                }
                emptyMessage="No practical actions were returned."
                itemKeyPrefix="trend-practical"
              />

            </article>


            <p className="disclaimer">

              {
                trendResult
                  ?.disclaimer ||
                "Life-trend analysis is symbolic and does not predict guaranteed future events."
              }

            </p>

          </section>

        )}


        {/* ================================================== */}
        {/* GUIDANCE SCORING */}
        {/* ================================================== */}

        {scoreResult && (

          <section className="result-section">

            <p className="eyebrow">
              SPIRITUAL GUIDANCE SCORING
            </p>

            <h2>
              Guidance Score Summary
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


              <article className="result-card">

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


            <TextCard
              title="Calculation Method"
            >
              {
                scoreResult
                  ?.calculation_method
              }
            </TextCard>


            <p className="disclaimer">

              {
                scoreResult
                  ?.disclaimer ||
                "These scores measure prototype completeness, relevance and consistency. They do not measure scientific accuracy."
              }

            </p>

          </section>

        )}


        {/* ================================================== */}
        {/* FOLLOW-UP CHAT */}
        {/* ================================================== */}

        {lastReadingRequest &&
          lastReadingResponse && (

          <ReadingChat
            readingRequest={
              lastReadingRequest
            }
            readingResponse={
              lastReadingResponse
            }
          />

        )}

      </main>

    </div>
  );
}


export default ReadingStudio;