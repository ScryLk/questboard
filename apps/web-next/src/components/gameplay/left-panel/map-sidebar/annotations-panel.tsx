"use client";

import { StickyNote, MapPin, Eye, EyeOff, Trash2 } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useMapSidebarStore } from "@/lib/map-sidebar-store";

export function AnnotationsPanel() {
  const markers = useGameplayStore((s) => s.markers);
  const notes = useGameplayStore((s) => s.notes);
  const removeMarker = useGameplayStore((s) => s.removeMarker);
  const removeNote = useGameplayStore((s) => s.removeNote);

  const showGMNotes = useMapSidebarStore((s) => s.showGMNotes);
  const showMarkers = useMapSidebarStore((s) => s.showMarkers);
  const toggleGMNotes = useMapSidebarStore((s) => s.toggleGMNotes);
  const toggleMarkers = useMapSidebarStore((s) => s.toggleMarkers);

  return (
    <div className="space-y-2">
      {/* Notes */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[9px] text-brand-muted">
            <StickyNote className="mr-1 inline h-2.5 w-2.5" />
            Notas do GM: {notes.length}
          </span>
          <button
            onClick={toggleGMNotes}
            className="text-brand-muted hover:text-brand-text"
            title={showGMNotes ? "Ocultar notas" : "Mostrar notas"}
          >
            {showGMNotes ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
          </button>
        </div>

        {showGMNotes && notes.length > 0 && (
          <div className="max-h-[80px] space-y-0.5 overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group flex items-center gap-1 rounded px-1 py-0.5 text-[9px] text-brand-text hover:bg-white/[0.03]"
              >
                <span className="text-yellow-400">📝</span>
                <span className="flex-1 truncate">
                  &ldquo;{note.text}&rdquo; em ({note.x}, {note.y})
                </span>
                <button
                  onClick={() => removeNote(note.id)}
                  className="text-brand-muted/30 opacity-0 hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Markers */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[9px] text-brand-muted">
            <MapPin className="mr-1 inline h-2.5 w-2.5" />
            Marcadores: {markers.length}
          </span>
          <button
            onClick={toggleMarkers}
            className="text-brand-muted hover:text-brand-text"
            title={showMarkers ? "Ocultar marcadores" : "Mostrar marcadores"}
          >
            {showMarkers ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
          </button>
        </div>

        {showMarkers && markers.length > 0 && (
          <div className="max-h-[80px] space-y-0.5 overflow-y-auto">
            {markers.slice(0, 5).map((marker) => (
              <div
                key={marker.id}
                className="group flex items-center gap-1 rounded px-1 py-0.5 text-[9px] text-brand-text hover:bg-white/[0.03]"
              >
                <span style={{ color: marker.color }}>
                  {marker.type === "flag"
                    ? "🚩"
                    : marker.type === "star"
                      ? "⭐"
                      : marker.type === "skull"
                        ? "💀"
                        : marker.type === "alert"
                          ? "⚠️"
                          : marker.type === "heart"
                            ? "❤️"
                            : "❓"}
                </span>
                <span className="flex-1 truncate">
                  {marker.label || marker.type} em ({marker.x}, {marker.y})
                </span>
                <button
                  onClick={() => removeMarker(marker.id)}
                  className="text-brand-muted/30 opacity-0 hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
            {markers.length > 5 && (
              <p className="px-1 text-[8px] text-brand-muted">
                +{markers.length - 5} mais
              </p>
            )}
          </div>
        )}

        {markers.length > 0 && (
          <button
            onClick={() => {
              markers.forEach((m) => removeMarker(m.id));
            }}
            className="mt-1 flex w-full items-center justify-center gap-1 rounded bg-red-500/10 py-0.5 text-[8px] text-red-400 transition-colors hover:bg-red-500/20"
          >
            <Trash2 className="h-2.5 w-2.5" />
            Limpar marcadores
          </button>
        )}
      </div>
    </div>
  );
}
