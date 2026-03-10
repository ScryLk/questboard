"use client";

import { getCosmeticById } from "@/constants/cosmetics";
import type { EquippedCosmetics } from "@/types/profile";
import { AvatarFrame } from "./avatar-frame";

interface CosmeticPreviewProps {
  equipped: EquippedCosmetics;
  displayName: string;
  avatarUrl?: string;
}

export function CosmeticPreview({ equipped, displayName, avatarUrl }: CosmeticPreviewProps) {
  const title = equipped.titleId ? getCosmeticById(equipped.titleId) : null;
  const banner = equipped.bannerId ? getCosmeticById(equipped.bannerId) : null;

  return (
    <div className="flex items-center gap-4">
      {/* Mini avatar with frame */}
      <AvatarFrame
        src={avatarUrl}
        fallbackInitials={displayName}
        frameId={equipped.frameId}
        size="lg"
      />

      <div className="space-y-2">
        {/* Title preview */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-brand-muted">Título:</span>
          {title ? (
            <span className="text-xs font-medium" style={title.cssStyle}>
              {title.name}
            </span>
          ) : (
            <span className="text-xs text-brand-muted/50">Nenhum</span>
          )}
        </div>

        {/* Banner swatch */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-brand-muted">Banner:</span>
          {banner ? (
            <div
              className="h-4 w-20 rounded"
              style={banner.cssStyle}
            />
          ) : (
            <span className="text-xs text-brand-muted/50">Padrão</span>
          )}
        </div>
      </div>
    </div>
  );
}
