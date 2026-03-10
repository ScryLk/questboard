"use client";

import { useEffect, useMemo, useState } from "react";
import { usePlayerViewStore } from "@/lib/player-view-store";
import type { SceneCard, SceneCardStyle } from "@/lib/player-view-store";

interface SceneCardOverlayProps {
  scene: SceneCard;
}

// ── Style Config ─────────────────────────────────────────────

interface StyleConfig {
  accent: string;
  titleColor: string;
  backdrop: string;
  animation: string;
}

function getSceneStyle(style: SceneCardStyle): StyleConfig {
  switch (style) {
    case "cinematic":
      return { accent: "#FFD700", titleColor: "#FFFFFF", backdrop: "bg-black/80", animation: "sceneCardCinematic" };
    case "chapter":
      return { accent: "#6C5CE7", titleColor: "#E8E8ED", backdrop: "bg-black/75", animation: "sceneCardChapter" };
    case "location":
      return { accent: "#00B894", titleColor: "#E8E8ED", backdrop: "bg-black/70", animation: "sceneCardSlideUp" };
    case "mystery":
      return { accent: "#6C5CE7", titleColor: "#E8E8ED", backdrop: "bg-black/80", animation: "sceneCardMystery" };
    case "danger":
      return { accent: "#FF4757", titleColor: "#FF4757", backdrop: "bg-red-950/80", animation: "sceneCardDanger" };
    case "flashback":
      return { accent: "#C9A84C", titleColor: "#C8C0A8", backdrop: "bg-black/75", animation: "sceneCardFlashback" };
    case "weather":
      return { accent: "#74B9FF", titleColor: "#E8E8ED", backdrop: "bg-black/70", animation: "sceneCardSlideUp" };
    default:
      return { accent: "#6C5CE7", titleColor: "#E8E8ED", backdrop: "bg-black/70", animation: "sceneCardCinematic" };
  }
}

// ── Progress Bar ─────────────────────────────────────────────

function ProgressBar({ duration, color }: { duration: number; color: string }) {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[3px]">
      <div
        className="h-full"
        style={{
          backgroundColor: color,
          animation: `progressShrink ${duration}ms linear forwards`,
        }}
      />
    </div>
  );
}

// ── Mystery Typewriter ───────────────────────────────────────

function TypewriterText({ text, color }: { text: string; color: string }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <h1
      className="text-4xl font-bold tracking-wide md:text-5xl"
      style={{ color, opacity: 0.7 }}
    >
      {displayed}
      <span className="animate-pulse">|</span>
    </h1>
  );
}

// ── Main Component ───────────────────────────────────────────

export function SceneCardOverlay({ scene }: SceneCardOverlayProps) {
  const setActiveScene = usePlayerViewStore((s) => s.setActiveScene);
  const styleConfig = useMemo(() => getSceneStyle(scene.style), [scene.style]);

  // Auto-dismiss after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveScene(null);
    }, scene.duration || 6000);
    return () => clearTimeout(timer);
  }, [scene, setActiveScene]);

  const handleDismiss = () => setActiveScene(null);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={handleDismiss}
      style={{ cursor: "pointer" }}
    >
      {/* Backdrop */}
      <div className={`absolute inset-0 backdrop-blur-sm ${styleConfig.backdrop}`} />

      {/* Tint overlay */}
      {scene.style === "danger" && (
        <div className="absolute inset-0 animate-pulse bg-red-900/20" />
      )}
      {scene.style === "flashback" && (
        <div className="absolute inset-0 bg-[rgba(139,105,20,0.06)]" />
      )}

      {/* Cinematic letterbox bars */}
      {scene.style === "cinematic" && (
        <>
          <div
            className="absolute inset-x-0 top-0 bg-black"
            style={{ height: "12%", animation: "letterboxIn 0.8s ease-out forwards" }}
          />
          <div
            className="absolute inset-x-0 bottom-0 bg-black"
            style={{ height: "12%", animation: "letterboxIn 0.8s ease-out forwards" }}
          />
        </>
      )}

      {/* Content */}
      <div
        className="relative z-10 max-w-2xl px-8 text-center"
        style={{ animation: `${styleConfig.animation} 0.6s ease-out forwards` }}
      >
        {/* Top decorative line */}
        {(scene.style === "cinematic" || scene.style === "chapter") && (
          <div
            className="mx-auto mb-6 h-[1px] w-24"
            style={{
              backgroundColor: styleConfig.accent,
              animation: scene.style === "chapter" ? "lineExpand 0.8s ease-out 0.3s forwards" : undefined,
              width: scene.style === "chapter" ? 0 : undefined,
            }}
          />
        )}

        {/* Chapter label */}
        {scene.style === "chapter" && scene.chapter && (
          <p
            className="mb-1 text-[10px] font-semibold uppercase tracking-[3px] text-brand-muted"
            style={{ animation: "fadeIn 0.6s ease-out 0.5s both" }}
          >
            {scene.chapter}
          </p>
        )}

        {/* Subtitle (top position for cinematic/chapter) */}
        {scene.subtitle && (scene.style === "cinematic" || scene.style === "chapter") && (
          <p
            className="mb-2 text-xs font-medium uppercase tracking-[0.3em]"
            style={{
              color: styleConfig.accent,
              animation: "fadeIn 0.5s ease-out 0.4s both",
            }}
          >
            {scene.subtitle}
          </p>
        )}

        {/* Danger icon */}
        {scene.style === "danger" && (
          <div
            className="mb-4 flex justify-center"
            style={{ animation: "dangerPop 0.3s ease-out forwards" }}
          >
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="#FF4757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
        )}

        {/* Title */}
        {scene.style === "mystery" ? (
          <TypewriterText text={scene.title} color={styleConfig.titleColor} />
        ) : (
          <h1
            className="text-4xl font-bold tracking-wide md:text-5xl"
            style={{
              color: styleConfig.titleColor,
              textTransform: scene.style === "danger" || scene.style === "weather" ? "uppercase" : undefined,
              fontStyle: scene.style === "flashback" ? "italic" : undefined,
              fontWeight: scene.style === "danger" ? 900 : 700,
            }}
          >
            {scene.title}
          </h1>
        )}

        {/* Subtitle (below title for other types) */}
        {scene.subtitle && scene.style !== "cinematic" && scene.style !== "chapter" && (
          <p
            className="mt-3 text-sm"
            style={{
              color: scene.style === "flashback" ? "#8A8A7A" : "#9090A0",
              fontStyle: scene.style === "flashback" ? "italic" : undefined,
              opacity: scene.style === "mystery" ? 0.4 : 0.8,
              animation: "fadeIn 0.5s ease-out 0.6s both",
            }}
          >
            {scene.subtitle}
          </p>
        )}

        {/* Description */}
        {scene.description && (
          <p
            className="mt-4 text-base leading-relaxed text-brand-text/70 md:text-lg"
            style={{ animation: "fadeIn 0.5s ease-out 0.8s both" }}
          >
            {scene.description}
          </p>
        )}

        {/* Tags */}
        {scene.tags && scene.tags.length > 0 && (
          <div
            className="mt-4 flex flex-wrap justify-center gap-2"
            style={{ animation: "fadeIn 0.5s ease-out 0.8s both" }}
          >
            {scene.tags.map((tag, i) => (
              <span
                key={i}
                className="rounded-md border px-2 py-0.5 text-[10px] font-medium"
                style={{
                  borderColor: `${styleConfig.accent}40`,
                  color: styleConfig.accent,
                  backgroundColor: `${styleConfig.accent}10`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom decorative line */}
        {(scene.style === "cinematic" || scene.style === "chapter") && (
          <div
            className="mx-auto mt-6 h-[1px] w-24"
            style={{
              backgroundColor: styleConfig.accent,
              animation: scene.style === "chapter" ? "lineExpand 0.8s ease-out 0.5s forwards" : undefined,
              width: scene.style === "chapter" ? 0 : undefined,
            }}
          />
        )}

        {/* Dismiss hint */}
        <p
          className="mt-8 text-[10px] uppercase tracking-widest text-brand-muted/40"
          style={{ animation: "fadeIn 0.5s ease-out 1s both" }}
        >
          Clique para fechar
        </p>
      </div>

      {/* Danger pulsing border */}
      {scene.style === "danger" && (
        <div className="pointer-events-none absolute inset-4 animate-pulse rounded-xl border-2 border-red-500/40" />
      )}

      {/* Progress bar */}
      <ProgressBar duration={scene.duration || 6000} color={styleConfig.accent} />

      {/* CSS animations */}
      <style jsx>{`
        @keyframes sceneCardCinematic {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes sceneCardChapter {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sceneCardSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sceneCardMystery {
          from { opacity: 0; filter: blur(8px); }
          to { opacity: 1; filter: blur(0); }
        }
        @keyframes sceneCardDanger {
          0% { opacity: 0; transform: scale(1.3); }
          50% { opacity: 1; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes sceneCardFlashback {
          0% { opacity: 0; }
          20% { opacity: 0.6; }
          40% { opacity: 0.2; }
          60% { opacity: 0.8; }
          80% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        @keyframes letterboxIn {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes lineExpand {
          from { width: 0; }
          to { width: 96px; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes dangerPop {
          0% { transform: scale(0); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes progressShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
