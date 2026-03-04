"use client";

import { useEffect } from "react";
import { usePlayerViewStore } from "@/lib/player-view-store";
import type { SceneCard } from "@/lib/player-view-store";

interface SceneCardOverlayProps {
  scene: SceneCard;
}

export function SceneCardOverlay({ scene }: SceneCardOverlayProps) {
  const setActiveScene = usePlayerViewStore((s) => s.setActiveScene);

  // Auto-dismiss after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveScene(null);
    }, scene.duration || 6000);
    return () => clearTimeout(timer);
  }, [scene, setActiveScene]);

  const handleDismiss = () => setActiveScene(null);

  const styleConfig = getSceneStyle(scene.style);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={handleDismiss}
      style={{ cursor: "pointer" }}
    >
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Content */}
      <div
        className="relative z-10 max-w-2xl px-8 text-center"
        style={{
          animation: "sceneCardIn 0.6s ease-out forwards",
        }}
      >
        {/* Top decorative line */}
        <div
          className="mx-auto mb-6 h-[1px] w-24"
          style={{ backgroundColor: styleConfig.accent }}
        />

        {/* Subtitle */}
        {scene.subtitle && (
          <p
            className="mb-2 text-xs font-medium uppercase tracking-[0.3em]"
            style={{ color: styleConfig.accent }}
          >
            {scene.subtitle}
          </p>
        )}

        {/* Title */}
        <h1
          className="text-4xl font-bold tracking-wide md:text-5xl"
          style={{ color: styleConfig.titleColor }}
        >
          {scene.title}
        </h1>

        {/* Description */}
        {scene.description && (
          <p className="mt-4 text-base leading-relaxed text-brand-text/70 md:text-lg">
            {scene.description}
          </p>
        )}

        {/* Bottom decorative line */}
        <div
          className="mx-auto mt-6 h-[1px] w-24"
          style={{ backgroundColor: styleConfig.accent }}
        />

        {/* Dismiss hint */}
        <p className="mt-8 text-[10px] uppercase tracking-widest text-brand-muted/40">
          Clique para fechar
        </p>
      </div>

      {/* CSS animation */}
      <style jsx>{`
        @keyframes sceneCardIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

function getSceneStyle(style: SceneCard["style"]) {
  switch (style) {
    case "cinematic":
      return {
        accent: "#FFD700",
        titleColor: "#FFFFFF",
      };
    case "chapter":
      return {
        accent: "#6C5CE7",
        titleColor: "#E8E8ED",
      };
    case "location":
      return {
        accent: "#00B894",
        titleColor: "#E8E8ED",
      };
    default:
      return {
        accent: "#6C5CE7",
        titleColor: "#E8E8ED",
      };
  }
}
