"use client";

import {
  Camera,
  RotateCcw,
  Ruler,
  Image,
  Maximize2,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";

export function QuickActions() {
  const setActiveTool = useGameplayStore((s) => s.setActiveTool);
  const setZoom = useGameplayStore((s) => s.setZoom);

  function handleResetCamera() {
    setZoom(100);
    // Scroll to center — the canvas component handles this via mapViewport
    useGameplayStore.setState({
      mapViewport: {
        ...useGameplayStore.getState().mapViewport,
        scrollLeft: 0,
        scrollTop: 0,
      },
    });
  }

  function handleMeasure() {
    setActiveTool("ruler");
  }

  function handleScreenshot() {
    // Trigger screenshot via canvas — simplified: capture the canvas element
    const canvas = document.querySelector("[data-map-canvas]");
    if (!canvas) return;

    // Use html2canvas approach or a simpler domtoimage
    // For now, we'll use the browser's built-in canvas capture if available
    try {
      const svgEl = canvas.querySelector("svg");
      if (svgEl) {
        const serializer = new XMLSerializer();
        const svgData = serializer.serializeToString(svgEl);
        const blob = new Blob([svgData], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "mapa.svg";
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
    } catch {
      // fallback: do nothing
    }

    // Simple fallback: take whole page screenshot hint
    useGameplayStore.getState().addToast("Use Ctrl+Shift+S para screenshot do mapa");
  }

  return (
    <div className="grid grid-cols-2 gap-1">
      <ActionButton
        icon={Camera}
        label="Screenshot"
        onClick={handleScreenshot}
      />
      <ActionButton
        icon={RotateCcw}
        label="Resetar Câmera"
        onClick={handleResetCamera}
      />
      <ActionButton
        icon={Ruler}
        label="Medir Distância"
        onClick={handleMeasure}
      />
      <ActionButton
        icon={Image}
        label="Background"
        onClick={() => {
          // Open a file picker for background image
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              useGameplayStore
                .getState()
                .setMapBackgroundImage(reader.result as string);
            };
            reader.readAsDataURL(file);
          };
          input.click();
        }}
      />
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1.5 text-[9px] text-brand-muted transition-colors hover:bg-white/[0.08] hover:text-brand-text"
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
