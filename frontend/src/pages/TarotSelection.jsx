import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api/axios";

function TarotSelection() {
  const [searchParams] = useSearchParams();
  const palmReadingId = searchParams.get("palmReadingId");
  const navigate = useNavigate();

  const [cardsPool, setCardsPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [spreadType, setSpreadType] = useState("one-card"); // 'one-card' or 'three-card'
  const [drawnCards, setDrawnCards] = useState([]); // Array of drawn cards: { card, orientation, role }
  const [deckSize, setDeckSize] = useState(22); // visual representation cards
  const [selectedIndices, setSelectedIndices] = useState(new Set()); // visual card indices that have been clicked
  const [readingResult, setReadingResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  // Combined Reading states
  const [combinedReading, setCombinedReading] = useState(null);
  const [generatingCombined, setGeneratingCombined] = useState(false);
  const [combinedError, setCombinedError] = useState(null);

  // Fetch all Tarot cards on load
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const response = await API.get("/tarot/cards");
        if (response.data.success) {
          setCardsPool(response.data.cards);
        } else {
          setError("Failed to load Tarot cards deck.");
        }
      } catch (err) {
        console.error(err);
        setError("Error connecting to Tarot API.");
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  // Handle changing spread type
  const handleSpreadChange = (type) => {
    setSpreadType(type);
    resetReading();
  };

  // Reset current selection state
  const resetReading = () => {
    setDrawnCards([]);
    setSelectedIndices(new Set());
    setReadingResult(null);
    setCombinedReading(null);
    setSaveError(null);
    setCombinedError(null);
  };

  // Draw a card from the deck
  const handleDrawCard = (visualIndex) => {
    const maxDraws = spreadType === "one-card" ? 1 : 3;
    if (drawnCards.length >= maxDraws) return;
    if (selectedIndices.has(visualIndex)) return;

    // Mark card as selected visually
    const nextIndices = new Set(selectedIndices);
    nextIndices.add(visualIndex);
    setSelectedIndices(nextIndices);

    // Pick a card from pool not already drawn
    const alreadyDrawnIds = drawnCards.map((d) => d.card._id);
    const availablePool = cardsPool.filter((c) => !alreadyDrawnIds.includes(c._id));
    if (availablePool.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availablePool.length);
    const selectedCard = availablePool[randomIndex];

    // Determine orientation (upright or reversed)
    const orientation = Math.random() > 0.5 ? "upright" : "reversed";

    // Determine role in spread
    let role = "present";
    if (spreadType === "three-card") {
      const slotIndex = drawnCards.length;
      if (slotIndex === 0) role = "past";
      else if (slotIndex === 1) role = "present";
      else role = "future";
    }

    const nextDrawn = [...drawnCards, { card: selectedCard, orientation, role }];
    setDrawnCards(nextDrawn);

    // If we've reached the required amount, automatically save/submit
    if (nextDrawn.length === maxDraws) {
      // Short delay for visual polish before fetching
      setTimeout(() => {
        handleSubmitReading(nextDrawn);
      }, 1000);
    }
  };

  // Submit drawn cards to backend for interpretation
  const handleSubmitReading = async (cardsToSubmit) => {
    try {
      setSaving(true);
      setSaveError(null);

      const payload = {
        readingType: spreadType,
        cards: cardsToSubmit.map((d) => ({
          cardId: d.card._id,
          orientation: d.orientation,
          role: d.role,
        })),
      };

      const response = await API.post("/tarot/reading", payload);
      
      if (response.data.success) {
        setReadingResult(response.data.reading);

        // If palmReadingId is present, trigger Combined Reading automatically!
        if (palmReadingId) {
          handleGenerateCombined(response.data.reading._id);
        }
      } else {
        setSaveError("Failed to save Tarot reading.");
      }
    } catch (err) {
      console.error(err);
      setSaveError(err.response?.data?.message || "An error occurred while generating reading.");
    } finally {
      setSaving(false);
    }
  };

  // Generate Combined Palm + Tarot Reading
  const handleGenerateCombined = async (tarotReadingId) => {
    try {
      setGeneratingCombined(true);
      setCombinedError(null);

      const response = await API.post("/combined/analyze", {
        palmReadingId,
        tarotReadingId,
      });

      if (response.data.success) {
        setCombinedReading(response.data.combinedReading);
      } else {
        setCombinedError("Failed to synthesize combined reading.");
      }
    } catch (err) {
      console.error(err);
      setCombinedError(err.response?.data?.message || "Failed to generate combined reading.");
    } finally {
      setGeneratingCombined(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={containerStyle}>
          <div style={spinnerStyle}>🔮 Loading Cosmic energy...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div style={containerStyle}>
          <div style={errorCardStyle}>
            <h2>⚠️ Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  const maxDraws = spreadType === "one-card" ? 1 : 3;
  const isFinishedDrawing = drawnCards.length === maxDraws;

  return (
    <>
      <Navbar />

      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>✨ Tarot Reading Dashboard</h1>
          {palmReadingId && (
            <div style={palmBannerStyle}>
              🔗 <strong>Combined Flow:</strong> Your palm data has been linked. Draw cards to complete the unified reading report!
            </div>
          )}

          {/* Configuration Selection */}
          {!isFinishedDrawing && drawnCards.length === 0 && (
            <div style={configContainerStyle}>
              <p style={subtitleStyle}>Select your spread type and tune into your query:</p>
              <div style={buttonGroupStyle}>
                <button
                  onClick={() => handleSpreadChange("one-card")}
                  style={spreadType === "one-card" ? activeSpreadBtnStyle : inactiveSpreadBtnStyle}
                >
                  🃏 One-Card Focus
                </button>
                <button
                  onClick={() => handleSpreadChange("three-card")}
                  style={spreadType === "three-card" ? activeSpreadBtnStyle : inactiveSpreadBtnStyle}
                >
                  📐 Three-Card Spread (Past-Present-Future)
                </button>
              </div>
            </div>
          )}

          {/* The Deck of Cards */}
          {!isFinishedDrawing && (
            <div style={deckContainerStyle}>
              <h3 style={promptStyle}>
                Draw {maxDraws - drawnCards.length} Card{maxDraws - drawnCards.length > 1 ? "s" : ""}
              </h3>
              <p style={instructionStyle}>Click a card from the deck below to draw your tarot guide.</p>
              
              <div style={deckStyleContainer}>
                {Array.from({ length: deckSize }).map((_, idx) => {
                  const isSelected = selectedIndices.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleDrawCard(idx)}
                      style={cardBackStyle(idx, isSelected, deckSize)}
                      className="deck-card"
                    >
                      <div style={cardBackPatternStyle}>✨</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Spread View (Drawn cards display) */}
          {drawnCards.length > 0 && (
            <div style={spreadContainerStyle}>
              <h3 style={sectionTitleStyle}>Your Drawn Spread</h3>
              <div style={spreadGridStyle}>
                {drawnCards.map((drawn, idx) => (
                  <div key={idx} style={drawnCardContainerStyle}>
                    <span style={roleBadgeStyle}>{drawn.role.toUpperCase()}</span>
                    <div style={tarotCardWrapperStyle}>
                      <img
                        src={drawn.card.imageUrl || `${API.defaults.baseURL.replace("/api", "")}${drawn.card.image}`}
                        alt={drawn.card.name}
                        style={{
                          ...tarotCardImgStyle,
                          transform: drawn.orientation === "reversed" ? "rotate(180deg)" : "none",
                        }}
                      />
                    </div>
                    <strong style={cardNameStyle}>
                      {drawn.card.name} ({drawn.orientation})
                    </strong>
                  </div>
                ))}
              </div>

              {!isFinishedDrawing && (
                <div style={loadingProgressStyle}>
                  Drawing... ({drawnCards.length} of {maxDraws} drawn)
                </div>
              )}
            </div>
          )}

          {/* Loader when saving / processing */}
          {saving && <div style={statusBannerStyle}>🔮 Synthesizing interpretations, please wait...</div>}
          {saveError && <div style={errorAlertStyle}>⚠️ {saveError}</div>}

          {/* Combined Loading */}
          {generatingCombined && <div style={statusBannerStyle}>🤚 Blending palm readings with tarot insights...</div>}
          {combinedError && <div style={errorAlertStyle}>⚠️ Combined Reading error: {combinedError}</div>}

          {/* Reading Results (Tarot and Combined) */}
          {readingResult && (
            <div style={resultsContainerStyle}>
              {/* Separate headers depending on if it's Combined or Single */}
              {combinedReading ? (
                <div style={combinedResultWrapperStyle}>
                  <h2 style={combinedResultTitleStyle}>🔮 Unified Palm & Tarot Reading</h2>
                  
                  <div style={tabStyle}>
                    <h3>✨ Combined Synthesis Summary</h3>
                    <p style={paragraphStyle}><strong>Palm profile summary:</strong> {combinedReading.palmSummary}</p>
                    <p style={paragraphStyle}><strong>Tarot spread summary:</strong> {combinedReading.tarotSummary}</p>
                  </div>

                  <div style={boxStyle('#13111c', '#d4af37')}>
                    <h4>🌌 Cosmic Synthesis (Overall Reading)</h4>
                    <p style={boxTextStyle}>{combinedReading.overallReading}</p>
                  </div>

                  <div style={gridTwoStyle}>
                    <div style={boxStyle('#0f1b13', '#2b8b57')}>
                      <h4>💎 Strengths</h4>
                      <p style={boxTextStyle}>{combinedReading.strengths}</p>
                    </div>

                    <div style={boxStyle('#240f16', '#c93062')}>
                      <h4>🔥 Challenges</h4>
                      <p style={boxTextStyle}>{combinedReading.challenges}</p>
                    </div>
                  </div>

                  <div style={boxStyle('#0d1821', '#3a86c8')}>
                    <h4>🧭 Strategic Guidance (Advice)</h4>
                    <p style={boxTextStyle}>{combinedReading.advice}</p>
                  </div>

                  <div style={boxStyle('#151b1f', '#8f949c')}>
                    <h4>📋 Suggested Actions</h4>
                    <div style={{ whiteSpace: "pre-wrap", color: "#f1f1f1", lineHeight: "1.6", fontSize: "14px" }}>
                      {combinedReading.suggestedActions}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 style={resultHeadingStyle}>📖 Tarot Interpretation Report</h2>
                  
                  <div style={interpretationSectionStyle}>
                    <h4 style={aspectTitleStyle}>🌌 General Insight</h4>
                    <div style={aspectBodyStyle}>{readingResult.interpretation.general}</div>
                  </div>

                  <div style={interpretationSectionStyle}>
                    <h4 style={aspectTitleStyle}>❤️ Love & Relationships</h4>
                    <div style={aspectBodyStyle}>{readingResult.interpretation.love}</div>
                  </div>

                  <div style={interpretationSectionStyle}>
                    <h4 style={aspectTitleStyle}>💼 Career & Ambitions</h4>
                    <div style={aspectBodyStyle}>{readingResult.interpretation.career}</div>
                  </div>

                  <div style={interpretationSectionStyle}>
                    <h4 style={aspectTitleStyle}>🍀 Health & Energy</h4>
                    <div style={aspectBodyStyle}>{readingResult.interpretation.health}</div>
                  </div>

                  <div style={interpretationSectionStyle}>
                    <h4 style={aspectTitleStyle}>💰 Finances & Wealth</h4>
                    <div style={aspectBodyStyle}>{readingResult.interpretation.money}</div>
                  </div>
                </div>
              )}

              <div style={actionButtonsStyle}>
                <button onClick={resetReading} style={restartButtonStyle}>
                  🔄 Draw Again
                </button>
                <button onClick={() => navigate("/history")} style={historyButtonStyle}>
                  📜 View History
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Aesthetics Colors and Inline Styles
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "calc(100vh - 70px)",
  background: "#0c0a12", // Premium cosmic dark
  backgroundImage: "radial-gradient(circle at 50% 50%, #1c142c 0%, #0c0a12 100%)",
  padding: "40px 20px",
  boxSizing: "border-box",
  color: "#f3f0f7",
  fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
};

const cardStyle = {
  width: "100%",
  maxWidth: "750px",
  background: "rgba(25, 20, 38, 0.7)",
  backdropFilter: "blur(12px)",
  borderRadius: "24px",
  border: "1px solid rgba(212, 175, 55, 0.2)", // Subtle gold border
  boxShadow: "0 15px 40px rgba(0, 0, 0, 0.5)",
  padding: "40px",
  boxSizing: "border-box",
};

const titleStyle = {
  fontSize: "32px",
  textAlign: "center",
  fontWeight: "800",
  margin: "0 0 10px 0",
  background: "linear-gradient(135deg, #fceb92 0%, #d4af37 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const subtitleStyle = {
  fontSize: "16px",
  color: "#a9a2c1",
  textAlign: "center",
  margin: "0 0 20px 0",
};

const palmBannerStyle = {
  background: "rgba(212, 175, 55, 0.1)",
  border: "1px solid rgba(212, 175, 55, 0.4)",
  borderRadius: "12px",
  padding: "15px",
  marginBottom: "30px",
  fontSize: "14px",
  color: "#fceb92",
  textAlign: "center",
  lineHeight: "1.5",
};

const configContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: "30px",
};

const buttonGroupStyle = {
  display: "flex",
  gap: "15px",
  width: "100%",
  maxWidth: "500px",
  marginTop: "10px",
};

const activeSpreadBtnStyle = {
  flex: 1,
  padding: "14px 20px",
  background: "linear-gradient(135deg, #d4af37 0%, #aa851c 100%)",
  color: "#0c0a12",
  border: "none",
  borderRadius: "12px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)",
  transition: "all 0.3s ease",
};

const inactiveSpreadBtnStyle = {
  flex: 1,
  padding: "14px 20px",
  background: "rgba(255, 255, 255, 0.05)",
  color: "#a9a2c1",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "12px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s ease",
};

const deckContainerStyle = {
  textAlign: "center",
  margin: "30px 0",
};

const promptStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#fceb92",
  margin: "0 0 5px 0",
};

const instructionStyle = {
  fontSize: "14px",
  color: "#a9a2c1",
  margin: "0 0 35px 0",
};

const deckStyleContainer = {
  display: "flex",
  justifyContent: "center",
  height: "170px",
  position: "relative",
  margin: "0 auto",
  maxWidth: "550px",
};

const cardBackStyle = (index, isSelected, total) => {
  const overlap = 18; // overlapping in px
  const centerIndex = (total - 1) / 2;
  const distanceFromCenter = index - centerIndex;
  
  // Calculate a slight rotation to fan them out
  const rotation = distanceFromCenter * 2.5; 
  // Calculate horizontal translation
  const translationX = distanceFromCenter * overlap;
  // Calculate vertical translation to make a crescent curve
  const translationY = Math.abs(distanceFromCenter) * 2.5;

  return {
    position: "absolute",
    width: "80px",
    height: "140px",
    background: isSelected ? "transparent" : "linear-gradient(135deg, #2b1f4d 0%, #150f28 100%)",
    border: isSelected ? "none" : "2px solid #d4af37",
    borderRadius: "8px",
    boxShadow: isSelected ? "none" : "0 5px 15px rgba(0, 0, 0, 0.4)",
    cursor: isSelected ? "default" : "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transform: isSelected
      ? "translateY(-100px) scale(0)"
      : `translateX(${translationX}px) translateY(${translationY}px) rotate(${rotation}deg)`,
    opacity: isSelected ? 0 : 1,
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    zIndex: isSelected ? 100 : index,
  };
};

const cardBackPatternStyle = {
  fontSize: "22px",
  color: "#d4af37",
  textShadow: "0 0 8px rgba(212, 175, 55, 0.5)",
  userSelect: "none",
};

const spreadContainerStyle = {
  margin: "45px 0",
  textAlign: "center",
  animation: "fadeIn 0.5s ease",
};

const sectionTitleStyle = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#fceb92",
  marginBottom: "25px",
};

const spreadGridStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "35px",
  flexWrap: "wrap",
  marginTop: "15px",
};

const drawnCardContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "160px",
  animation: "scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
};

const roleBadgeStyle = {
  padding: "4px 10px",
  background: "rgba(212, 175, 55, 0.15)",
  border: "1px solid #d4af37",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: "800",
  color: "#fceb92",
  marginBottom: "12px",
  letterSpacing: "1px",
};

const tarotCardWrapperStyle = {
  width: "140px",
  height: "245px",
  borderRadius: "12px",
  border: "3px solid #d4af37",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.6), 0 0 15px rgba(212, 175, 55, 0.3)",
  overflow: "hidden",
  background: "#0c0a12",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  transition: "all 0.3s ease",
};

const tarotCardImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "transform 0.4s ease",
};

const cardNameStyle = {
  marginTop: "12px",
  fontSize: "14px",
  color: "#f3f0f7",
  textAlign: "center",
  fontWeight: "600",
};

const loadingProgressStyle = {
  color: "#a9a2c1",
  fontSize: "14px",
  marginTop: "20px",
  fontStyle: "italic",
};

const statusBannerStyle = {
  padding: "16px",
  background: "rgba(212, 175, 55, 0.1)",
  borderLeft: "4px solid #d4af37",
  borderRadius: "0 8px 8px 0",
  fontSize: "14px",
  color: "#fceb92",
  margin: "25px 0",
  textAlign: "left",
  animation: "pulse 1.5s infinite",
};

const errorAlertStyle = {
  padding: "16px",
  background: "rgba(224, 49, 49, 0.15)",
  borderLeft: "4px solid #e03131",
  borderRadius: "0 8px 8px 0",
  fontSize: "14px",
  color: "#ffc9c9",
  margin: "25px 0",
  textAlign: "left",
};

const resultsContainerStyle = {
  marginTop: "40px",
  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  paddingTop: "40px",
  animation: "fadeIn 0.7s ease",
};

const resultHeadingStyle = {
  fontSize: "26px",
  fontWeight: "800",
  color: "#fceb92",
  marginBottom: "30px",
  textAlign: "center",
};

const interpretationSectionStyle = {
  background: "rgba(255, 255, 255, 0.03)",
  borderRadius: "16px",
  padding: "24px",
  marginBottom: "20px",
  border: "1px solid rgba(255, 255, 255, 0.05)",
};

const aspectTitleStyle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#fceb92",
  margin: "0 0 10px 0",
};

const aspectBodyStyle = {
  fontSize: "14px",
  color: "#d0cbde",
  lineHeight: "1.6",
  whiteSpace: "pre-wrap",
};

const actionButtonsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "20px",
  marginTop: "40px",
};

const restartButtonStyle = {
  padding: "14px 28px",
  background: "transparent",
  color: "#d4af37",
  border: "2px solid #d4af37",
  borderRadius: "12px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.3s ease",
};

const historyButtonStyle = {
  padding: "14px 28px",
  background: "linear-gradient(135deg, #d4af37 0%, #aa851c 100%)",
  color: "#0c0a12",
  border: "none",
  borderRadius: "12px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.3s ease",
};

const combinedResultWrapperStyle = {
  textAlign: "left",
};

const combinedResultTitleStyle = {
  fontSize: "28px",
  fontWeight: "800",
  color: "#fceb92",
  marginBottom: "30px",
  textAlign: "center",
};

const tabStyle = {
  background: "rgba(255, 255, 255, 0.02)",
  borderRadius: "16px",
  padding: "24px",
  marginBottom: "25px",
  border: "1px solid rgba(255, 255, 255, 0.05)",
};

const paragraphStyle = {
  fontSize: "14px",
  color: "#d0cbde",
  lineHeight: "1.6",
  margin: "0 0 15px 0",
};

const boxStyle = (bgColor, borderColor) => ({
  background: bgColor,
  borderLeft: `5px solid ${borderColor}`,
  borderRadius: "0 12px 12px 0",
  padding: "24px",
  marginBottom: "25px",
});

const boxTextStyle = {
  fontSize: "14.5px",
  color: "#f1f1f1",
  lineHeight: "1.6",
  margin: 0,
};

const gridTwoStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
};

const spinnerStyle = {
  fontSize: "20px",
  color: "#fceb92",
  fontWeight: "600",
  animation: "pulse 1.5s infinite",
};

const errorCardStyle = {
  background: "rgba(224, 49, 49, 0.15)",
  border: "1px solid #e03131",
  borderRadius: "16px",
  padding: "30px",
  textAlign: "center",
  maxWidth: "450px",
};

// Add standard keyframe CSS to index.css
export default TarotSelection;
