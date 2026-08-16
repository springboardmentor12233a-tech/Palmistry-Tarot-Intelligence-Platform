import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      title={isLight ? "Switch to dark theme" : "Switch to light theme"}
    >
      <span className="theme-toggle-thumb">{isLight ? "☀️" : "🌙"}</span>
    </button>
  );
}

export default ThemeToggle;
