"use client";

import { getCosmeticById } from "@/constants/cosmetics";

const SIZES = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
} as const;

const TEXT_SIZES = {
  sm: "text-xs",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-3xl",
} as const;

interface AvatarFrameProps {
  src?: string;
  fallbackInitials: string;
  frameId?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}

export function AvatarFrame({
  src,
  fallbackInitials,
  frameId,
  size = "md",
  className = "",
}: AvatarFrameProps) {
  const frame = frameId ? getCosmeticById(frameId) : null;
  const frameClass = frame?.cssClass ?? "";

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full ${SIZES[size]} ${frameClass} ${className}`}
    >
      {/* Frame ring */}
      <div className="absolute inset-[-3px] rounded-full border-2 border-white/10" />

      {/* Avatar */}
      {src ? (
        <img
          src={src}
          alt={fallbackInitials}
          className={`rounded-full object-cover ${SIZES[size]}`}
        />
      ) : (
        <div
          className={`flex items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent ${SIZES[size]} ${TEXT_SIZES[size]} font-bold`}
        >
          {fallbackInitials.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}
