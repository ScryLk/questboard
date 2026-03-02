import { createAnimations } from "@tamagui/animations-react-native";
import { createMedia } from "@tamagui/react-native-media-driver";
import { shorthands } from "@tamagui/shorthands";
import { tokens as defaultTokens } from "@tamagui/themes";
import { createFont, createTamagui, createTokens } from "tamagui";

const animations = createAnimations({
  fast: {
    type: "spring",
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    type: "spring",
    damping: 15,
    mass: 0.9,
    stiffness: 150,
  },
  slow: {
    type: "spring",
    damping: 20,
    stiffness: 60,
  },
  tooltip: {
    type: "spring",
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
});

const interFont = createFont({
  family: "Inter",
  size: {
    1: 10,
    2: 12,
    3: 13,
    4: 14,
    5: 16,
    6: 18,
    7: 20,
    8: 24,
    9: 30,
    10: 36,
    11: 40,
    12: 48,
  },
  lineHeight: {
    1: 14,
    2: 16,
    3: 18,
    4: 20,
    5: 22,
    6: 24,
    7: 28,
    8: 32,
    9: 38,
    10: 44,
    11: 48,
    12: 56,
  },
  weight: {
    4: "400",
    5: "500",
    6: "600",
    7: "700",
  },
  letterSpacing: {
    4: 0,
    5: 0,
    6: -0.2,
    7: -0.3,
    8: -0.5,
  },
});

const tokens = createTokens({
  ...defaultTokens,
  color: {
    ...defaultTokens.color,
    bg: "#0F0F12",
    bgCard: "#16161C",
    accent: "#6C5CE7",
    accentMuted: "rgba(108, 92, 231, 0.1)",
    border: "#2A2A35",
    textPrimary: "#E8E8ED",
    textSecondary: "#9090A0",
    textMuted: "#5A5A6E",
    success: "#00B894",
    successMuted: "rgba(0, 184, 148, 0.2)",
    danger: "#FF6B6B",
    dangerMuted: "rgba(255, 107, 107, 0.2)",
    warning: "#FDCB6E",
    warningMuted: "rgba(253, 203, 110, 0.2)",
    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",
    overlay: "rgba(0, 0, 0, 0.4)",
  },
});

const darkTheme = {
  background: tokens.color.bg,
  backgroundHover: tokens.color.bgCard,
  backgroundPress: tokens.color.bgCard,
  backgroundFocus: tokens.color.bgCard,
  backgroundStrong: tokens.color.bg,
  backgroundTransparent: tokens.color.transparent,

  color: tokens.color.textPrimary,
  colorHover: tokens.color.textPrimary,
  colorPress: tokens.color.textSecondary,
  colorFocus: tokens.color.textPrimary,
  colorTransparent: tokens.color.transparent,

  borderColor: tokens.color.border,
  borderColorHover: tokens.color.accent,
  borderColorFocus: tokens.color.accent,
  borderColorPress: tokens.color.border,

  placeholderColor: tokens.color.textMuted,

  // Semantic colors
  blue1: tokens.color.accent,
  blue2: tokens.color.accentMuted,
  red1: tokens.color.danger,
  red2: tokens.color.dangerMuted,
  green1: tokens.color.success,
  green2: tokens.color.successMuted,
  yellow1: tokens.color.warning,
  yellow2: tokens.color.warningMuted,

  // Shadows
  shadowColor: tokens.color.black,
  shadowColorHover: tokens.color.black,
};

const media = createMedia({
  sm: { maxWidth: 640 },
  md: { maxWidth: 768 },
  lg: { maxWidth: 1024 },
  xl: { maxWidth: 1280 },
  short: { maxHeight: 820 },
  tall: { minHeight: 820 },
  hoverNone: { hover: "none" },
  pointerCoarse: { pointer: "coarse" },
});

const config = createTamagui({
  defaultFont: "body",
  animations,
  shouldAddPrefersColorThemes: false,
  themeClassNameOnRoot: false,
  shorthands,
  fonts: {
    body: interFont,
    heading: interFont,
  },
  themes: {
    dark: darkTheme,
  },
  tokens,
  media,
});

export type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
