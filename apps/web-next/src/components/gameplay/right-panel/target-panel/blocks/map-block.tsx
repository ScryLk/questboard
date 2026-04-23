"use client";

import { Crosshair, MapPin } from "lucide-react";
import type { GameToken } from "@/lib/gameplay-mock-data";
import { useCameraStore } from "@/lib/camera-store";
import { Block } from "../block";

interface MapBlockProps {
  token: GameToken;
}

export function MapBlock({ token }: MapBlockProps) {
  function handleFocus() {
    // Aproveitamos o tween easeOutCubic já implementado no camera-store
    // (centerOnCell anima por 400ms). Usa o centro da célula do token.
    useCameraStore.getState().centerOnCell(token.x, token.y);
  }

  return (
    <Block id="map" icon={MapPin} title="No Mapa">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-brand-muted">Posição</span>
        <span className="font-semibold tabular-nums text-brand-text">
          ({token.x}, {token.y})
        </span>
      </div>
      <button
        onClick={handleFocus}
        className="mt-2 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-brand-border py-1.5 text-[11px] text-brand-muted transition-colors hover:border-brand-accent/40 hover:bg-brand-accent/5 hover:text-brand-text"
      >
        <Crosshair className="h-3 w-3" />
        Focar Câmera
      </button>
    </Block>
  );
}
