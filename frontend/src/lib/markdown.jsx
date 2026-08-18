// Minimal markdown renderer covering what the AI reports actually use:
// #, ## headings, "- " bullet lists, **bold**, and paragraphs.
// Deliberately small and dependency-free rather than pulling in a full parser.

function inline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function Markdown({ text }) {
  if (!text) return null;
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let listBuffer = [];

  const flushList = (key) => {
    if (listBuffer.length) {
      blocks.push(
        <ul key={`ul-${key}`}>
          {listBuffer.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) {
      flushList(idx);
      return;
    }
    if (line.startsWith("### ")) {
      flushList(idx);
      blocks.push(<h3 key={idx}>{inline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      flushList(idx);
      blocks.push(<h2 key={idx}>{inline(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      flushList(idx);
      blocks.push(<h1 key={idx}>{inline(line.slice(2))}</h1>);
    } else if (/^[-*]\s+/.test(line)) {
      listBuffer.push(line.replace(/^[-*]\s+/, ""));
    } else {
      flushList(idx);
      blocks.push(<p key={idx}>{inline(line)}</p>);
    }
  });
  flushList("end");

  return <div className="markdown-body">{blocks}</div>;
}
