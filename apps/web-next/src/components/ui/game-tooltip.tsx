"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface GameTooltipProps {
  label: string;
  description?: string;
  shortcut?: string;
  side?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

const SHOW_DELAY_MS = 400;
const GAP = 8;

export function GameTooltip({
  label,
  description,
  shortcut,
  side = "bottom",
  children,
}: GameTooltipProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    let x = 0;
    let y = 0;
    if (side === "bottom") {
      x = rect.left + rect.width / 2;
      y = rect.bottom + GAP;
    } else if (side === "top") {
      x = rect.left + rect.width / 2;
      y = rect.top - GAP;
    } else if (side === "left") {
      x = rect.left - GAP;
      y = rect.top + rect.height / 2;
    } else {
      x = rect.right + GAP;
      y = rect.top + rect.height / 2;
    }
    setPos({ x, y });
  }, [open, side]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleEnter() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
  }

  function handleLeave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  }

  const transform =
    side === "bottom"
      ? "translate(-50%, 0)"
      : side === "top"
        ? "translate(-50%, -100%)"
        : side === "left"
          ? "translate(-100%, -50%)"
          : "translate(0, -50%)";

  return (
    <div
      ref={wrapperRef}
      className="inline-flex"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[999] whitespace-nowrap rounded-lg border border-[#2A2A3A] bg-[#1C1C28] px-3 py-2 shadow-xl"
            style={{ left: pos.x, top: pos.y, transform }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-white">
                {label}
              </span>
              {shortcut && (
                <span className="rounded bg-[#2A2A3A] px-1.5 py-0.5 font-mono text-[11px] text-[#9B9BAF]">
                  {shortcut}
                </span>
              )}
            </div>
            {description && (
              <p className="mt-0.5 max-w-[200px] whitespace-normal text-[12px] text-[#6B6B7E]">
                {description}
              </p>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
