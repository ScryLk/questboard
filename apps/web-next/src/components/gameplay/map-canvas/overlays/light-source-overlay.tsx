"use client";

import { Diamond, Droplets, Flame } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";

const LIGHT_ICONS: Record<string, typeof Flame> = {
  torch: Flame,
  campfire: Flame,
  crystal: Diamond,
  lava: Droplets,
};

const LIGHT_COLORS: Record<string, string> = {
  torch: "#FF9F43",
  campfire: "#FF6348",
  crystal: "#74B9FF",
  lava: "#FF4444",
};

interface LightSourceOverlayProps {
  scaledCell: number;
}

export function LightSourceOverlay({ scaledCell }: LightSourceOverlayProps) {
  const lightSources = useGameplayStore((s) => s.lightSources);

  if (lightSources.length === 0) return null;

  return (
    <>
      {lightSources.map((light) => {
        const Icon = LIGHT_ICONS[light.type] ?? Flame;
        const color = light.color || LIGHT_COLORS[light.type] || "#FF9F43";
        const iconSize = light.type === "campfire" ? 18 : 14;

        return (
          <div
            key={light.id}
            className="pointer-events-auto absolute flex items-center justify-center"
            style={{
              left: light.x * scaledCell,
              top: light.y * scaledCell,
              width: scaledCell,
              height: scaledCell,
            }}
            title={`${light.type} (${light.brightRadius}+${light.dimRadius}c)`}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: iconSize + 6,
                height: iconSize + 6,
                boxShadow: `0 0 8px ${color}40, 0 0 16px ${color}20`,
                animation: "lightPulse 3s ease-in-out infinite",
              }}
            >
              <Icon
                style={{
                  width: iconSize,
                  height: iconSize,
                  color,
                }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
