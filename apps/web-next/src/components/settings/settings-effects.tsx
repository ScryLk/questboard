"use client";

// Aplica os settings do usuário no document: tema, accent color,
// fonte, motion reduzido, idioma. Monta na root layout (apps/web-next/
// src/app/layout.tsx) pra valer pra todas as rotas autenticadas.

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/settings-store";

const FONT_SIZE_PX: Record<string, string> = {
  small: "12px",
  normal: "14px",
  large: "16px",
  xlarge: "18px",
};

const FONT_FAMILY_VAR: Record<string, string> = {
  inter: "var(--font-inter), system-ui, sans-serif",
  system: "system-ui, -apple-system, sans-serif",
  mono: "ui-monospace, SFMono-Regular, monospace",
  serif: "Georgia, 'Times New Roman', serif",
};

export function SettingsEffects() {
  const appearance = useSettingsStore((s) => s.appearance);
  const language = useSettingsStore((s) => s.language);

  // ── Tema ─────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    const resolved =
      appearance.theme === "auto"
        ? window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark"
        : appearance.theme;

    root.dataset.theme = resolved;
    root.classList.toggle("theme-light", resolved === "light");
    root.classList.toggle("theme-amoled", resolved === "amoled");

    // Em AMOLED, força bg preto puro.
    root.style.setProperty(
      "--color-brand-primary",
      resolved === "amoled"
        ? "#000000"
        : resolved === "light"
          ? "#F8F8FB"
          : "#0A0A0F",
    );
  }, [appearance.theme]);

  // ── Accent color ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!appearance.accentColor) return;
    document.documentElement.style.setProperty(
      "--color-brand-accent",
      appearance.accentColor,
    );
  }, [appearance.accentColor]);

  // ── Font size + family ───────────────────────────────────────
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.fontSize = FONT_SIZE_PX[appearance.fontSize] ?? "14px";
    root.style.setProperty(
      "--font-family-base",
      FONT_FAMILY_VAR[appearance.fontFamily] ?? FONT_FAMILY_VAR.inter!,
    );
    // Aplica direto no body — algumas classes Tailwind herdam.
    document.body.style.fontFamily =
      FONT_FAMILY_VAR[appearance.fontFamily] ?? FONT_FAMILY_VAR.inter!;
  }, [appearance.fontSize, appearance.fontFamily]);

  // ── Border radius ────────────────────────────────────────────
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty(
      "--radius-base",
      `${appearance.borderRadius}px`,
    );
  }, [appearance.borderRadius]);

  // ── Reduced motion ───────────────────────────────────────────
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.reducedMotion = appearance.reducedMotion
      ? "true"
      : "false";
  }, [appearance.reducedMotion]);

  // ── Locale ───────────────────────────────────────────────────
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang =
      language.appLanguage === "en-US"
        ? "en"
        : language.appLanguage === "es"
          ? "es"
          : "pt-BR";
  }, [language.appLanguage]);

  return null;
}
