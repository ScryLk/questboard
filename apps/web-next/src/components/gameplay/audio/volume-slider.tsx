"use client";

import { Volume2, VolumeX } from "lucide-react";

interface VolumeSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  muted?: boolean;
  onToggleMute?: () => void;
}

export function VolumeSlider({ label, value, onChange, muted, onToggleMute }: VolumeSliderProps) {
  return (
    <div className="flex items-center gap-1.5">
      {onToggleMute && (
        <button
          onClick={onToggleMute}
          className={`flex h-4 w-4 items-center justify-center rounded ${
            muted ? "text-red-400" : "text-brand-muted"
          } hover:text-brand-text`}
        >
          {muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
        </button>
      )}
      <span className="w-12 text-[9px] text-brand-muted">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(parseInt(e.target.value) / 100)}
        className="h-1 flex-1 accent-brand-accent"
        disabled={muted}
      />
      <span className="w-6 text-right text-[8px] tabular-nums text-brand-muted">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}
