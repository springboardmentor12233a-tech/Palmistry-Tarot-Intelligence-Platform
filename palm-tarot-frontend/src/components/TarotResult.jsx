import { useState } from "react";
import "./TarotResult.css";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Moon,
  Sparkles,
  Stars,
  Loader2,
} from "lucide-react";

function TarotResult({
  question,
  spread = [],
  interpretation = "",
  palmReadingText = "",
  onBack,
  onNewReading,
}) {
  const API_URL = "http://127.0.0.1:8000";

  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const getImageUrl = (card) => {
    if (!card?.image_file) return null;

    return (
      `${API_URL}/api/tarot/card-image/` +
      encodeURIComponent(card.image_file)
    );
  };

  // ============================================================
  // PARSE GEMINI INTERPRETATION
  // ============================================================

  const parseInterpretation = (text) => {
    const sections = {
      overall: "",
      synthesis: "",
      palm: "",
      tarot: "",
      meaning: "",
      guidance: "",
    };

    if (!text) return sections;

    const lines = text.replace(/\r/g, "").split("\n");
    let current = null;

    for (const raw of lines) {
      const line = raw.trim();

      if (!line) continue;

      const title = line
        .replace(/[:\-]+$/, "")
        .trim()
        .toUpperCase();

      if (title === "OVERALL INSIGHT") {
        current = "overall";
        continue;
      }

      if (title === "ARCANA SYNTHESIS") {
        current = "synthesis";
        continue;
      }

      if (title === "PALM INSIGHT") {
        current = "palm";
        continue;
      }

      if (title === "TAROT INSIGHT") {
        current = "tarot";
        continue;
      }

      if (title === "WHAT THIS MEANS FOR YOU") {
        current = "meaning";
        continue;
      }

      if (title === "KEY GUIDANCE") {
        current = "guidance";
        continue;
      }

      if (current) {
        sections[current] +=
          `${sections[current] ? " " : ""}${line}`;
      }
    }

    if (
      !sections.overall &&
      !sections.synthesis &&
      !sections.palm &&
      !sections.tarot &&
      !sections.meaning &&
      !sections.guidance
    ) {
      sections.overall = text.trim();
    }

    return sections;
  };

  const sections = parseInterpretation(
    interpretation
  );

  // ============================================================
  // GUIDANCE
  // ============================================================

  const guidancePoints = sections.guidance
    .split(/\s*(?:\d+[.)]|[-•])\s*/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  const fallbackGuidance = [
    "Reflect on the message of the three cards.",
    "Focus on the choices that remain within your control.",
    "Use the reading as a prompt for thoughtful action.",
  ];

  const positions = [
    "PAST",
    "PRESENT",
    "FUTURE",
  ];

  // ============================================================
  // GENERATE PDF
  // ============================================================

  const generatePDF = async () => {
    if (!question?.trim()) {
      setPdfError("A question is required.");
      return;
    }

    if (!spread || spread.length !== 3) {
      setPdfError(
        "A complete three-card spread is required."
      );
      return;
    }

    setGeneratingPDF(true);
    setPdfError("");

    try {
      console.log(
        "GENERATING TAROT PDF:",
        `${API_URL}/api/tarot/report`
      );

      const response = await fetch(
        `${API_URL}/api/tarot/report`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/pdf",
          },

          body: JSON.stringify({
            question: question.trim(),

            spread: spread,

            interpretation: interpretation,

            // Preserve the same palm context used for the AI reading.
            palm_reading: palmReadingText || "",
          }),
        }
      );

      console.log("PDF RESPONSE:", {
        url: response.url,
        status: response.status,
        ok: response.ok,
        contentType:
          response.headers.get("content-type"),
      });

      if (!response.ok) {
        let errorMessage =
          "Unable to generate the PDF.";

        try {
          const errorData =
            await response.json();

          errorMessage =
            errorData.detail ||
            errorMessage;
        } catch {
          // Response wasn't JSON.
        }

        throw new Error(errorMessage);
      }

      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        throw new Error(
          "The server returned an empty PDF."
        );
      }

      // --------------------------------------------------------
      // Download PDF
      // --------------------------------------------------------

      const blobUrl =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = blobUrl;

      link.download =
        "arcana-ai-tarot-reading.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(blobUrl);

      console.log(
        "PDF downloaded successfully."
      );
    } catch (error) {
      console.error(
        "PDF GENERATION ERROR:",
        error
      );

      setPdfError(
        error.message ||
          "Unable to generate the PDF."
      );
    } finally {
      setGeneratingPDF(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="tarot-result-page">

      <div className="arcana-starfield" aria-hidden="true">
        <div className="arcana-starfield-nebula" />
        <div className="arcana-gold-stars" />
      </div>

      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <nav className="result-nav">

        <button
          className="result-back-button"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Back to spread
        </button>

        <div className="result-brand">

          <div className="result-brand-icon">
            <Moon size={18} />
          </div>

          <div>
            <strong>
              ARCANA AI
            </strong>

            <span>
              PALMISTRY & TAROT INTELLIGENCE
            </span>
          </div>

        </div>

        <button
          className="new-reading-button"
          onClick={onNewReading}
        >
          New reading
          <ArrowRight size={16} />
        </button>

      </nav>


      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="result-hero">

        <div className="result-hero-glow" />

        <div className="result-badge">
          <Sparkles size={14} />
          YOUR TAROT READING
        </div>

        <h1>
          The cards have
          <span> spoken.</span>
        </h1>

        <p className="result-question-label">
          YOUR QUESTION
        </p>

        <blockquote>
          “{question}”
        </blockquote>

        <p className="result-intro">
          Three cards. Three perspectives. One
          reflective story shaped around your
          question.
        </p>

      </section>


      {/* ======================================================
          THREE CARDS
      ====================================================== */}

      <section className="result-spread-section">

        <div className="result-section-heading">

          <div>
            <span>01</span>
            YOUR THREE CARDS
          </div>

          <p>
            Past · Present · Future
          </p>

        </div>


        <div className="result-spread">

          {spread.map((card, index) => (

            <article
              className="result-card"
              key={`${card.card}-${index}`}
            >

              <div className="result-card-position">

                <span>
                  0{index + 1}
                </span>

                {positions[index]}

              </div>


              <div className="result-card-image">

                {getImageUrl(card) ? (

                  <img
                    src={getImageUrl(card)}
                    alt={card.card}
                  />

                ) : (

                  <div className="result-image-fallback">

                    <Stars size={42} />

                    <span>
                      {card.card}
                    </span>

                  </div>

                )}


                {card.reversed && (

                  <div className="result-reversed">
                    REVERSED
                  </div>

                )}

              </div>


              <div className="result-card-details">

                <h2>
                  {card.card}
                </h2>

                <div className="result-orientation">

                  <Check size={13} />

                  {card.orientation}

                </div>

              </div>

            </article>

          ))}

        </div>

      </section>


      {/* ======================================================
          OVERALL INSIGHT
      ====================================================== */}

      <section className="result-insight-section">

        <div className="result-section-heading">

          <div>
            <span>02</span>
            OVERALL INSIGHT
          </div>

        </div>


        <article className="overall-insight-card">

          <div className="insight-symbol">
            <Stars size={24} />
          </div>

          <div>

            <p className="insight-eyebrow">
              ARCANA AI
            </p>

            <p className="overall-text">

              {sections.overall ||
                "Your overall interpretation is ready."}

            </p>

          </div>

        </article>

      </section>


      {/* ======================================================
          INSIGHTS
      ====================================================== */}

      <section className="arcana-synthesis-section">

        <div className="result-section-heading">

          <div>
            <span>03</span>
            ARCANA SYNTHESIS
          </div>

          <p>
            WHERE THE SIGNALS MEET
          </p>

        </div>

        <article className="arcana-synthesis-card">

          <div className="synthesis-orbit">
            <Sparkles size={18} />
          </div>

          <div className="synthesis-content">

            <p className="synthesis-eyebrow">
              WHERE THE SIGNALS MEET
            </p>

            <h2>
              Where your palm and cards meet.
            </h2>

            <p>
              {sections.synthesis ||
                sections.palm ||
                "Your combined palm and Tarot interpretation is ready."}
            </p>

          </div>

        </article>

      </section>


      <section className="arcana-synthesis-section">

        <div className="result-section-heading">

          <div>
            <span>04</span>
            TAROT INSIGHT
          </div>

          <p>
            WHAT THE CARDS REVEAL
          </p>

        </div>

        <article className="arcana-synthesis-card">

          <div className="synthesis-orbit">
            <Stars size={18} />
          </div>

          <div className="synthesis-content">

            <p className="synthesis-eyebrow">
              WHAT THE CARDS REVEAL
            </p>

            <h2>
              What the cards reveal.
            </h2>

            <p>
              {sections.tarot ||
                "Your Tarot interpretation is ready."}
            </p>

          </div>

        </article>

      </section>


      {/* ======================================================
          MEANING
      ====================================================== */}

      <section className="meaning-section">

        <div className="result-section-heading">

          <div>
            <span>05</span>
            WHAT THIS MEANS FOR YOU
          </div>

        </div>


        <div className="meaning-card">

          <div className="meaning-orbit">
            <Stars size={28} />
          </div>

          <p>

            {sections.meaning ||
              "Reflect on the relationship between the cards and your question."}

          </p>

        </div>

      </section>


      {/* ======================================================
          GUIDANCE
      ====================================================== */}

      <section className="guidance-section">

        <div className="result-section-heading">

          <div>
            <span>06</span>
            KEY GUIDANCE
          </div>

        </div>


        <div className="guidance-grid">

          {(guidancePoints.length === 3
            ? guidancePoints
            : fallbackGuidance
          ).map((point, index) => (

            <article
              className="guidance-item"
              key={index}
            >

              <div className="guidance-number">
                0{index + 1}
              </div>

              <p>
                {point}
              </p>

            </article>

          ))}

        </div>

      </section>


      {/* ======================================================
          PDF CTA
      ====================================================== */}

      <section className="report-cta">

        <div className="report-cta-glow" />

        <div className="report-icon">

          {generatingPDF ? (
            <Loader2
              size={21}
              className="pdf-spinner"
            />
          ) : (
            <Download size={21} />
          )}

        </div>


        <div>

          <p className="report-label">
            YOUR ARCANA RECORD
          </p>

          <h2>
            Keep this reading with you.
          </h2>

          <p>
            Preserve the story revealed through your cards and return to it
            whenever you need a moment of reflection, clarity, or perspective.
          </p>

        </div>


        <button
          className="report-button"
          onClick={generatePDF}
          disabled={generatingPDF}
        >

          {generatingPDF ? (
            <>
              <Loader2
                size={17}
                className="pdf-spinner"
              />
              Generating...
            </>
          ) : (
            <>
              Generate PDF
              <ArrowRight size={17} />
            </>
          )}

        </button>

      </section>


      {/* ======================================================
          PDF ERROR
      ====================================================== */}

      {pdfError && (

        <div className="pdf-error">

          <span>
            {pdfError}
          </span>

          <button
            onClick={() => setPdfError("")}
          >
            ×
          </button>

        </div>

      )}


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="result-footer">

        <div>
          <Moon size={16} />
          ARCANA AI
        </div>

        <p>
          Palmistry & Tarot Intelligence
        </p>

        <span>
          Reflect · Explore · Discover
        </span>

      </footer>

    </main>
  );
}

export default TarotResult;