export default function Logo({ size = 28, dark = false }) {
  const color = dark ? "#D9B876" : "#B8863E";
  const rays = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {rays.map((deg) => (
        <line
          key={deg}
          x1="20"
          y1="20"
          x2="20"
          y2="4"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.55"
          transform={`rotate(${deg} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="9" fill={dark ? "#33101E" : "#FBF6EC"} stroke={color} strokeWidth="1.2" />
      <path
        d="M23.5 14.5a6.2 6.2 0 1 0 0 11 7.4 7.4 0 0 1 0-11z"
        fill={color}
      />
    </svg>
  );
}
