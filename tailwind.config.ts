import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0D12",
        surface: "#151822",
        elevated: "#1C2029",
        border: "#262B38",
        text: "#F5F7FA",
        muted: "#8B93A7",
        primary: "#4F6BFF",
        "primary-hover": "#3D57E8",
        success: "#22C55E",
        warning: "#F5B942",
        info: "#3DD7E5",
        error: "#F4455C",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
    },
  },
  plugins: [],
} satisfies Config;
