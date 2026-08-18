import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import ReportView from "../components/ReportView.jsx";
import api from "../lib/api.js";

export default function ReadingDetail() {
  const { id } = useParams();
  const [reading, setReading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setReading(null);
    setError("");
    api
      .get(`/reports/${id}`)
      .then((res) => setReading(res.data))
      .catch(() => setError("This reading could not be found."));
  }, [id]);

  return (
    <Layout eyebrow="Reading" title={reading?.title || "..."}>
      <Link to="/history" className="text-sm text-muted hover:text-gold transition-colors -mt-4 block mb-6">
        ← Back to history
      </Link>
      <div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        {!error && !reading && <p className="text-sm text-muted">Loading...</p>}
        {reading && <ReportView reading={reading} />}
      </div>
    </Layout>
  );
}
