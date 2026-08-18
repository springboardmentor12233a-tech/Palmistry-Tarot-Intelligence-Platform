// Mounted once near the root. Provides the shared gradient that every
// .thread-line element (see index.css) references via url(#threadGradient).
export default function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <linearGradient id="threadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B8863E" />
          <stop offset="100%" stopColor="#6B1F3A" />
        </linearGradient>
      </defs>
    </svg>
  );
}
