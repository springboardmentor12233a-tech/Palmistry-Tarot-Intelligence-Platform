import { useRef, useState } from "react";
import Layout from "../components/Layout.jsx";
import ConstellationLoader from "../components/ConstellationLoader.jsx";
import ReportView from "../components/ReportView.jsx";
import api from "../lib/api.js";

const STEPS = ["Upload", "Detect", "Extract", "Interpret"];

export default function Palmistry() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | error | done
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [reading, setReading] = useState(null);
  const inputRef = useRef(null);

  function onFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus("idle");
    setReading(null);
  }

  async function analyze() {
    if (!file) return;
    setStatus("loading");
    setError("");
    setStepIndex(0);

    const messages = [
      "Detecting your hand...",
      "Aligning and isolating the palm...",
      "Tracing the skeleton graph...",
      "Interpreting your lines...",
    ];
    const ticker = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, messages.length - 1));
    }, 1800);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post("/palm/analyze", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setReading(res.data);
      setStatus("done");
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong analyzing this image.");
      setStatus("error");
    } finally {
      clearInterval(ticker);
    }
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setStatus("idle");
    setReading(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Layout
      eyebrow="Palmistry"
      title="Read Your Palm"
    >
      <p className="text-muted -mt-6 mb-8 text-sm max-w-lg hidden md:block">
        A clear, well-lit photo of your open palm works best. We'll align your hand, extract
        the Life, Head, Heart, and Fate lines, and generate an interpretation.
      </p>
      <div className="mb-8 md:hidden">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-teal mb-2">Palmistry</p>
        <h1 className="font-display text-3xl text-ink">Read your palm</h1>
        <p className="text-muted mt-2 text-sm max-w-lg">
          A clear, well-lit photo of your open palm works best.
        </p>
      </div>

      {status === "done" && reading ? (
        <div className="space-y-6">
          <ReportView reading={reading} />
          <button
            onClick={reset}
            className="text-sm text-muted hover:text-gold transition-colors"
          >
            ← Start a new palm reading
          </button>
        </div>
      ) : status === "loading" ? (
        <div className="hairline rounded-2xl bg-surface p-10">
          <ConstellationLoader label={STEPS[stepIndex] + "..."} />
          <div className="flex justify-center gap-2 mt-2">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`text-xs font-mono px-2 py-1 rounded ${
                  i <= stepIndex ? "text-gold" : "text-muted/50"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="hairline rounded-2xl bg-surface p-8 max-w-xl">
          <label
            htmlFor="palm-upload"
            className="block border-2 border-dashed border-gold/35 rounded-xl aspect-square max-h-80 flex flex-col items-center justify-center cursor-pointer hover:border-gold/60 transition-colors overflow-hidden bg-cream-soft/40"
          >
            {preview ? (
              <img src={preview} alt="Selected palm" className="w-full h-full object-cover" />
            ) : (
              <>
                <span className="text-3xl text-gold/80 mb-2">✋</span>
                <span className="text-sm text-muted">Click to choose a photo</span>
                <span className="text-xs text-muted/60 mt-1">JPEG, PNG, or WEBP</span>
              </>
            )}
          </label>
          <input
            id="palm-upload"
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            onChange={onFileChange}
          />

          {error && <p className="text-sm text-red-700 mt-4">{error}</p>}

          <div className="flex gap-3 mt-6">
            <button
              onClick={analyze}
              disabled={!file}
              className="flex-1 py-2.5 rounded-lg bg-ink text-cream font-medium hover:bg-ink-soft transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Analyze My Palm
            </button>
            {preview && (
              <button
                onClick={reset}
                className="px-4 py-2.5 rounded-lg hairline text-muted hover:text-ink transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
