import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { jsPDF } from "jspdf";

function History() {
  const [activeTab, setActiveTab] = useState("palm"); // 'palm' | 'tarot' | 'combined'
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReading, setSelectedReading] = useState(null);

  // Fetch readings when tab changes
  useEffect(() => {
    fetchReadings();
  }, [activeTab]);

  const fetchReadings = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = "";
      if (activeTab === "palm") url = "/palm/readings";
      else if (activeTab === "tarot") url = "/tarot/readings";
      else if (activeTab === "combined") url = "/combined/readings";

      const response = await API.get(url);
      if (response.data.success) {
        setReadings(response.data.readings || []);
      } else {
        setError(`Failed to retrieve ${activeTab} readings.`);
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to server. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this reading?")) return;

    try {
      let url = "";
      if (activeTab === "palm") url = `/palm/reading/${id}`;
      else if (activeTab === "tarot") url = `/tarot/reading/${id}`;
      else if (activeTab === "combined") url = `/combined/reading/${id}`;

      const response = await API.delete(url);
      if (response.data.success) {
        setReadings(readings.filter((r) => r._id !== id));
        if (selectedReading?._id === id) {
          setSelectedReading(null);
        }
      } else {
        alert("Failed to delete reading.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while deleting reading.");
    }
  };

  // Filter readings based on search query
  const filteredReadings = readings.filter((r) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const dateStr = new Date(r.createdAt).toLocaleDateString().toLowerCase();
    
    if (activeTab === "palm") {
      return (
        dateStr.includes(query) ||
        (r.analysis?.handType && r.analysis.handType.toLowerCase().includes(query)) ||
        (r.analysis?.summary && r.analysis.summary.toLowerCase().includes(query))
      );
    } else if (activeTab === "tarot") {
      const cardNames = r.cards ? r.cards.map((c) => c.name.toLowerCase()).join(" ") : "";
      return (
        dateStr.includes(query) ||
        r.readingType.toLowerCase().includes(query) ||
        cardNames.includes(query)
      );
    } else {
      return (
        dateStr.includes(query) ||
        (r.palmSummary && r.palmSummary.toLowerCase().includes(query)) ||
        (r.tarotSummary && r.tarotSummary.toLowerCase().includes(query))
      );
    }
  });

  // Client-side PDF generator using jsPDF
  const generatePDFReport = (reading) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 30; // current cursor height

    // Helper for page overflow check
    const checkPageOverflow = (heightNeeded) => {
      if (y + heightNeeded > pageHeight - margin) {
        doc.addPage();
        drawPageBorder();
        drawPageHeader();
        y = 35;
      }
    };

    // Draw border
    const drawPageBorder = () => {
      doc.setDrawColor(212, 175, 55); // Gold border
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    };

    // Draw header decoration
    const drawPageHeader = () => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("PALMISTRY & TAROT INTELLIGENCE REPORT", margin, 15);
      doc.line(margin, 17, pageWidth - margin, 17);
    };

    // Initialize first page
    drawPageBorder();
    drawPageHeader();

    // 1. Title Banner
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(26, 20, 42); // Cosmic Dark Purple
    doc.text("COSMIC INTELLIGENCE REPORT", margin, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated on: ${new Date(reading.createdAt).toLocaleString()}`, margin, y);
    y += 12;

    if (activeTab === "palm") {
      // PALMISTRY ONLY REPORT
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(212, 175, 55); // Gold
      doc.text("🤚 PALM ANALYSIS RESULTS", margin, y);
      y += 8;

      const items = [
        { label: "Hand Type", val: reading.analysis?.handType },
        { label: "Leadership", val: reading.analysis?.leadership },
        { label: "Communication", val: reading.analysis?.communication },
        { label: "Thinking Style", val: reading.analysis?.thinkingStyle },
        { label: "Confidence", val: reading.analysis?.confidence },
      ];

      // Draw table/grid
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);

      items.forEach((item) => {
        checkPageOverflow(10);
        doc.setFont("helvetica", "bold");
        doc.text(`${item.label}:`, margin, y);
        doc.setFont("helvetica", "normal");
        const valText = doc.splitTextToSize(item.val || "N/A", contentWidth - 40);
        doc.text(valText, margin + 40, y);
        y += (valText.length * 5) + 3;
      });

      y += 5;
      checkPageOverflow(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(26, 20, 42);
      doc.text("✨ Overall Summary", margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const summaryLines = doc.splitTextToSize(reading.analysis?.summary || "", contentWidth);
      summaryLines.forEach((line) => {
        checkPageOverflow(6);
        doc.text(line, margin, y);
        y += 5;
      });

    } else if (activeTab === "tarot") {
      // TAROT ONLY REPORT
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(212, 175, 55); // Gold
      doc.text(`🃏 TAROT SPREAD: ${reading.readingType.toUpperCase()}`, margin, y);
      y += 10;

      // Card listings
      reading.cards.forEach((c) => {
        checkPageOverflow(15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(26, 20, 42);
        doc.text(`• ${c.role.toUpperCase()}: ${c.name} (${c.orientation.toUpperCase()})`, margin, y);
        y += 7;
      });

      y += 5;

      const aspects = [
        { title: "General Meaning", text: reading.interpretation?.general },
        { title: "Love & Relationships", text: reading.interpretation?.love },
        { title: "Career & Ambitions", text: reading.interpretation?.career },
        { title: "Health & Vitality", text: reading.interpretation?.health },
        { title: "Finances & Wealth", text: reading.interpretation?.money },
      ];

      aspects.forEach((asp) => {
        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(212, 175, 55);
        doc.text(asp.title, margin, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const textLines = doc.splitTextToSize(asp.text || "", contentWidth);
        textLines.forEach((line) => {
          checkPageOverflow(6);
          doc.text(line, margin, y);
          y += 5;
        });
        y += 4;
      });

    } else {
      // COMBINED SYNTHESIS REPORT
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(212, 175, 55); // Gold
      doc.text("🔮 COMBINED PALMISTRY & TAROT REPORT", margin, y);
      y += 10;

      const sections = [
        { title: "🤚 Palm Summary", content: reading.palmSummary },
        { title: "🃏 Tarot Spread", content: reading.tarotSummary },
        { title: "🌌 Unified Cosmic Synthesis", content: reading.overallReading },
        { title: "🧭 Guidance & Advice", content: reading.advice },
        { title: "💎 Key Strengths", content: reading.strengths },
        { title: "🔥 Major Challenges", content: reading.challenges },
      ];

      sections.forEach((sec) => {
        checkPageOverflow(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(26, 20, 42);
        doc.text(sec.title, margin, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const textLines = doc.splitTextToSize(sec.content || "", contentWidth);
        textLines.forEach((line) => {
          checkPageOverflow(6);
          doc.text(line, margin, y);
          y += 5;
        });
        y += 6;
      });

      // Actions section
      if (reading.suggestedActions) {
        checkPageOverflow(35);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(212, 175, 55);
        doc.text("📋 Suggested Actions", margin, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const lines = doc.splitTextToSize(reading.suggestedActions, contentWidth);
        lines.forEach((line) => {
          checkPageOverflow(6);
          doc.text(line, margin, y);
          y += 5;
        });
      }
    }

    doc.save(`${activeTab}_reading_report_${reading._id.substring(18)}.pdf`);
  };

  return (
    <>
      <Navbar />

      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>📜 Readings History</h1>
          <p style={subtitleStyle}>Search and review all your past palm and tarot revelations.</p>

          {/* Search Bar */}
          <div style={searchContainerStyle}>
            <input
              type="text"
              placeholder="🔍 Search history by keyword, date, or trait..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={searchInputStyle}
            />
          </div>

          {/* Navigation Tabs */}
          <div style={tabContainerStyle}>
            <button
              onClick={() => { setActiveTab("palm"); setSelectedReading(null); }}
              style={activeTab === "palm" ? activeTabBtnStyle : inactiveTabBtnStyle}
            >
              🤚 Palm Readings
            </button>
            <button
              onClick={() => { setActiveTab("tarot"); setSelectedReading(null); }}
              style={activeTab === "tarot" ? activeTabBtnStyle : inactiveTabBtnStyle}
            >
              🃏 Tarot Drawings
            </button>
            <button
              onClick={() => { setActiveTab("combined"); setSelectedReading(null); }}
              style={activeTab === "combined" ? activeTabBtnStyle : inactiveTabBtnStyle}
            >
              🔮 Combined Reports
            </button>
          </div>

          {loading ? (
            <div style={loadingStyle}>🔮 Communing with history...</div>
          ) : error ? (
            <div style={errorAlertStyle}>⚠️ {error}</div>
          ) : filteredReadings.length === 0 ? (
            <div style={emptyStyle}>
              📜 No readings found. Try modifying your search or run a new reading!
            </div>
          ) : (
            <div style={layoutGridStyle}>
              {/* Readings List */}
              <div style={listStyle}>
                {filteredReadings.map((reading) => {
                  const date = new Date(reading.createdAt).toLocaleDateString();
                  const isSelected = selectedReading?._id === reading._id;

                  return (
                    <div
                      key={reading._id}
                      onClick={() => setSelectedReading(reading)}
                      style={itemCardStyle(isSelected)}
                    >
                      <div style={itemInfoStyle}>
                        <strong style={itemTitleStyle}>
                          {activeTab === "palm" && `🤚 ${reading.analysis?.handType || "Palm Analysis"}`}
                          {activeTab === "tarot" && `🃏 ${reading.readingType === "one-card" ? "One-Card Focus" : "Three-Card Spread"}`}
                          {activeTab === "combined" && "🔮 Combined Reading Report"}
                        </strong>
                        <span style={itemDateStyle}>📅 {date}</span>
                      </div>
                      <div style={itemActionsStyle}>
                        <button
                          onClick={() => generatePDFReport(reading)}
                          style={pdfButtonStyle}
                          title="Download PDF report"
                        >
                          📄 PDF
                        </button>
                        <button
                          onClick={(e) => handleDelete(reading._id, e)}
                          style={deleteButtonStyle}
                          title="Delete reading record"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reading Details Viewer */}
              <div style={viewerStyle}>
                {selectedReading ? (
                  <div style={viewerContentStyle}>
                    <div style={viewerHeaderStyle}>
                      <h3>Report Detail</h3>
                      <button
                        onClick={() => generatePDFReport(selectedReading)}
                        style={viewerPdfBtnStyle}
                      >
                        📥 Download PDF
                      </button>
                    </div>

                    {activeTab === "palm" && (
                      <div style={detailBodyStyle}>
                        <div style={sectionStyle}>
                          <h4>🤚 Palm Metrics</h4>
                          <ul style={listNoBulletStyle}>
                            <li><strong>Hand Type:</strong> {selectedReading.analysis?.handType}</li>
                            <li><strong>Leadership:</strong> {selectedReading.analysis?.leadership}</li>
                            <li><strong>Communication:</strong> {selectedReading.analysis?.communication}</li>
                            <li><strong>Thinking Style:</strong> {selectedReading.analysis?.thinkingStyle}</li>
                            <li><strong>Confidence:</strong> {selectedReading.analysis?.confidence}</li>
                          </ul>
                        </div>
                        <div style={sectionStyle}>
                          <h4>✨ Overall Summary</h4>
                          <p style={detailTextStyle}>{selectedReading.analysis?.summary}</p>
                        </div>
                      </div>
                    )}

                    {activeTab === "tarot" && (
                      <div style={detailBodyStyle}>
                        <div style={cardsSpreadStyle}>
                          {selectedReading.cards.map((c, idx) => (
                            <div key={idx} style={tinyCardContainerStyle}>
                              <span style={tinyBadgeStyle}>{c.role.toUpperCase()}</span>
                              <div style={tinyImgWrapperStyle}>
                                <img
                                  src={c.imageUrl || `${API.defaults.baseURL.replace("/api", "")}${c.image}`}
                                  alt={c.name}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    transform: c.orientation === "reversed" ? "rotate(180deg)" : "none",
                                  }}
                                />
                              </div>
                              <span style={tinyCardNameStyle}>{c.name} ({c.orientation})</span>
                            </div>
                          ))}
                        </div>

                        <div style={sectionStyle}>
                          <h4>🌌 General Insight</h4>
                          <p style={detailTextStyle}>{selectedReading.interpretation.general}</p>
                        </div>
                        <div style={sectionStyle}>
                          <h4>❤️ Love & Relationships</h4>
                          <p style={detailTextStyle}>{selectedReading.interpretation.love}</p>
                        </div>
                        <div style={sectionStyle}>
                          <h4>💼 Career & Ambitions</h4>
                          <p style={detailTextStyle}>{selectedReading.interpretation.career}</p>
                        </div>
                        <div style={sectionStyle}>
                          <h4>🍀 Health & Energy</h4>
                          <p style={detailTextStyle}>{selectedReading.interpretation.health}</p>
                        </div>
                        <div style={sectionStyle}>
                          <h4>💰 Finances & Wealth</h4>
                          <p style={detailTextStyle}>{selectedReading.interpretation.money}</p>
                        </div>
                      </div>
                    )}

                    {activeTab === "combined" && (
                      <div style={detailBodyStyle}>
                        <div style={sectionStyle}>
                          <h4>🤚 Palmistry Summary</h4>
                          <p style={detailTextStyle}>{selectedReading.palmSummary}</p>
                        </div>
                        <div style={sectionStyle}>
                          <h4>🃏 Tarot Summary</h4>
                          <p style={detailTextStyle}>{selectedReading.tarotSummary}</p>
                        </div>
                        <div style={sectionStyle}>
                          <h4>🌌 Cosmic Synthesis</h4>
                          <p style={detailTextStyle}>{selectedReading.overallReading}</p>
                        </div>
                        <div style={sectionStyle}>
                          <h4>🧭 Strategic Advice</h4>
                          <p style={detailTextStyle}>{selectedReading.advice}</p>
                        </div>
                        <div style={{ ...gridTwoStyle, borderBottom: "none" }}>
                          <div style={{ ...sectionStyle, borderBottom: "none" }}>
                            <h4>💎 Strengths</h4>
                            <p style={detailTextStyle}>{selectedReading.strengths}</p>
                          </div>
                          <div style={{ ...sectionStyle, borderBottom: "none" }}>
                            <h4>🔥 Challenges</h4>
                            <p style={detailTextStyle}>{selectedReading.challenges}</p>
                          </div>
                        </div>
                        <div style={sectionStyle}>
                          <h4>📋 Suggested Actions</h4>
                          <div style={{ whiteSpace: "pre-wrap", color: "#d0cbde", lineHeight: "1.6", fontSize: "14px" }}>
                            {selectedReading.suggestedActions}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={emptyViewerStyle}>
                    👉 Select a reading from the list to view detailed reports.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Inline Styles matching Tarot selection theme (Aesthetics: cosmic purple, gold glow)
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "calc(100vh - 70px)",
  background: "#0c0a12",
  backgroundImage: "radial-gradient(circle at 50% 50%, #1c142c 0%, #0c0a12 100%)",
  padding: "40px 20px",
  boxSizing: "border-box",
  color: "#f3f0f7",
  fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
};

const cardStyle = {
  width: "100%",
  maxWidth: "1000px",
  background: "rgba(25, 20, 38, 0.7)",
  backdropFilter: "blur(12px)",
  borderRadius: "24px",
  border: "1px solid rgba(212, 175, 55, 0.2)",
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
  fontSize: "15px",
  color: "#a9a2c1",
  textAlign: "center",
  margin: "0 0 30px 0",
};

const searchContainerStyle = {
  marginBottom: "25px",
};

const searchInputStyle = {
  width: "100%",
  padding: "14px 20px",
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "12px",
  color: "#f3f0f7",
  fontSize: "15px",
  boxSizing: "border-box",
  outline: "none",
  transition: "all 0.3s ease",
};

const tabContainerStyle = {
  display: "flex",
  gap: "10px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  paddingBottom: "15px",
  marginBottom: "30px",
  flexWrap: "wrap",
};

const activeTabBtnStyle = {
  padding: "10px 20px",
  background: "linear-gradient(135deg, #d4af37 0%, #aa851c 100%)",
  color: "#0c0a12",
  border: "none",
  borderRadius: "8px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(212, 175, 55, 0.2)",
};

const inactiveTabBtnStyle = {
  padding: "10px 20px",
  background: "transparent",
  color: "#a9a2c1",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s ease",
};

const layoutGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1.3fr",
  gap: "30px",
  minHeight: "450px",
};

const listStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  maxHeight: "550px",
  overflowY: "auto",
  paddingRight: "5px",
};

const itemCardStyle = (isSelected) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 20px",
  background: isSelected ? "rgba(212, 175, 55, 0.1)" : "rgba(255, 255, 255, 0.02)",
  border: isSelected ? "1px solid #d4af37" : "1px solid rgba(255, 255, 255, 0.05)",
  borderRadius: "12px",
  cursor: "pointer",
  transition: "all 0.2s ease",
});

const itemInfoStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const itemTitleStyle = {
  fontSize: "15px",
  fontWeight: "600",
  color: "#f3f0f7",
};

const itemDateStyle = {
  fontSize: "12px",
  color: "#a9a2c1",
};

const itemActionsStyle = {
  display: "flex",
  gap: "10px",
};

const pdfButtonStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  color: "#f3f0f7",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: "bold",
  transition: "all 0.2s ease",
};

const deleteButtonStyle = {
  background: "rgba(224, 49, 49, 0.1)",
  border: "1px solid rgba(224, 49, 49, 0.2)",
  color: "#ffc9c9",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  transition: "all 0.2s ease",
};

const viewerStyle = {
  background: "rgba(255, 255, 255, 0.01)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  borderRadius: "16px",
  padding: "25px",
  maxHeight: "550px",
  overflowY: "auto",
};

const viewerContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const viewerHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  paddingBottom: "15px",
};

const viewerPdfBtnStyle = {
  background: "linear-gradient(135deg, #d4af37 0%, #aa851c 100%)",
  border: "none",
  color: "#0c0a12",
  padding: "8px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold",
  boxShadow: "0 4px 10px rgba(212, 175, 55, 0.2)",
};

const detailBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const sectionStyle = {
  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  paddingBottom: "15px",
};

const listNoBulletStyle = {
  listStyleType: "none",
  paddingLeft: 0,
  margin: "10px 0 0 0",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  fontSize: "14px",
  color: "#d0cbde",
};

const detailTextStyle = {
  fontSize: "14px",
  color: "#d0cbde",
  lineHeight: "1.6",
  margin: "10px 0 0 0",
  whiteSpace: "pre-wrap",
};

const cardsSpreadStyle = {
  display: "flex",
  gap: "15px",
  flexWrap: "wrap",
  marginBottom: "10px",
};

const tinyCardContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100px",
};

const tinyBadgeStyle = {
  background: "rgba(212, 175, 55, 0.1)",
  border: "1px solid #d4af37",
  borderRadius: "10px",
  color: "#fceb92",
  fontSize: "9px",
  fontWeight: "bold",
  padding: "2px 6px",
  marginBottom: "6px",
};

const tinyImgWrapperStyle = {
  width: "80px",
  height: "140px",
  borderRadius: "6px",
  border: "2px solid #d4af37",
  overflow: "hidden",
};

const tinyCardNameStyle = {
  fontSize: "10px",
  color: "#a9a2c1",
  marginTop: "5px",
  textAlign: "center",
  fontWeight: "500",
};

const gridTwoStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  paddingBottom: "15px",
};

const emptyViewerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  color: "#a9a2c1",
  textAlign: "center",
  fontSize: "15px",
  fontStyle: "italic",
};

const emptyStyle = {
  textAlign: "center",
  color: "#a9a2c1",
  padding: "40px",
  fontSize: "15px",
};

const loadingStyle = {
  textAlign: "center",
  color: "#fceb92",
  padding: "40px",
  fontSize: "16px",
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

export default History;
