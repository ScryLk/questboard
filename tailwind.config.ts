import type { Config } from "tailwindcss";
import nativewind from "nativewind/preset";

export default {
  content: [
    "./apps/web/src/**/*.{ts,tsx}",
    "./apps/mobile/src/**/*.{ts,tsx}",
    "./packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1A1A2E",
          accent: "#E94560",
          secondary: "#0F3460",
          surface: "#16213E",
          muted: "#533483",
        },
        surface: {
          DEFAULT: "#1A1A2E",
          light: "#16213E",
          dark: "#0F0F1A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Cinzel", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "12px",
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)",
        glow: "0 0 15px rgba(233, 69, 96, 0.3)",
      },
    },
  },
  presets: [nativewind],
} satisfies Config;
