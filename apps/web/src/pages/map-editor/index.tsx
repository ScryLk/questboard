import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMapEditorStore } from "../../stores/map-editor-store.js";
import { EditorToolbar } from "../../components/map-editor/toolbar/editor-toolbar.js";
import { LeftPanel } from "../../components/map-editor/panels/left-panel.js";
import { RightPanel } from "../../components/map-editor/panels/right-panel.js";
import { MapCanvas } from "../../components/map-editor/canvas/map-canvas.js";
import { BottomBar } from "../../components/map-editor/toolbar/bottom-bar.js";
import { AIZoneModal } from "../../components/map-editor/modals/ai-zone-modal.js";
import { NewMapModal } from "../../components/map-editor/modals/new-map-modal.js";

export function MapEditorPage() {
  const { mapId } = useParams<{ mapId?: string }>();
  const {
    initializeMap,
    setActiveTool,
    undo,
    redo,
    setBrushSize,
    brushSize,
    setWallDrawing,
  } = useMapEditorStore();

  const [showNewMapModal, setShowNewMapModal] = useState(!mapId);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize map on mount
  useEffect(() => {
    if (mapId) {
      // TODO: Load map from API
      initializeMap({ id: mapId, name: "Carregando...", width: 40, height: 30 });
      setIsInitialized(true);
    }
  }, [mapId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        return;
      }

      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "v":
            setActiveTool("cursor");
            return;
          case "b":
            setActiveTool("terrain");
            return;
          case "o":
            setActiveTool("objects");
            return;
          case "w":
            setActiveTool("walls");
            return;
          case "d":
            setActiveTool("doors");
            return;
          case "l":
            setActiveTool("lights");
            return;
          case "f":
            setActiveTool("fog");
            return;
          case "n":
            setActiveTool("annotate");
            return;
          case "e":
            setActiveTool("eraser");
            return;
          case "escape":
            setWallDrawing(null);
            return;
          case "[":
            setBrushSize(Math.max(1, brushSize - 1));
            return;
          case "]":
            setBrushSize(Math.min(5, brushSize + 1));
            return;
        }
      }

      // Ctrl shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            return;
          case "s":
            e.preventDefault();
            // TODO: Save
            return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [brushSize]);

  const handleMapCreated = () => {
    setShowNewMapModal(false);
    setIsInitialized(true);
  };

  if (!isInitialized) {
    return (
      <>
        <div className="flex h-screen items-center justify-center bg-[#0A0A0F]">
          <div className="text-center">
            <h2 className="font-heading text-lg font-semibold text-white">
              Editor de Mapas
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Crie mapas interativos para suas sessões de RPG
            </p>
            <button
              onClick={() => setShowNewMapModal(true)}
              className="mt-4 rounded-lg bg-brand-accent px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brand-accent/80"
            >
              Criar Novo Mapa
            </button>
          </div>
        </div>
        <NewMapModal
          open={showNewMapModal}
          onClose={() => setShowNewMapModal(false)}
          onCreated={handleMapCreated}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#0A0A0F]">
      <EditorToolbar />

      <div className="flex flex-1 overflow-hidden">
        <LeftPanel />
        <MapCanvas />
        <RightPanel />
      </div>

      <BottomBar />

      {/* Modals */}
      <AIZoneModal />
    </div>
  );
}
