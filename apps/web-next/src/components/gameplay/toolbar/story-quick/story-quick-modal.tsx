"use client";

import { useEffect, useRef } from "react";
import { useNarrativeStore } from "@/stores/narrativeStore";
import { ProgressSection } from "./ProgressSection";
import { PhaseSelector } from "./PhaseSelector";
import { EventsList } from "./EventsList";
import { NextEventCard } from "./NextEventCard";

export function StoryQuickModal() {
  const isOpen = useNarrativeStore((s) => s.isStoryPanelOpen);
  const close = useNarrativeStore((s) => s.closeStoryPanel);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        close();
      }
    }

    // Delay to avoid closing immediately from the toggle click
    const id = requestAnimationFrame(() => {
      document.addEventListener("mousedown", handleClick);
    });

    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen, close]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute left-0 top-full z-50 mt-1 w-80 overflow-hidden rounded-lg border border-brand-border bg-[#111116] shadow-xl"
    >
      <ProgressSection />
      <div className="h-px bg-brand-border" />
      <PhaseSelector />
      <div className="h-px bg-brand-border" />
      <EventsList />
      <div className="h-px bg-brand-border" />
      <NextEventCard />
    </div>
  );
}
