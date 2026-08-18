/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // page/app background - warm parchment cream
        cream: {
          DEFAULT: "#FBF6EC",
          soft: "#F3EAD6",
        },
        // dark maroon - sidebar, primary buttons, dark decorative panels, primary text
        ink: {
          DEFAULT: "#33101E",
          soft: "#421729",
          deep: "#210A14",
        },
        // card/panel backgrounds on the light side
        surface: {
          DEFAULT: "#FFFDF8",
          raised: "#F6EAD3",
        },
        gold: {
          DEFAULT: "#B8863E",
          soft: "#D9B876",
          dim: "#8A6A34",
        },
        // secondary maroon/wine accent (was violet)
        violet: {
          DEFAULT: "#6B1F3A",
          soft: "#8B3A52",
          dim: "#4A1428",
        },
        // muted bronze accent for small labels (was teal)
        teal: {
          DEFAULT: "#8C6A3F",
          dim: "#6B5029",
        },
        // primary readable text - deep maroon-brown
        ivory: "#2A160F",
        muted: "#8A7B6C",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 50px -18px rgba(184, 134, 62, 0.45)",
        violetGlow: "0 0 50px -18px rgba(107, 31, 58, 0.35)",
      },
      backgroundImage: {
        "radial-fade": "radial-gradient(circle at 50% 0%, rgba(184,134,62,0.10), transparent 60%)",
      },
      keyframes: {
        pulseLine: {
          "0%, 100%": { opacity: 0.25 },
          "50%": { opacity: 1 },
        },
        floatUp: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        drawIn: {
          "0%": { strokeDashoffset: 400 },
          "100%": { strokeDashoffset: 0 },
        },
      },
      animation: {
        pulseLine: "pulseLine 2.4s ease-in-out infinite",
        floatUp: "floatUp 0.5s ease-out both",
        drawIn: "drawIn 1.8s ease-out forwards",
      },
    },
  },
  plugins: [],
};
