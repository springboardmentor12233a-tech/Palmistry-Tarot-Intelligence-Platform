import { useState } from "react";

import api from "../services/api";
import Loading from "../components/Loading";
import TarotResult from "../components/TarotResult";

function TarotReading() {

  const [spreadType, setSpreadType] = useState("three_card");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleDraw = async () => {

    try {

      setLoading(true);

      const response = await api.post(
        `/draw-tarot?spread_type=${spreadType}`
      );

      setResult(response.data);

    } catch (err) {

      console.log(err);

      alert("Failed to draw tarot cards.");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="page">

      <h1 className="page-title">

        AI Tarot Reading

      </h1>

      <div className="upload-card">

        <h2>Select Tarot Spread</h2>

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
          onClick={handleDraw}
        >

          Draw Cards

        </button>

      </div>

      {loading && (
        <Loading text="Drawing Tarot Cards..." />
      )}

      {result && (
        <TarotResult result={result} />
      )}

    </div>

  );

}

export default TarotReading;