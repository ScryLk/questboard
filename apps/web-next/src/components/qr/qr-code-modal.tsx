"use client";

import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  value: string;
  title?: string;
  subtitle?: string;
  code?: string;
}

export function QRCodeModal({
  open,
  onClose,
  value,
  title,
  subtitle,
  code,
}: QRCodeModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-primary/95"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 rounded-lg p-2 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
      >
        <X className="h-6 w-6" />
      </button>

      <div
        className="flex flex-col items-center gap-8"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-brand-text">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-brand-muted">{subtitle}</p>
            )}
          </div>
        )}

        <div className="rounded-2xl bg-white p-6">
          {/* @ts-expect-error React 19 type mismatch with qrcode.react */}
          <QRCodeSVG
            value={value}
            size={400}
            bgColor="#FFFFFF"
            fgColor="#000000"
            level="M"
            includeMargin={false}
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-brand-muted">Escaneie para entrar</p>
          <p className="mt-1 text-xs text-brand-muted/60">
            {value.replace("https://", "")}
          </p>
          {code && (
            <p className="mt-3 font-mono text-2xl font-bold tracking-[0.3em] text-brand-text">
              {code}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
