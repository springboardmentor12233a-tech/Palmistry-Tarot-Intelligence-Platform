import { Link } from "react-router-dom";
import Markdown from "../lib/markdown.jsx";
import api, { fileUrl } from "../lib/api.js";

export default function ReportView({ reading, showImages = true, showChatLink = true }) {
  if (!reading) return null;

  async function downloadPdf() {
    const res = await api.get(`/reports/${reading.id}/pdf`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reading.type}-reading-${reading.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const LABELS = { original: "Your Photo" };
  const images = reading.images || {};
  const imageEntries = Object.entries(images).filter(([, url]) => url);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-mono text-teal uppercase tracking-widest mb-1">
            {reading.type} reading
          </p>
          <h2 className="font-display text-2xl text-ivory">{reading.title}</h2>
        </div>
        <div className="flex gap-2">
          {showChatLink && (
            <Link
              to={`/chat/${reading.id}`}
              className="px-4 py-2 text-sm rounded-lg hairline text-violet-soft hover:bg-surface-raised transition-colors"
            >
              Ask about this reading
            </Link>
          )}
          <button
            onClick={downloadPdf}
            className="px-4 py-2 text-sm rounded-lg bg-gold/90 text-ink font-medium hover:bg-gold transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>

      {showImages && imageEntries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md">
          {imageEntries.map(([label, url]) => (
            <div key={label} className="hairline rounded-lg overflow-hidden bg-surface">
              <img src={fileUrl(url)} alt={label} className="w-full aspect-square object-cover" />
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted text-center py-1.5">
                {LABELS[label] || label}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="hairline rounded-xl bg-surface p-6 md:p-8">
        <Markdown text={reading.result_markdown} />
      </div>
    </div>
  );
}
