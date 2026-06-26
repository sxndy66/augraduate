import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "bg-base": "#0A0A0F",
        "bg-surface": "#12121A",
        "bg-elevated": "#1A1A26",
        border: "#2A2A3D",
        primary: "#6C63FF",
        accent: "#00D4AA",
        danger: "#FF4757",
        warning: "#FFB347",
        "text-primary": "#E8E8F0",
        "text-muted": "#6B6B80",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
    },
  },
  plugins: [],
};

export default config;
