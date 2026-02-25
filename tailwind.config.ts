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
        // Backgrounds
        base: "#0F0F12",
        surface: "#16161C",
        elevated: "#1C1C24",
        hover: "#22222C",
        active: "#2A2A36",

        // Accent
        accent: {
          DEFAULT: "#6C5CE7",
          hover: "#7B6EF6",
          muted: "rgba(108,92,231,0.12)",
          glow: "rgba(108,92,231,0.25)",
        },

        // Secondary
        secondary: {
          DEFAULT: "#00B894",
          hover: "#00D2A8",
        },

        // Text
        "text-primary": "#E8E8ED",
        "text-secondary": "#9090A0",
        "text-muted": "#5A5A6E",
        "text-inverse": "#0F0F12",

        // Borders
        "border-default": "#2A2A36",
        "border-hover": "#3A3A48",
        "border-accent": "rgba(108,92,231,0.25)",

        // Feedback
        success: "#00B894",
        warning: "#FDCB6E",
        error: "#FF6B6B",
        info: "#74B9FF",

        // RPG Specials
        gold: {
          DEFAULT: "#F9CA24",
          glow: "rgba(249,202,36,0.19)",
        },
        legendary: "#E17055",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        body: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.3)",
        md: "0 4px 12px rgba(0,0,0,0.4)",
        lg: "0 8px 24px rgba(0,0,0,0.5)",
        glow: "0 0 20px rgba(108,92,231,0.15)",
        "glow-gold": "0 0 20px rgba(249,202,36,0.15)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "400ms",
      },
      transitionTimingFunction: {
        "ease-out-custom": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      animation: {
        "fade-in": "fadeIn 250ms ease-out",
        "slide-up": "slideUp 250ms ease-out",
        "scale-in": "scaleIn 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  presets: [nativewind],
} satisfies Config;
