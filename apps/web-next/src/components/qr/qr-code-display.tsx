"use client";

import { useCallback, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Download, Maximize2 } from "lucide-react";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
  showCopy?: boolean;
  showDownload?: boolean;
  showFullscreen?: boolean;
  onFullscreen?: () => void;
  fileName?: string;
}

export function QRCodeDisplay({
  value,
  size = 200,
  label,
  showCopy = false,
  showDownload = false,
  showFullscreen = false,
  onFullscreen,
  fileName = "questboard-qr",
}: QRCodeDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const svg = container.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const exportSize = size * 2;
      canvas.width = exportSize;
      canvas.height = exportSize;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, exportSize, exportSize);
      ctx.drawImage(img, 0, 0, exportSize, exportSize);
      const link = document.createElement("a");
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, [size, fileName]);

  const handleCopy = useCallback(() => {
    const code = value.replace("https://questboard.app/join/", "");
    navigator.clipboard.writeText(code);
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code */}
      <div className="rounded-xl bg-white p-4" ref={containerRef} data-qr-container>
        {/* @ts-expect-error React 19 type mismatch with qrcode.react */}
        <QRCodeSVG
          value={value}
          size={size}
          bgColor="#FFFFFF"
          fgColor="#000000"
          level="M"
          includeMargin={false}
        />
      </div>

      {label && (
        <p className="text-sm text-brand-muted">{label}</p>
      )}

      {/* Action buttons */}
      {(showCopy || showDownload || showFullscreen) && (
        <div className="flex items-center gap-2">
          {showCopy && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-brand-border px-3 py-1.5 text-xs font-medium text-brand-text transition-colors hover:bg-brand-surface-light"
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar
            </button>
          )}
          {showDownload && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-brand-border px-3 py-1.5 text-xs font-medium text-brand-text transition-colors hover:bg-brand-surface-light"
            >
              <Download className="h-3.5 w-3.5" />
              Baixar QR
            </button>
          )}
          {showFullscreen && onFullscreen && (
            <button
              onClick={onFullscreen}
              className="flex items-center gap-1.5 rounded-lg border border-brand-border px-3 py-1.5 text-xs font-medium text-brand-text transition-colors hover:bg-brand-surface-light"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Ampliar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
