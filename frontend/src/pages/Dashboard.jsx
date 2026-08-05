import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api/axios";

function Dashboard() {
  const navigate = useNavigate();

  // State Management
  const [profile, setProfile] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRecTab, setActiveRecTab] = useState("career"); // career | learning | relationship | lifestyle | habits

  // Load Google Fonts & Fetch data
  useEffect(() => {
    // Inject premium Google fonts
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Outfit:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch User Profile
        const profileRes = await API.get("/user/profile");
        if (profileRes.data.success) {
          setProfile(profileRes.data.user);
        }

        // Fetch Combined Readings History (automatically retrofits latest intelligence fields on the fly if missing)
        const readingsRes = await API.get("/combined/readings");
        if (readingsRes.data.success) {
          setReadings(readingsRes.data.readings || []);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Could not load dashboard data. Ensure backend is running and you are logged in.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={starryBgStyle} />
        <div style={spinnerContainerStyle}>
          <div style={cosmicSpinnerStyle}>🔮</div>
          <p style={loadingTextStyle}>Aligning cosmic coordinates...</p>
        </div>
      </div>
    );
  }

  // Extract latest combined reading details
  const hasCombinedReadings = readings.length > 0;
  const latestReading = hasCombinedReadings ? readings[0] : null;

  // Retrieve features
  const palmAnalysis = latestReading?.palmReadingId?.analysis || {};
  const handType = palmAnalysis.handType || "Undetermined Hand";
  const tarotCards = latestReading?.tarotReadingId?.cards || [];
  const primaryCard = tarotCards[0] || null;

  // Retrieve premium intelligence variables
  const aiInterpretation = latestReading?.aiInterpretation || {};
  const personalityScores = latestReading?.personalityScores || {};
  const recommendations = latestReading?.recommendations || {};
  const lifeTrends = latestReading?.lifeTrends || {};

  // Formatted date
  const readingDate = latestReading
    ? new Date(latestReading.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div style={dashboardWrapperStyle}>
      <Navbar />

      {/* Inject custom CSS directly for perfect styling scoped to Dashboard */}
      <style>{`
        body {
          background-color: #05040d !important;
          margin: 0;
        }
        .dashboard-layout {
          max-width: 1300px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: 'Outfit', sans-serif;
          color: #e2e8f0;
        }
        .cosmic-header {
          background: linear-gradient(135deg, rgba(20, 15, 45, 0.8) 0%, rgba(10, 5, 25, 0.9) 100%);
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(212, 175, 55, 0.05);
          flex-wrap: wrap;
          gap: 20px;
        }
        .header-title-section h1 {
          font-family: 'Cinzel', serif;
          color: #d4af37;
          margin: 0 0 5px 0;
          font-size: 2.2rem;
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
          letter-spacing: 1px;
        }
        .header-title-section p {
          color: #a0aec0;
          margin: 0;
          font-size: 1.05rem;
          text-align: left;
        }
        .header-stats {
          display: flex;
          gap: 15px;
        }
        .stat-pill {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .stat-pill strong {
          color: #d4af37;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 30px;
        }
        .glass-panel {
          background: rgba(18, 14, 38, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 26px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-panel:hover {
          border-color: rgba(212, 175, 55, 0.2);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(212, 175, 55, 0.08);
        }
        .panel-title {
          font-family: 'Cinzel', serif;
          color: #d4af37;
          font-size: 1.25rem;
          margin: 0 0 20px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 12px;
        }
        
        /* Scores Radar Circular Layout */
        .scores-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media(max-width: 768px) {
          .scores-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .score-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .score-circle-wrapper {
          position: relative;
          width: 80px;
          height: 80px;
        }
        .score-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.15rem;
          font-weight: 700;
          color: #e2e8f0;
        }
        .score-label {
          margin-top: 10px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #cbd5e0;
        }

        /* Trends styling */
        .trends-grid {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .trend-row {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          padding: 12px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .trend-meta {
          display: flex;
          flex-direction: column;
        }
        .trend-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: #f7fafc;
        }
        .trend-desc {
          font-size: 0.75rem;
          color: #a0aec0;
        }
        .trend-values {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .trend-current-value {
          font-size: 1.4rem;
          font-weight: 700;
          color: #d4af37;
        }
        .trend-pill {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .trend-pill.up {
          background: rgba(72, 187, 120, 0.15);
          color: #48bb78;
          border: 1px solid rgba(72, 187, 120, 0.3);
        }
        .trend-pill.down {
          background: rgba(229, 62, 62, 0.15);
          color: #f56565;
          border: 1px solid rgba(229, 62, 62, 0.3);
        }
        .trend-pill.stable {
          background: rgba(160, 174, 192, 0.15);
          color: #a0aec0;
          border: 1px solid rgba(160, 174, 192, 0.3);
        }

        /* Recommendations Tabs */
        .rec-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 8px;
        }
        .rec-tab {
          background: transparent;
          color: #a0aec0;
          border: none;
          padding: 8px 16px;
          font-size: 0.9rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          width: auto;
        }
        .rec-tab:hover {
          color: #f7fafc;
          background: rgba(255, 255, 255, 0.05);
        }
        .rec-tab.active {
          background: rgba(212, 175, 55, 0.12);
          color: #d4af37;
          border: 1px solid rgba(212, 175, 55, 0.3);
        }
        .rec-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }
        .rec-item {
          background: rgba(255, 255, 255, 0.02);
          border-left: 3px solid #d4af37;
          padding: 12px 16px;
          border-radius: 0 12px 12px 0;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        /* Strengths & Weaknesses */
        .sw-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          text-align: left;
        }
        @media(max-width: 576px) {
          .sw-container {
            grid-template-columns: 1fr;
          }
        }
        .sw-column h4 {
          font-family: 'Cinzel', serif;
          margin-top: 0;
          font-size: 1rem;
          letter-spacing: 0.5px;
        }
        .sw-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .sw-badge {
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.88rem;
          line-height: 1.4;
        }
        .sw-badge.strength {
          background: rgba(72, 187, 120, 0.08);
          border: 1px solid rgba(72, 187, 120, 0.2);
          color: #9ae6b4;
        }
        .sw-badge.weakness {
          background: rgba(221, 107, 32, 0.08);
          border: 1px solid rgba(221, 107, 32, 0.2);
          color: #fbd38d;
        }

        /* AI Guidance text layout */
        .ai-guide-text {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #cbd5e0;
          white-space: pre-wrap;
          text-align: left;
        }

        /* Tarot card display */
        .tarot-display-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        .tarot-image-glow {
          position: relative;
          width: 150px;
          height: 250px;
          border-radius: 12px;
          box-shadow: 0 0 20px rgba(138, 43, 226, 0.4);
          overflow: hidden;
          background: #110e24;
          border: 2px solid rgba(212, 175, 55, 0.3);
        }
        .tarot-image-glow img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .tarot-details {
          text-align: center;
        }
        .tarot-details h4 {
          font-family: 'Cinzel', serif;
          color: #d4af37;
          margin: 5px 0;
          font-size: 1.2rem;
        }
        .tarot-badge {
          background: rgba(138, 43, 226, 0.2);
          border: 1px solid rgba(138, 43, 226, 0.4);
          color: #d6bcfa;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          display: inline-block;
          margin-top: 5px;
        }

        /* Onboarding Page styling */
        .onboarding-container {
          max-width: 800px;
          margin: 60px auto;
          text-align: center;
          padding: 40px 30px;
          background: linear-gradient(135deg, rgba(20, 15, 45, 0.8) 0%, rgba(10, 5, 25, 0.9) 100%);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 24px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
        }
        .onboarding-title {
          font-family: 'Cinzel', serif;
          color: #d4af37;
          font-size: 2.2rem;
          margin-bottom: 15px;
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
        }
        .onboarding-desc {
          font-size: 1.1rem;
          color: #cbd5e0;
          margin-bottom: 40px;
          line-height: 1.6;
        }
        .roadmap {
          display: flex;
          flex-direction: column;
          gap: 25px;
          margin-bottom: 40px;
          text-align: left;
        }
        .roadmap-step {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 20px;
          border-radius: 16px;
          display: flex;
          gap: 20px;
          align-items: center;
        }
        .step-num {
          background: #d4af37;
          color: #05040d;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
          flex-shrink: 0;
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.4);
        }
        .step-body h4 {
          margin: 0 0 5px 0;
          color: #f7fafc;
          font-size: 1.1rem;
        }
        .step-body p {
          margin: 0;
          color: #a0aec0;
          font-size: 0.92rem;
          text-align: left;
        }
        .action-button-group {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .cosmic-btn {
          width: auto;
          background: linear-gradient(90deg, #b8860b 0%, #d4af37 100%);
          color: #000;
          font-weight: 700;
          padding: 12px 28px;
          font-size: 1rem;
          border-radius: 30px;
          border: none;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
          transition: all 0.3s;
        }
        .cosmic-btn:hover {
          background: linear-gradient(90deg, #d4af37 0%, #f3e5ab 100%);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
          transform: scale(1.03);
        }
        .cosmic-btn-secondary {
          width: auto;
          background: transparent;
          color: #d4af37;
          border: 1px solid rgba(212, 175, 55, 0.4);
          font-weight: 700;
          padding: 12px 28px;
          font-size: 1rem;
          border-radius: 30px;
          transition: all 0.3s;
        }
        .cosmic-btn-secondary:hover {
          background: rgba(212, 175, 55, 0.08);
          border-color: #d4af37;
          transform: scale(1.03);
        }

        /* History panel layout */
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .history-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 14px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .history-card:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .history-main {
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        .history-date {
          font-size: 0.8rem;
          color: #a0aec0;
          margin-bottom: 4px;
        }
        .history-info {
          font-weight: 600;
          font-size: 0.95rem;
          color: #f7fafc;
        }
        .history-card-name {
          font-size: 0.85rem;
          color: #d4af37;
          margin-top: 2px;
        }
      `}</style>

      {/* Error Alert Banner */}
      {error && (
        <div style={errorContainerStyle}>
          <div style={errorAlertStyle}>⚠️ {error}</div>
        </div>
      )}

      {!hasCombinedReadings ? (
        /* ================= ONBOARDING SECTION ================= */
        <div className="onboarding-container">
          <h2 className="onboarding-title">Unlock Your Cosmic Blueprint</h2>
          <p className="onboarding-desc">
            Welcome to the Palmistry & Tarot Intelligence Platform. To synthesize your personalized
            AI Intelligence Dashboard, Personality Scores, and Recommendations, you need to provide
            both palm metrics and tarot alignment energies.
          </p>

          <div className="roadmap">
            <div className="roadmap-step">
              <div className="step-num">1</div>
              <div className="step-body">
                <h4>Analyze Your Palm Metrics</h4>
                <p>Upload a clean image of your palm. Our computer vision engine extracts ratios to establish core elemental alignments.</p>
              </div>
            </div>

            <div className="roadmap-step">
              <div className="step-num">2</div>
              <div className="step-body">
                <h4>Draw Your Tarot Spread</h4>
                <p>Select your alignment focus and choose tarot cards to channels temporal subconscious energies.</p>
              </div>
            </div>

            <div className="roadmap-step">
              <div className="step-num">3</div>
              <div className="step-body">
                <h4>Synthesize Unified Intelligence Report</h4>
                <p>Combine both readings. This merges features and interpretations to populate your scores, recommendations, and life trends.</p>
              </div>
            </div>
          </div>

          <div className="action-button-group">
            <button className="cosmic-btn" onClick={() => navigate("/upload-palm")}>
              🤚 Start Palm Upload
            </button>
            <button className="cosmic-btn-secondary" onClick={() => navigate("/tarot")}>
              🔮 Choose Tarot Spread
            </button>
          </div>
        </div>
      ) : (
        /* ================= PREMIUM DASHBOARD LAYOUT ================= */
        <div className="dashboard-layout">
          {/* Header Summary */}
          <div className="cosmic-header">
            <div className="header-title-section">
              <h1>Mystical Intelligence Dashboard</h1>
              <p>Cosmic profile synthesized from your palm metrics and tarot spread alignments.</p>
            </div>
            <div className="header-stats">
              <div className="stat-pill">
                🔮 Seeker: <strong>{profile?.name || "Anonymous"}</strong>
              </div>
              <div className="stat-pill">
                📅 Synthesis: <strong>{readingDate}</strong>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* 1. Personality Intelligence Scores (Span 8 columns) */}
            <div className="glass-panel" style={{ gridColumn: "span 8" }}>
              <h3 className="panel-title">🧠 Personality Intelligence Scores</h3>
              <div className="scores-container">
                {Object.keys(personalityScores).length > 0 ? (
                  Object.keys(personalityScores).map((key) => {
                    const score = personalityScores[key] || 50;
                    const r = 32;
                    const circ = 2 * Math.PI * r;
                    const offset = circ - (score / 100) * circ;

                    // Display friendly names
                    const labels = {
                      leadership: "Leadership",
                      creativity: "Creativity",
                      emotionalIntelligence: "Emotional Q",
                      communication: "Communication",
                      decisionMaking: "Decision Making",
                      patience: "Patience",
                      confidence: "Confidence",
                      adaptability: "Adaptability",
                    };

                    return (
                      <div className="score-item" key={key}>
                        <div className="score-circle-wrapper">
                          <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
                            {/* Background Track */}
                            <circle
                              cx="40"
                              cy="40"
                              r={r}
                              fill="transparent"
                              stroke="rgba(255, 255, 255, 0.05)"
                              strokeWidth="6"
                            />
                            {/* Foreground Progress */}
                            <circle
                              cx="40"
                              cy="40"
                              r={r}
                              fill="transparent"
                              stroke="#d4af37"
                              strokeWidth="6"
                              strokeDasharray={circ}
                              strokeDashoffset={offset}
                              strokeLinecap="round"
                              style={{ filter: "drop-shadow(0 0 4px rgba(212, 175, 55, 0.4))" }}
                            />
                          </svg>
                          <div className="score-value">{score}%</div>
                        </div>
                        <div className="score-label">{labels[key] || key}</div>
                      </div>
                    );
                  })
                ) : (
                  <p>Initializing scores...</p>
                )}
              </div>
            </div>

            {/* 2. Life Trend Analyser (Span 4 columns) */}
            <div className="glass-panel" style={{ gridColumn: "span 4" }}>
              <h3 className="panel-title">📈 Life Trend Analysis</h3>
              <div className="trends-grid">
                {Object.keys(lifeTrends).length > 0 ? (
                  Object.keys(lifeTrends).map((key) => {
                    const data = lifeTrends[key] || { current: 50, previous: 50, improvement: 0 };
                    const diff = data.improvement;
                    const labels = {
                      careerTrend: { name: "Career Direction", desc: "Ambitions & Focus" },
                      loveTrend: { name: "Interpersonal Connection", desc: "Relationships & Love" },
                      financeTrend: { name: "Material Abundance", desc: "Stability & Finance" },
                      emotionalTrend: { name: "Subconscious Balance", desc: "Mental & Feelings" },
                      personalGrowthTrend: { name: "Personal Growth", desc: "Wisdom & Creativity" },
                    };

                    return (
                      <div className="trend-row" key={key}>
                        <div className="trend-meta">
                          <span className="trend-name">{labels[key]?.name || key}</span>
                          <span className="trend-desc">{labels[key]?.desc || ""}</span>
                        </div>
                        <div className="trend-values">
                          <span className="trend-current-value">{data.current}</span>
                          {diff > 0 ? (
                            <span className="trend-pill up">▲ +{diff}</span>
                          ) : diff < 0 ? (
                            <span className="trend-pill down">▼ {diff}</span>
                          ) : (
                            <span className="trend-pill stable">● {diff}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>Compiling trends...</p>
                )}
              </div>
            </div>

            {/* 3. AI Core Personality & Guidance (Span 7 columns) */}
            <div className="glass-panel" style={{ gridColumn: "span 7" }}>
              <h3 className="panel-title">📜 AI Unified Spiritual Guidance</h3>
              <div className="ai-guide-text">
                <strong>Unified Destiny Personality Profile:</strong>
                <p style={{ marginTop: "8px", marginBottom: "20px" }}>{aiInterpretation.personality}</p>

                <strong>Daily Cosmic Guidance:</strong>
                <p style={{ marginTop: "8px" }}>{aiInterpretation.guidance}</p>
              </div>
            </div>

            {/* 4. Strengths & Weaknesses (Span 5 columns) */}
            <div className="glass-panel" style={{ gridColumn: "span 5" }}>
              <h3 className="panel-title">⚖️ Strengths & Growth Areas</h3>
              <div className="sw-container">
                <div className="sw-column">
                  <h4 style={{ color: "#48bb78" }}>✦ Core Strengths</h4>
                  <div className="sw-list">
                    {aiInterpretation.strengths?.map((str, idx) => (
                      <div className="sw-badge strength" key={idx}>
                        ✓ {str}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sw-column">
                  <h4 style={{ color: "#dd6b20" }}>✦ Growth Areas</h4>
                  <div className="sw-list">
                    {aiInterpretation.weaknesses?.map((weak, idx) => (
                      <div className="sw-badge weakness" key={idx}>
                        ⚠ {weak}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Cosmic Recommendation Action Engine (Span 8 columns) */}
            <div className="glass-panel" style={{ gridColumn: "span 8" }}>
              <h3 className="panel-title">💡 Cosmic Growth Recommendations</h3>
              <div className="rec-tabs">
                <button
                  className={`rec-tab ${activeRecTab === "career" ? "active" : ""}`}
                  onClick={() => setActiveRecTab("career")}
                >
                  💼 Career Path
                </button>
                <button
                  className={`rec-tab ${activeRecTab === "learning" ? "active" : ""}`}
                  onClick={() => setActiveRecTab("learning")}
                >
                  📚 Learning Roadmap
                </button>
                <button
                  className={`rec-tab ${activeRecTab === "relationship" ? "active" : ""}`}
                  onClick={() => setActiveRecTab("relationship")}
                >
                  ❤️ Relationships
                </button>
                <button
                  className={`rec-tab ${activeRecTab === "lifestyle" ? "active" : ""}`}
                  onClick={() => setActiveRecTab("lifestyle")}
                >
                  🧘 Lifestyle Choices
                </button>
                <button
                  className={`rec-tab ${activeRecTab === "habits" ? "active" : ""}`}
                  onClick={() => setActiveRecTab("habits")}
                >
                  ⏰ Daily Habits
                </button>
              </div>

              <div className="rec-list">
                {activeRecTab === "career" &&
                  recommendations.careerRecommendations?.map((rec, idx) => (
                    <div className="rec-item" key={idx}>
                      {rec}
                    </div>
                  ))}
                {activeRecTab === "learning" &&
                  recommendations.learningRecommendations?.map((rec, idx) => (
                    <div className="rec-item" key={idx}>
                      {rec}
                    </div>
                  ))}
                {activeRecTab === "relationship" &&
                  recommendations.relationshipAdvice?.map((rec, idx) => (
                    <div className="rec-item" key={idx}>
                      {rec}
                    </div>
                  ))}
                {activeRecTab === "lifestyle" &&
                  recommendations.lifestyleRecommendations?.map((rec, idx) => (
                    <div className="rec-item" key={idx}>
                      {rec}
                    </div>
                  ))}
                {activeRecTab === "habits" &&
                  recommendations.dailyHabits?.map((rec, idx) => (
                    <div className="rec-item" key={idx}>
                      {rec}
                    </div>
                  ))}
              </div>
            </div>

            {/* 6. Active Tarot & Palm Alignment (Span 4 columns) */}
            <div className="glass-panel" style={{ gridColumn: "span 4" }}>
              <h3 className="panel-title">🌙 Cosmic Alignment Tools</h3>
              <div className="tarot-display-card">
                {primaryCard ? (
                  <>
                    <div className="tarot-image-glow">
                      <img
                        src={
                          primaryCard.imageUrl ||
                          `${API.defaults.baseURL.replace("/api", "")}${primaryCard.image}`
                        }
                        alt={primaryCard.name}
                        style={{
                          transform:
                            primaryCard.orientation === "reversed" ? "rotate(180deg)" : "none",
                        }}
                      />
                    </div>
                    <div className="tarot-details">
                      <h4>{primaryCard.name}</h4>
                      <span className="tarot-badge">
                        {primaryCard.role.toUpperCase()} (
                        {primaryCard.orientation.toUpperCase()})
                      </span>
                    </div>
                  </>
                ) : (
                  <p>No active tarot card alignment.</p>
                )}

                <div
                  style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                    width: "100%",
                    paddingTop: "15px",
                    marginTop: "5px",
                    textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", color: "#cbd5e0" }}>🤚 Palm Alignment: </span>
                  <strong style={{ color: "#d4af37", fontSize: "0.95rem" }}>{handType}</strong>
                </div>
              </div>
            </div>

            {/* 7. History & Timelines (Span 12 columns) */}
            <div className="glass-panel" style={{ gridColumn: "span 12" }}>
              <h3 className="panel-title">⌛ Reading History Timeline</h3>
              <div className="history-list">
                {readings.map((reading) => {
                  const histDate = new Date(reading.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const histTarotCard = reading.tarotReadingId?.cards?.[0] || {};

                  return (
                    <div
                      className="history-card"
                      key={reading._id}
                      onClick={() => navigate("/history")}
                    >
                      <div className="history-main">
                        <span className="history-date">{histDate}</span>
                        <span className="history-info">
                          Combined Palm ({reading.palmReadingId?.analysis?.handType || "Analyzed"}) +
                          Tarot ({reading.tarotReadingId?.readingType || "Spread"})
                        </span>
                        {histTarotCard.name && (
                          <span className="history-card-name">
                            Guide Card: {histTarotCard.name} ({histTarotCard.orientation})
                          </span>
                        )}
                      </div>
                      <div style={{ color: "#d4af37", fontWeight: "700" }}>View Details →</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline styles for high-fidelity overlays/wrappers
const dashboardWrapperStyle = {
  background: "radial-gradient(circle at 50% 0%, #151030 0%, #05040d 70%)",
  minHeight: "100vh",
};

const loadingContainerStyle = {
  position: "relative",
  minHeight: "100vh",
  background: "#05040d",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const starryBgStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "radial-gradient(circle at 50% 50%, #17113a 0%, #05040d 80%)",
  opacity: 0.8,
  zIndex: 1,
};

const spinnerContainerStyle = {
  position: "relative",
  zIndex: 2,
  textAlign: "center",
};

const cosmicSpinnerStyle = {
  fontSize: "3.5rem",
  animation: "spin 3s linear infinite",
  marginBottom: "15px",
};

const loadingTextStyle = {
  fontFamily: "'Cinzel', serif",
  color: "#d4af37",
  fontSize: "1.2rem",
  letterSpacing: "1px",
};

const errorContainerStyle = {
  maxWidth: "1300px",
  margin: "20px auto 0 auto",
  padding: "0 20px",
};

const errorAlertStyle = {
  background: "rgba(229, 62, 62, 0.15)",
  color: "#f56565",
  border: "1px solid rgba(229, 62, 62, 0.3)",
  padding: "12px 20px",
  borderRadius: "10px",
  fontSize: "0.95rem",
  textAlign: "center",
};

const statusBannerStyle = {
  background: "rgba(212, 175, 55, 0.12)",
  color: "#d4af37",
  border: "1px solid rgba(212, 175, 55, 0.3)",
  padding: "12px 20px",
  borderRadius: "10px",
  fontSize: "0.95rem",
  textAlign: "center",
  marginBottom: "20px",
};

export default Dashboard;