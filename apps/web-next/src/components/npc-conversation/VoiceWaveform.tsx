"use client";

import { useEffect, useRef } from "react";

interface VoiceWaveformProps {
  rmsLevel: number;
  isActive: boolean;
}

const BAR_COUNT = 24;
const MIN_HEIGHT = 3;
const MAX_HEIGHT = 28;

export function VoiceWaveform({ rmsLevel, isActive }: VoiceWaveformProps) {
  const barsRef = useRef<number[]>(Array(BAR_COUNT).fill(MIN_HEIGHT));
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) {
      barsRef.current = Array(BAR_COUNT).fill(MIN_HEIGHT);
      return;
    }

    const animate = () => {
      const amplified = Math.min(1, rmsLevel * 8);
      barsRef.current = barsRef.current.map((prev, i) => {
        const centerDist = Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2);
        const variation = Math.sin(Date.now() / 80 + i * 0.7) * 0.3 + 0.7;
        const target =
          MIN_HEIGHT +
          (MAX_HEIGHT - MIN_HEIGHT) *
            amplified *
            (1 - centerDist * 0.4) *
            variation;
        return prev + (target - prev) * 0.3;
      });

      if (containerRef.current) {
        const bars = containerRef.current.children;
        for (let i = 0; i < bars.length; i++) {
          (bars[i] as HTMLElement).style.height = `${barsRef.current[i]}px`;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, rmsLevel]);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center gap-[3px]"
      style={{ height: MAX_HEIGHT + 4 }}
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <div
          key={i}
          className="rounded-full transition-colors"
          style={{
            width: 3,
            height: MIN_HEIGHT,
            backgroundColor: isActive
              ? `rgba(255, 68, 68, ${0.5 + (1 - Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2)) * 0.5})`
              : "rgba(255,255,255,0.1)",
          }}
        />
      ))}
    </div>
  );
}
