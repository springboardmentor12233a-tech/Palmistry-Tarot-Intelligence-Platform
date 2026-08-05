import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api/axios";

function PalmUpload() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedImageInfo, setUploadedImageInfo] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local validation for better UX
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, JPEG, and PNG files are allowed.");
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds the 5 MB limit.");
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setError(null);
    setMessage(null);
    setUploadedImageInfo(null);
    setSelectedFile(file);

    // Create a local preview URL
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
  };

  // Handle drag and drop events
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  // Handle upload logic
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please choose a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("palmImage", selectedFile);

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const response = await API.post("/palm/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setMessage(response.data.message || "Upload successful!");
        setUploadedImageInfo({
          filename: response.data.filename,
          imageUrl: response.data.imageUrl,
        });
        // Clear file selections
        setSelectedFile(null);
      } else {
        setError(response.data.message || "Upload failed.");
      }
    } catch (err) {
      console.error(err);
      const serverMessage = err.response?.data?.message || "An error occurred during file upload.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle analysis logic
  const handleAnalyze = async () => {
    if (!uploadedImageInfo?.filename) return;

    try {
      setAnalyzing(true);
      setAnalysisError(null);
      setAnalysisResult(null);

      const response = await API.post("/palm/analyze", {
        filename: uploadedImageInfo.filename,
      });

      if (response.data.success) {
        setAnalysisResult(response.data);
      } else {
        setAnalysisError(response.data.message || "Palm analysis failed.");
      }
    } catch (err) {
      console.error(err);
      const serverMessage = err.response?.data?.message || "An error occurred during palm analysis.";
      setAnalysisError(serverMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      <Navbar />

      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>🤚 Upload Palm Image</h1>
          <p style={subtitleStyle}>
            Select or drag & drop a high-quality photo of your palm for analysis.
          </p>

          <form onSubmit={handleUpload}>
            {/* Drag & Drop Zone */}
            <div
              style={dropzoneStyle(previewUrl)}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Palm Preview" style={previewImageStyle} />
              ) : (
                <div style={placeholderContainerStyle}>
                  <span style={iconStyle}>📤</span>
                  <span style={dropTextStyle}>Drag & drop your image here or click to browse</span>
                  <span style={limitTextStyle}>Supports JPG, JPEG, PNG (Max 5MB)</span>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png"
              style={{ display: "none" }}
            />

            {/* Custom file name display when a file is ready but not previewed/uploaded */}
            {selectedFile && (
              <div style={fileDetailsStyle}>
                <strong>Selected file:</strong> {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
            )}

            {/* Alerts */}
            {error && <div style={errorAlertStyle}>⚠️ {error}</div>}
            {message && <div style={successAlertStyle}>✅ {message}</div>}

            {/* Upload Button */}
            <button
              type="submit"
              disabled={loading || !selectedFile}
              style={buttonStyle(loading || !selectedFile)}
            >
              {loading ? "Uploading..." : "Upload Image"}
            </button>
          </form>

          {/* Success Output Details */}
          {uploadedImageInfo && (
            <div style={resultContainerStyle}>
              <h3 style={resultTitleStyle}>Uploaded Image details:</h3>
              <p style={resultTextStyle}>
                <strong>Filename:</strong> {uploadedImageInfo.filename}
              </p>
              <p style={resultTextStyle}>
                <strong>URL:</strong>{" "}
                <a
                  href={uploadedImageInfo.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={linkStyle}
                >
                  {uploadedImageInfo.imageUrl}
                </a>
              </p>
              <div style={uploadedPreviewWrapper}>
                <img
                  src={uploadedImageInfo.imageUrl}
                  alt="Uploaded Palm"
                  style={uploadedPreviewImageStyle}
                />
              </div>

              {/* Analyze Button */}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing}
                style={analyzeButtonStyle(analyzing)}
              >
                {analyzing ? "Analyzing Palm..." : "🔍 Analyze Palm"}
              </button>

              {/* Analysis Error Alert */}
              {analysisError && (
                <div style={{ ...errorAlertStyle, marginTop: "15px", marginBottom: "0px" }}>
                  ⚠️ {analysisError}
                </div>
              )}
            </div>
          )}

          {/* Analysis Results Display */}
          {analysisResult && (
            <div style={analysisResultContainerStyle}>
              <h3 style={resultTitleStyle}>Analysis Results:</h3>
              <p style={resultTextStyle}>
                <strong>Status:</strong> Landmarking complete!
              </p>
              <p style={resultTextStyle}>
                <strong>Landmarks Detected:</strong> {analysisResult.landmarksCount} / 21
              </p>

              {/* Extracted Palm Analysis Report */}
              {analysisResult.analysis && (
                <div style={analysisReportsContainerStyle}>
                  <h4 style={analysisReportsTitleStyle}>🔮 Palm Analysis Report</h4>

                  {/* Combined Tarot Reading CTA */}
                  <div style={{ textAlign: "center", margin: "20px 0 25px 0" }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/tarot?palmReadingId=${analysisResult.reading._id}`)}
                      style={{
                        background: "linear-gradient(135deg, #d4af37 0%, #aa851c 100%)",
                        color: "#0c0a12",
                        border: "none",
                        padding: "12px 25px",
                        cursor: "pointer",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        fontSize: "15px",
                        boxShadow: "0 4px 15px rgba(212, 175, 55, 0.4)",
                        width: "auto",
                      }}
                    >
                      🔮 Continue to Combined Tarot Reading
                    </button>
                  </div>
                  
                  {/* Summary Card */}
                  <div style={summaryCardStyle}>
                    <h5 style={summaryTitleStyle}>✨ Overall Summary</h5>
                    <p style={summaryTextStyle}>{analysisResult.analysis.summary}</p>
                  </div>

                  {/* Metric Cards in a Grid */}
                  <div style={cardsGridStyle}>
                    <div style={metricCardStyle('#e7f5ff', '#1971c2')}>
                      <div style={cardHeaderStyle}>
                        <span style={cardIconStyle}>🖐️</span>
                        <strong style={cardTitleStyle}>Hand Type</strong>
                      </div>
                      <p style={cardBodyStyle}>{analysisResult.analysis.handType}</p>
                    </div>

                    <div style={metricCardStyle('#fff9db', '#f08c00')}>
                      <div style={cardHeaderStyle}>
                        <span style={cardIconStyle}>👑</span>
                        <strong style={cardTitleStyle}>Leadership</strong>
                      </div>
                      <p style={cardBodyStyle}>{analysisResult.analysis.leadership}</p>
                    </div>

                    <div style={metricCardStyle('#ebfbee', '#2b8a3e')}>
                      <div style={cardHeaderStyle}>
                        <span style={cardIconStyle}>💬</span>
                        <strong style={cardTitleStyle}>Communication</strong>
                      </div>
                      <p style={cardBodyStyle}>{analysisResult.analysis.communication}</p>
                    </div>

                    <div style={metricCardStyle('#f8f0fc', '#9c36b5')}>
                      <div style={cardHeaderStyle}>
                        <span style={cardIconStyle}>🧠</span>
                        <strong style={cardTitleStyle}>Thinking Style</strong>
                      </div>
                      <p style={cardBodyStyle}>{analysisResult.analysis.thinkingStyle}</p>
                    </div>

                    <div style={metricCardStyle('#fff0f6', '#d6336c')}>
                      <div style={cardHeaderStyle}>
                        <span style={cardIconStyle}>🛡️</span>
                        <strong style={cardTitleStyle}>Confidence</strong>
                      </div>
                      <p style={cardBodyStyle}>{analysisResult.analysis.confidence}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Extracted Palm Features Table */}
              {analysisResult.extractedFeatures && (
                <div style={featuresTableContainerStyle}>
                  <h4 style={featuresTitleStyle}>📏 Extracted Palm Measurements</h4>
                  <p style={featuresSubtitleStyle}>
                    These dimensions are computed as relative ratios using 3D Euclidean distances between key landmarks.
                  </p>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={tableHeaderRowStyle}>
                        <th style={tableHeaderCellStyle}>Measurement Type</th>
                        <th style={tableHeaderCellStyle}>Relative Value</th>
                        <th style={tableHeaderCellStyle}>Visual Scale</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={getRowStyle(0)}>
                        <td style={tableCellStyle}><strong>Palm Width</strong></td>
                        <td style={tableValueCellStyle}>{analysisResult.extractedFeatures.palmWidth}</td>
                        <td style={tableCellStyle}>
                          <div style={progressBarBgStyle}>
                            <div style={progressBarFillStyle(analysisResult.extractedFeatures.palmWidth, '#4dabf7')} />
                          </div>
                        </td>
                      </tr>
                      <tr style={getRowStyle(1)}>
                        <td style={tableCellStyle}><strong>Palm Height</strong></td>
                        <td style={tableValueCellStyle}>{analysisResult.extractedFeatures.palmHeight}</td>
                        <td style={tableCellStyle}>
                          <div style={progressBarBgStyle}>
                            <div style={progressBarFillStyle(analysisResult.extractedFeatures.palmHeight, '#37b24d')} />
                          </div>
                        </td>
                      </tr>
                      <tr style={getRowStyle(2)}>
                        <td style={tableCellStyle}><strong>Thumb Length</strong></td>
                        <td style={tableValueCellStyle}>{analysisResult.extractedFeatures.thumbLength}</td>
                        <td style={tableCellStyle}>
                          <div style={progressBarBgStyle}>
                            <div style={progressBarFillStyle(analysisResult.extractedFeatures.thumbLength, '#fcc419')} />
                          </div>
                        </td>
                      </tr>
                      <tr style={getRowStyle(3)}>
                        <td style={tableCellStyle}><strong>Index Finger Length</strong></td>
                        <td style={tableValueCellStyle}>{analysisResult.extractedFeatures.indexFingerLength}</td>
                        <td style={tableCellStyle}>
                          <div style={progressBarBgStyle}>
                            <div style={progressBarFillStyle(analysisResult.extractedFeatures.indexFingerLength, '#ff922b')} />
                          </div>
                        </td>
                      </tr>
                      <tr style={getRowStyle(4)}>
                        <td style={tableCellStyle}><strong>Middle Finger Length</strong></td>
                        <td style={tableValueCellStyle}>{analysisResult.extractedFeatures.middleFingerLength}</td>
                        <td style={tableCellStyle}>
                          <div style={progressBarBgStyle}>
                            <div style={progressBarFillStyle(analysisResult.extractedFeatures.middleFingerLength, '#f06595')} />
                          </div>
                        </td>
                      </tr>
                      <tr style={getRowStyle(5)}>
                        <td style={tableCellStyle}><strong>Ring Finger Length</strong></td>
                        <td style={tableValueCellStyle}>{analysisResult.extractedFeatures.ringFingerLength}</td>
                        <td style={tableCellStyle}>
                          <div style={progressBarBgStyle}>
                            <div style={progressBarFillStyle(analysisResult.extractedFeatures.ringFingerLength, '#cc5de8')} />
                          </div>
                        </td>
                      </tr>
                      <tr style={getRowStyle(6)}>
                        <td style={tableCellStyle}><strong>Little Finger Length</strong></td>
                        <td style={tableValueCellStyle}>{analysisResult.extractedFeatures.littleFingerLength}</td>
                        <td style={tableCellStyle}>
                          <div style={progressBarBgStyle}>
                            <div style={progressBarFillStyle(analysisResult.extractedFeatures.littleFingerLength, '#845ef7')} />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Coordinates JSON */}
              <div style={landmarksListWrapperStyle}>
                <strong style={{ fontSize: "13px", display: "block", marginBottom: "5px", marginTop: "20px" }}>
                  Coordinates JSON:
                </strong>
                <pre style={preStyle}>
                  {JSON.stringify(analysisResult.landmarks, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Inline Styles (Vanilla CSS with polished aesthetics)
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "calc(100vh - 70px)",
  background: "#f8f9fa",
  padding: "20px",
  boxSizing: "border-box",
};

const cardStyle = {
  width: "100%",
  maxWidth: "500px",
  background: "#ffffff",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
  padding: "40px",
  boxSizing: "border-box",
  border: "1px solid #eaeaea",
};

const titleStyle = {
  fontSize: "28px",
  color: "#2b2b2b",
  margin: "0 0 10px 0",
  textAlign: "center",
  fontWeight: "700",
};

const subtitleStyle = {
  fontSize: "14px",
  color: "#6c757d",
  margin: "0 0 30px 0",
  textAlign: "center",
  lineHeight: "1.5",
};

const dropzoneStyle = (hasPreview) => ({
  width: "100%",
  height: "240px",
  border: hasPreview ? "1px solid #ddd" : "2px dashed #0077ff",
  borderRadius: "12px",
  background: hasPreview ? "#fcfcfc" : "#f0f7ff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  overflow: "hidden",
  transition: "all 0.3s ease",
  position: "relative",
  marginBottom: "20px",
});

const placeholderContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  textAlign: "center",
};

const iconStyle = {
  fontSize: "40px",
  marginBottom: "10px",
};

const dropTextStyle = {
  fontSize: "15px",
  color: "#0077ff",
  fontWeight: "600",
  marginBottom: "8px",
};

const limitTextStyle = {
  fontSize: "12px",
  color: "#6c757d",
};

const previewImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
};

const fileDetailsStyle = {
  fontSize: "13px",
  color: "#495057",
  marginBottom: "15px",
  background: "#f1f3f5",
  padding: "8px 12px",
  borderRadius: "6px",
  borderLeft: "4px solid #0077ff",
};

const errorAlertStyle = {
  backgroundColor: "#fff5f5",
  color: "#e03131",
  padding: "12px 16px",
  borderRadius: "8px",
  border: "1px solid #ffc9c9",
  fontSize: "14px",
  marginBottom: "20px",
};

const successAlertStyle = {
  backgroundColor: "#ebfbee",
  color: "#2f9e44",
  padding: "12px 16px",
  borderRadius: "8px",
  border: "1px solid #b2f2bb",
  fontSize: "14px",
  marginBottom: "20px",
};

const buttonStyle = (isDisabled) => ({
  width: "100%",
  padding: "14px",
  backgroundColor: isDisabled ? "#a5d8ff" : "#0077ff",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "600",
  cursor: isDisabled ? "not-allowed" : "pointer",
  transition: "background-color 0.2s ease",
  boxShadow: isDisabled ? "none" : "0 4px 12px rgba(0, 119, 255, 0.15)",
});

const resultContainerStyle = {
  marginTop: "30px",
  padding: "20px",
  backgroundColor: "#f8f9fa",
  borderRadius: "12px",
  border: "1px solid #e9ecef",
};

const resultTitleStyle = {
  fontSize: "16px",
  color: "#343a40",
  margin: "0 0 12px 0",
  fontWeight: "600",
};

const resultTextStyle = {
  fontSize: "13px",
  color: "#495057",
  margin: "0 0 8px 0",
  wordBreak: "break-all",
  textAlign: "left",
};

const linkStyle = {
  color: "#0077ff",
  textDecoration: "none",
  fontWeight: "500",
};

const uploadedPreviewWrapper = {
  marginTop: "15px",
  width: "100%",
  height: "150px",
  borderRadius: "8px",
  overflow: "hidden",
  border: "1px solid #dee2e6",
};

const uploadedPreviewImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  backgroundColor: "#000000",
};

const analyzeButtonStyle = (isAnalyzing) => ({
  width: "100%",
  padding: "12px",
  backgroundColor: isAnalyzing ? "#a5d8ff" : "#2f9e44",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: isAnalyzing ? "not-allowed" : "pointer",
  marginTop: "15px",
  transition: "background-color 0.2s ease",
  boxShadow: isAnalyzing ? "none" : "0 4px 12px rgba(47, 158, 68, 0.15)",
});

const analysisResultContainerStyle = {
  marginTop: "20px",
  padding: "20px",
  backgroundColor: "#f8f9fa",
  borderRadius: "12px",
  border: "1px solid #2f9e44",
};

const landmarksListWrapperStyle = {
  marginTop: "12px",
  textAlign: "left",
};

const preStyle = {
  background: "#212529",
  color: "#a9e34b",
  padding: "12px",
  borderRadius: "6px",
  fontSize: "12px",
  maxHeight: "200px",
  overflowY: "auto",
  margin: "0",
  fontFamily: "monospace",
};

const featuresTableContainerStyle = {
  marginTop: "25px",
  paddingTop: "20px",
  borderTop: "1px dashed #dee2e6",
  textAlign: "left",
};

const featuresTitleStyle = {
  fontSize: "16px",
  color: "#343a40",
  margin: "0 0 5px 0",
  fontWeight: "700",
};

const featuresSubtitleStyle = {
  fontSize: "12px",
  color: "#6c757d",
  margin: "0 0 15px 0",
  lineHeight: "1.4",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: "0",
  fontSize: "13px",
  borderRadius: "8px",
  overflow: "hidden",
  border: "1px solid #e9ecef",
};

const tableHeaderRowStyle = {
  backgroundColor: "#f1f3f5",
};

const tableHeaderCellStyle = {
  padding: "10px 12px",
  fontWeight: "600",
  color: "#495057",
  borderBottom: "1px solid #dee2e6",
  textAlign: "left",
};

const getRowStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#ffffff" : "#fcfcfc",
  borderBottom: "1px solid #f1f3f5",
});

const tableCellStyle = {
  padding: "10px 12px",
  color: "#495057",
  verticalAlign: "middle",
  borderBottom: "1px solid #f1f3f5",
};

const tableValueCellStyle = {
  padding: "10px 12px",
  color: "#212529",
  fontFamily: "monospace",
  fontWeight: "600",
  verticalAlign: "middle",
  borderBottom: "1px solid #f1f3f5",
};

const progressBarBgStyle = {
  width: "100px",
  height: "8px",
  backgroundColor: "#e9ecef",
  borderRadius: "4px",
  overflow: "hidden",
};

const progressBarFillStyle = (value, color) => {
  // Map normalized hand ratios to a percentage representation.
  // Finger lengths sum might be up to ~0.8. Palm dimensions up to ~0.6.
  // We can cap at 100% or scale it. Scaling: let's multiply value by 120% to make it visual.
  const percentage = Math.min(Math.round(value * 120), 100);
  return {
    width: `${percentage}%`,
    height: "100%",
    backgroundColor: color,
    borderRadius: "4px",
  };
};

const analysisReportsContainerStyle = {
  marginTop: "20px",
  paddingTop: "15px",
  borderTop: "1px dashed #dee2e6",
  textAlign: "left",
};

const analysisReportsTitleStyle = {
  fontSize: "18px",
  color: "#1a1a1a",
  margin: "0 0 15px 0",
  fontWeight: "700",
};

const summaryCardStyle = {
  background: "linear-gradient(135deg, #f3f0ff 0%, #e8ecfb 100%)",
  padding: "16px 20px",
  borderRadius: "10px",
  marginBottom: "20px",
  border: "1px solid #d0bfff",
  boxShadow: "0 2px 8px rgba(103, 58, 183, 0.05)",
};

const summaryTitleStyle = {
  fontSize: "14px",
  color: "#5f3dc4",
  margin: "0 0 8px 0",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const summaryTextStyle = {
  fontSize: "13.5px",
  color: "#343a40",
  margin: "0",
  lineHeight: "1.5",
};

const cardsGridStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginBottom: "20px",
};

const metricCardStyle = (bgColor, borderColor) => ({
  backgroundColor: bgColor,
  border: `1px solid ${borderColor}`,
  borderRadius: "8px",
  padding: "14px 16px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
});

const cardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "6px",
};

const cardIconStyle = {
  fontSize: "16px",
};

const cardTitleStyle = {
  fontSize: "13px",
  color: "#212529",
  fontWeight: "700",
};

const cardBodyStyle = {
  fontSize: "13px",
  color: "#495057",
  margin: "0",
  lineHeight: "1.45",
};

export default PalmUpload;
