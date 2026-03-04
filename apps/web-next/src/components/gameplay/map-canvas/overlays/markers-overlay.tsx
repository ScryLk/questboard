"use client";

import {
  AlertTriangle,
  Flag,
  HelpCircle,
  Heart,
  Lock,
  Skull,
  Star,
} from "lucide-react";
import type { MapPin } from "@/lib/gameplay-mock-data";

const MARKER_ICONS = {
  flag: Flag,
  alert: AlertTriangle,
  question: HelpCircle,
  star: Star,
  skull: Skull,
  heart: Heart,
} as const;

interface MarkersOverlayProps {
  markers: MapPin[];
  scaledCell: number;
}

export function MarkersOverlay({ markers, scaledCell }: MarkersOverlayProps) {
  if (markers.length === 0) return null;

  return (
    <>
      {markers.map((marker) => {
        const Icon = MARKER_ICONS[marker.type];
        return (
          <div
            key={marker.id}
            className="pointer-events-auto absolute flex items-center justify-center"
            style={{
              left: marker.x * scaledCell,
              top: marker.y * scaledCell,
              width: scaledCell,
              height: scaledCell,
            }}
            title={marker.label || marker.type}
          >
            <Icon
              className="drop-shadow-md"
              style={{
                width: 16,
                height: 16,
                color: marker.color,
                opacity: marker.gmOnly ? 0.6 : 1,
              }}
            />
            {marker.gmOnly && (
              <Lock
                className="absolute text-brand-muted"
                style={{ width: 8, height: 8, top: 2, right: 2 }}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
