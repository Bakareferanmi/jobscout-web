import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0B0F",
        surface: "#14151C",
        elevated: "#1E2029",
        border: "#2A2D38",
        text: "#F2F4F8",
        muted: "#9AA0AE",
        primary: "#5B6BFF",
        success: "#2BE08C",
        warning: "#F5D547",
        info: "#3DD7E5",
        error: "#FF3A5C",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
    },
  },
  plugins: [],
} satisfies Config;

