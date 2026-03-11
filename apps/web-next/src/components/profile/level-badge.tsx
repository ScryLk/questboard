"use client";

import { getLevelTier, LEVEL_TIER_COLORS } from "@/lib/profile-level";

interface LevelBadgeProps {
  level: number;
  /** XP progress within current level, 0–100 */
  progressPercent: number;
  size?: "sm" | "md";
}

export function LevelBadge({ level, progressPercent, size = "md" }: LevelBadgeProps) {
  const tier = getLevelTier(level);
  const colors = LEVEL_TIER_COLORS[tier];
  const dim = size === "sm" ? 32 : 44;
  const stroke = size === "sm" ? 3 : 4;
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progressPercent / 100);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: dim, height: dim }}
    >
      {/* Background circle */}
      <svg className="absolute inset-0" width={dim} height={dim}>
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill={colors.bg}
          stroke={colors.border}
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke={colors.text}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
          className="transition-all duration-500"
        />
      </svg>

      {/* Level number */}
      <span
        className={`relative z-10 font-bold ${size === "sm" ? "text-xs" : "text-sm"}`}
        style={{ color: colors.text }}
      >
        {level}
      </span>
    </div>
  );
}
