"use client";

import type { VoiceState } from "@/lib/npc-conversation-types";

interface RecordingRingProps {
  voiceState: VoiceState;
  size: number;
  children: React.ReactNode;
  portraitColor: string;
  isAI: boolean;
}

export function RecordingRing({
  voiceState,
  size,
  children,
  portraitColor,
  isAI,
}: RecordingRingProps) {
  const ringColor =
    voiceState === "recording"
      ? "#FF4444"
      : voiceState === "processing"
        ? "#E17055"
        : isAI
          ? "#7c5cfc"
          : "#FDCB6E";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {voiceState !== "idle" && (
        <div
          className="absolute inset-[-4px] rounded-full"
          style={{
            border: `3px solid ${ringColor}`,
            animation:
              voiceState === "recording"
                ? "pulse 1.5s ease-in-out infinite"
                : "pulse 2s ease-in-out infinite",
            opacity: voiceState === "recording" ? 1 : 0.7,
          }}
        />
      )}
      <div
        className="flex items-center justify-center rounded-full text-lg font-bold text-white ring-2"
        style={{
          width: size,
          height: size,
          backgroundColor: portraitColor + "40",
          ringColor,
        }}
      >
        {children}
      </div>
    </div>
  );
}
