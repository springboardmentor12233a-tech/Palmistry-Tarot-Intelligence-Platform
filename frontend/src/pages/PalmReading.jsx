import { useState } from "react";

import api from "../services/api";
import Loading from "../components/Loading";
import PalmResult from "../components/PalmResult";

function PalmReading() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);

    setPreview(URL.createObjectURL(file));

    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!image) {
      alert("Please upload a palm image.");
      return;
    }

    const formData = new FormData();

    formData.append("file", image);

    try {
      setLoading(true);

      const response = await api.post(
        "/analyze-palm",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);
    } catch (err) {
      console.error(err);

      alert("Palm analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">

      <h1 className="page-title">
        AI Palm Reading
      </h1>

      <div className="upload-layout">

        {/* Upload Card */}

        <div className="upload-card">

          <h2>Upload Palm Image</h2>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          <button
            className="primary-btn"
            onClick={handleAnalyze}
          >
            Analyze Palm
          </button>

        </div>

        {/* Preview */}

        <div className="preview-card">

          <h2>Preview</h2>

          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="preview-image"
            />
          ) : (
            <div className="empty-box">
              No image selected
            </div>
          )}

        </div>

      </div>

      {loading && (
        <Loading text="Analyzing Palm..." />
      )}

      {result && (
        <PalmResult result={result} />
      )}

    </div>
  );
}

export default PalmReading;