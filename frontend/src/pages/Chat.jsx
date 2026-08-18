import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import Markdown from "../lib/markdown.jsx";
import api from "../lib/api.js";

export default function Chat() {
  const { readingId } = useParams();
  const [reading, setReading] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get(`/reports/${readingId}`).then((res) => setReading(res.data));
    api.get(`/chat/${readingId}`).then((res) => setMessages(res.data));
  }, [readingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    setMessages((m) => [...m, { id: `tmp-${Date.now()}`, role: "user", content: text, created_at: new Date().toISOString() }]);
    try {
      const res = await api.post(`/chat/${readingId}`, { message: text });
      setMessages((m) => [...m, res.data]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "I couldn't reply just now — please try again.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <Layout eyebrow="Chat" title="Ask About This Reading">
      <Link
        to={`/reading/${readingId}`}
        className="text-sm text-muted hover:text-gold transition-colors -mt-4 mb-6 block"
      >
        ← Back to {reading?.title || "reading"}
      </Link>

      <div className="hairline rounded-2xl bg-surface flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <p className="text-sm text-muted text-center pt-10">
              Ask something like "what does my Heart line suggest about relationships?"
            </p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-ink text-cream"
                    : "hairline bg-surface-raised text-ivory"
                }`}
              >
                {m.role === "user" ? m.content : <Markdown text={m.content} />}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="hairline bg-surface-raised rounded-xl px-4 py-2.5 text-sm text-muted">
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="border-t border-gold/15 p-4 flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this reading..."
            className="flex-1 bg-surface-raised hairline rounded-lg px-3.5 py-2.5 text-sm text-ivory outline-none focus:border-gold/60"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-5 py-2.5 rounded-lg bg-ink text-cream text-sm font-medium hover:bg-ink-soft transition-colors disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </Layout>
  );
}
