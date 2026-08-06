import { useState } from "react";

import api from "../services/api";
import Loading from "../components/Loading";
import CombinedResult from "../components/CombinedResult";

function CombinedReading() {

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [spreadType, setSpreadType] = useState("three_card");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

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
        `/combined-reading?spread_type=${spreadType}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);

    } catch (err) {

      console.log(err);

      alert("Combined reading failed.");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="page">

      <h1 className="page-title">

        Combined Palm & Tarot Reading

      </h1>

      <div className="upload-layout">

        <div className="upload-card">

          <h2>Upload Palm Image</h2>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          <h2
            style={{
              marginTop: "25px",
            }}
          >
            Select Tarot Spread
          </h2>

          <select
            value={spreadType}
            onChange={(e) => setSpreadType(e.target.value)}
          >
            <option value="single_card">
              Single Card
            </option>

            <option value="three_card">
              Three Card Spread
            </option>
          </select>

          <button
            className="primary-btn"
            onClick={handleAnalyze}
          >
            Generate Combined Reading
          </button>

        </div>

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
        <Loading text="Generating Combined Reading..." />
      )}

      {result && (
        <CombinedResult result={result} />
      )}

    </div>

  );

}

export default CombinedReading;