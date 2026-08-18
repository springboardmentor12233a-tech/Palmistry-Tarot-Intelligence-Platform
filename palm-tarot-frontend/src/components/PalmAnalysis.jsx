import { useRef, useState } from "react";
import { saveReading } from "./historyApi";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Hand,
  ImagePlus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
  Heart,
  Brain,
  Activity,
  ScanLine,
} from "lucide-react";

function renderPalmFeature(feature, fallbackTitle) {
  if (!feature) return null;

  if (typeof feature === "string") {
    return (
      <div className="line-card palm-feature-card">
        <div className="line-icon"><Hand size={21} /></div>
        <div className="line-content">
          <div className="line-title-row"><h3>{fallbackTitle}</h3></div>
          <p className="line-description">{feature}</p>
        </div>
      </div>
    );
  }

  if (typeof feature !== "object") return null;

  const title = feature.title || fallbackTitle;
  const finding = feature.finding;
  const description = feature.description;
  const interpretation = feature.interpretation;

  return (
    <div className="line-card palm-feature-card">
      <div className="line-icon"><Hand size={21} /></div>
      <div className="line-content">
        <div className="line-title-row">
          <h3>{title}</h3>
          {finding && <span>{finding}</span>}
        </div>
        {description && <p className="line-description">{description}</p>}
        {interpretation && <p className="line-interpretation">{interpretation}</p>}
      </div>
    </div>
  );
}

function PalmAnalysis({ onBack, onTarot }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const API_URL = "http://127.0.0.1:8000";

  const handleFile = (file) => {
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      alert("Please upload a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Please upload an image smaller than 10 MB.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));

    setResult(null);
    setError("");
  };

  const handleInputChange = (event) => {
    handleFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    handleFile(event.dataTransfer.files[0]);
  };

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview(null);
    setResult(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzePalm = async () => {
    if (!image) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("file", image);

      const response = await fetch(
        `${API_URL}/api/palm/analyze`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Palm analysis failed."
        );
      }

      /*
       * Save the completed Palm reading to the
       * authenticated user's reading history.
       *
       * History saving must not prevent the user
       * from seeing a successful palm analysis.
       */
      try {
        await saveReading({
          readingType: "Palm",
          title: "Palm Reading",
          question: "",
          result: data,
        });

        console.log(
          "PALM READING SAVED TO HISTORY"
        );
      } catch (historyError) {
        console.error(
          "PALM HISTORY SAVE ERROR:",
          historyError
        );
      }

      setResult(data);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to connect to the palm analysis server."
      );
    } finally {
      setLoading(false);
    }
  };

  const getLineIcon = (type) => {
    if (type === "heart") return <Heart size={21} />;
    if (type === "head") return <Brain size={21} />;
    return <Activity size={21} />;
  };

  return (
    <main className="palm-page">

      {/* Navigation */}

      <div className="palm-nav">

        <button
          className="back-button"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="mini-brand">
          <Sparkles size={15} />
          ARCANA AI
        </div>

      </div>


      {/* Header */}

      {!result && (
        <section className="palm-header">

          <div className="hero-badge">
            <Hand size={15} />
            Palm Intelligence
          </div>

          <h1>
            Your story is in
            <span> your hands.</span>
          </h1>

          <p>
            Upload a clear photograph of your palm.
            Our intelligence engine will analyze visible
            palm characteristics and prepare your reading.
          </p>

        </section>
      )}


      {/* Upload / Result */}

      {!result ? (

        <section className="analysis-workspace">

          {/* Upload */}

          <div className="upload-column">

            <div className="section-label">
              <span>01</span>
              YOUR PALM
            </div>

            {!preview ? (

              <div
                className={`upload-zone ${
                  dragging ? "dragging" : ""
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() =>
                  setDragging(false)
                }
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleInputChange}
                  hidden
                />

                <div className="upload-icon">
                  <ImagePlus size={34} />
                </div>

                <h3>
                  Place your palm here
                </h3>

                <p>
                  Drag and drop your palm photograph
                  or click to browse from your device.
                </p>

                <button
                  className="browse-button"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload size={16} />
                  Choose image
                </button>

                <span className="file-info">
                  JPG · PNG · WEBP &nbsp; / &nbsp; MAX 10 MB
                </span>

              </div>

            ) : (

              <div className="image-preview-container">

                <img
                  src={preview}
                  alt="Palm selected for analysis"
                  className="palm-preview"
                />

                <div className="preview-overlay">

                  <div className="image-ready">
                    <Check size={15} />
                    IMAGE READY
                  </div>

                </div>

                <button
                  className="remove-image"
                  onClick={removeImage}
                  aria-label="Remove selected image"
                >
                  <X size={18} />
                </button>

              </div>

            )}

          </div>


          {/* Processing */}

          <div className="process-column">

            <div className="section-label">
              <span>02</span>
              ANALYSIS
            </div>

            <div className="process-card">

              <div className="process-heading">

                <div className="process-symbol">
                  <ScanLine size={25} />
                </div>

                <div>

                  <p>
                    INTELLIGENCE ENGINE
                  </p>

                  <h3>
                    {loading
                      ? "Reading your palm..."
                      : "Ready to analyze"}
                  </h3>

                </div>

              </div>

              <div className="process-divider" />

              <div className="analysis-list">

                <div>
                  <span>01</span>
                  <p>
                    Palm image preprocessing
                  </p>
                </div>

                <div>
                  <span>02</span>
                  <p>
                    Palm feature extraction
                  </p>
                </div>

                <div>
                  <span>03</span>
                  <p>
                    Palm line analysis
                  </p>
                </div>

                <div>
                  <span>04</span>
                  <p>
                    Reading generation
                  </p>
                </div>

              </div>


              <button
                className={`analyze-button ${
                  !image || loading
                    ? "disabled"
                    : ""
                }`}
                disabled={!image || loading}
                onClick={analyzePalm}
              >

                {loading ? (
                  <>
                    <span className="loading-spinner" />
                    Analyzing...
                  </>
                ) : image ? (
                  <>
                    Analyze my palm
                    <ArrowRight size={18} />
                  </>
                ) : (
                  <>
                    <Upload size={17} />
                    Upload an image first
                  </>
                )}

              </button>


              <div className="privacy-note">
                <ShieldCheck size={15} />

                <p>
                  Your uploaded image is used only
                  for the analysis workflow.
                </p>

              </div>

            </div>


            {image && !loading && (
              <button
                className="change-image"
                onClick={removeImage}
              >
                <RotateCcw size={14} />
                Choose another image
              </button>
            )}

          </div>

        </section>

      ) : (

        /* =====================================================
           RESULT PAGE
           ===================================================== */

        <section className="palm-result-page">

          {/* Result Header */}

          <div className="result-heading">

            <div className="hero-badge">
              <Sparkles size={15} />
              Palm Reading Complete
            </div>

            <h1>
              Your palm,
              <span> interpreted.</span>
            </h1>

            <p>
              The intelligence engine has analyzed the
              visible characteristics of your palm.
            </p>

          </div>


          {/* Main Result */}

          <div className="result-layout">

            {/* Palm Image */}

            <div className="result-image-card">

              <div className="result-card-label">
                <span>01</span>
                PALM ANALYSIS
              </div>

              <div className="result-image-wrapper">

                <img
                  src={`${API_URL}${result.palm_image}`}
                  alt="Analyzed palm"
                  className="result-palm-image"
                />

              </div>

              <div className="scan-label">
                <ScanLine size={15} />
                PALM FEATURES DETECTED
              </div>

            </div>


            {/* Summary */}

            <div className="result-summary">

              <div className="result-card-label">
                <span>02</span>
                YOUR READING
              </div>

              <div className="reading-intro">

                <Sparkles size={18} />

                <div>

                  <h3>
                    Your palm reveals several perspectives.
                  </h3>

                  <p>
                    Explore the patterns traditionally associated
                    with relationships, thinking, vitality,
                    direction, and personal expression.
                  </p>

                </div>

              </div>


              {/* Heart */}

              {result.palm_reading?.heart_line && (

                <div className="line-card">

                  <div className="line-icon">
                    {getLineIcon("heart")}
                  </div>

                  <div className="line-content">

                    <div className="line-title-row">

                      <h3>
                        {
                          result.palm_reading
                            .heart_line.title
                        }
                      </h3>

                      <span>
                        {
                          result.palm_reading
                            .heart_line.finding
                        }
                      </span>

                    </div>

                    <p className="line-description">
                      {
                        result.palm_reading
                          .heart_line.description
                      }
                    </p>

                    <p className="line-interpretation">
                      {
                        result.palm_reading
                          .heart_line.interpretation
                      }
                    </p>

                  </div>

                </div>

              )}


              {/* Head */}

              {result.palm_reading?.head_line && (

                <div className="line-card">

                  <div className="line-icon">
                    {getLineIcon("head")}
                  </div>

                  <div className="line-content">

                    <div className="line-title-row">

                      <h3>
                        {
                          result.palm_reading
                            .head_line.title
                        }
                      </h3>

                      <span>
                        {
                          result.palm_reading
                            .head_line.finding
                        }
                      </span>

                    </div>

                    <p className="line-description">
                      {
                        result.palm_reading
                          .head_line.description
                      }
                    </p>

                    <p className="line-interpretation">
                      {
                        result.palm_reading
                          .head_line.interpretation
                      }
                    </p>

                  </div>

                </div>

              )}


              {/* Life */}

              {result.palm_reading?.life_line && (

                <div className="line-card">

                  <div className="line-icon">
                    {getLineIcon("life")}
                  </div>

                  <div className="line-content">

                    <div className="line-title-row">

                      <h3>
                        {
                          result.palm_reading
                            .life_line.title
                        }
                      </h3>

                      <span>
                        {
                          result.palm_reading
                            .life_line.finding
                        }
                      </span>

                    </div>

                    <p className="line-description">
                      {
                        result.palm_reading
                          .life_line.description
                      }
                    </p>

                    <p className="line-interpretation">
                      {
                        result.palm_reading
                          .life_line.interpretation
                      }
                    </p>

                  </div>

                </div>

              )}

              {/* Fate Line */}
              {result.palm_reading?.fate_line &&
                renderPalmFeature(
                  result.palm_reading.fate_line,
                  "Fate Line"
                )}

              {/* Sun Line */}
              {result.palm_reading?.sun_line &&
                renderPalmFeature(
                  result.palm_reading.sun_line,
                  "Sun Line"
                )}

            </div>

          </div>

          {/* Additional Palm Features */}
          {(result.palm_reading?.palm_shape ||
            result.palm_reading?.finger_structure) && (
            <div className="additional-palm-features">
              <div className="result-card-label">
                <span>03</span>
                PALM STRUCTURE
              </div>

              <h2>Shape and structure.</h2>

              <p className="feature-section-description">
                Additional visible characteristics identified during the palm analysis.
              </p>

              <div className="palm-feature-grid">
                {result.palm_reading?.palm_shape &&
                  renderPalmFeature(
                    result.palm_reading.palm_shape,
                    "Palm Shape"
                  )}

                {result.palm_reading?.finger_structure &&
                  renderPalmFeature(
                    result.palm_reading.finger_structure,
                    "Finger Structure"
                  )}
              </div>
            </div>
          )}


          {/* Line Visualization */}

          <div className="line-analysis-card">

            <div>

              <div className="result-card-label">
                <span>04</span>
                LINE DETECTION
              </div>

              <h2>
                See what the engine detected.
              </h2>

              <p>
                A visual representation of the principal
                palm lines identified during analysis.
              </p>

            </div>

            <div className="line-image-box">

              <img
                src={`${API_URL}${result.line_image}`}
                alt="Detected palm lines"
              />

            </div>

          </div>


          {/* Next Reading */}

          <div className="next-reading-card">

            <div className="next-reading-content">

              <div className="result-card-label">
                <span>05</span>
                NEXT READING
              </div>

              <h2>
                Your palm reveals the patterns.
                <span> Let the cards explore what comes next.</span>
              </h2>

              <p>
                Continue with a three-card Tarot reading to explore
                your past, present, and future from a different
                perspective.
              </p>

            </div>

            <div className="result-actions">

              <button
                className="secondary-result-button"
                onClick={() => {
                  setResult(null);
                }}
              >
                <RotateCcw size={16} />
                Analyze another palm
              </button>

              <button
                className="primary-result-button"
                onClick={() => {
                  if (onTarot) {
                    onTarot(result);
                  }
                }}
              >
                Continue to Tarot
                <ArrowRight size={18} />
              </button>

            </div>

          </div>


          <div className="result-disclaimer">

            <ShieldCheck size={15} />

            <p>
              Palmistry is presented as a reflective
              experience and should not be treated as
              scientific or medical advice.
            </p>

          </div>

        </section>

      )}


      {/* Error */}

      {error && (

        <div className="analysis-error">

          <X size={18} />

          <p>{error}</p>

          <button onClick={analyzePalm}>
            Try again
          </button>

        </div>

      )}

    </main>
  );
}

export default PalmAnalysis;