// QuestBoard Design System — Color Tokens

export const colors = {
  // Backgrounds (surface layers)
  bg: {
    base: "#0F0F12",
    surface: "#16161C",
    elevated: "#1C1C24",
    hover: "#22222C",
    active: "#2A2A36",
  },

  // Accent (primary action)
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
  text: {
    primary: "#E8E8ED",
    secondary: "#9090A0",
    muted: "#5A5A6E",
    inverse: "#0F0F12",
  },

  // Borders
  border: {
    default: "#2A2A36",
    hover: "#3A3A48",
    accent: "rgba(108,92,231,0.25)",
  },

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
} as const;
