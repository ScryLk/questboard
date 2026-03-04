"use client";

import { Lock, StickyNote } from "lucide-react";
import type { MapNote, NoteColor } from "@/lib/gameplay-mock-data";

const NOTE_COLORS: Record<NoteColor, string> = {
  yellow: "#FDCB6E",
  blue: "#4488FF",
  green: "#00B894",
  pink: "#FF6B6B",
};

interface NotesOverlayProps {
  notes: MapNote[];
  scaledCell: number;
}

export function NotesOverlay({ notes, scaledCell }: NotesOverlayProps) {
  if (notes.length === 0) return null;

  return (
    <>
      {notes.map((note) => (
        <div
          key={note.id}
          className="pointer-events-auto absolute flex items-center justify-center"
          style={{
            left: note.x * scaledCell,
            top: note.y * scaledCell,
            width: scaledCell,
            height: scaledCell,
          }}
          title={note.text.length > 80 ? note.text.slice(0, 80) + "..." : note.text}
        >
          <StickyNote
            className="drop-shadow-md"
            style={{
              width: 14,
              height: 14,
              color: NOTE_COLORS[note.color],
              opacity: note.gmOnly ? 0.6 : 1,
            }}
          />
          {note.gmOnly && (
            <Lock
              className="absolute text-brand-muted"
              style={{ width: 8, height: 8, top: 2, right: 2 }}
            />
          )}
        </div>
      ))}
    </>
  );
}
