import { useEffect, useState } from "react";
import { MapCanvas } from "../../components/editor/map-canvas.js";
import { ToolSidebar } from "../../components/editor/tool-sidebar.js";
import { PropertiesPanel } from "../../components/editor/properties-panel.js";
import { EditorToolbar, EditorBottomBar } from "../../components/editor/editor-toolbar.js";
import { AIZoneModal } from "../../components/editor/ai-zone-modal.js";
import { NewMapModal } from "../../components/editor/new-map-modal.js";
import { useMapEditorStore } from "../../lib/map-editor-store.js";

export function MapEditorPage() {
  const { activeTool, undo, redo, setActiveTool } = useMapEditorStore();
  const [showNewMap, setShowNewMap] = useState(false);
  const [showAIZone, setShowAIZone] = useState(false);

  // Show AI Zone modal when tool selected
  useEffect(() => {
    if (activeTool === "ai_zone") {
      setShowAIZone(true);
      setActiveTool("cursor");
    }
  }, [activeTool, setActiveTool]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Ctrl+Z / Cmd+Z — undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Shift+Z / Cmd+Shift+Z — redo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      // Ctrl+Y — redo
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }

      // Tool shortcuts
      switch (e.key) {
        case "v":
        case "V":
          setActiveTool("cursor");
          break;
        case "b":
        case "B":
          setActiveTool("terrain");
          break;
        case "o":
        case "O":
          setActiveTool("objects");
          break;
        case "w":
        case "W":
          setActiveTool("walls");
          break;
        case "d":
        case "D":
          setActiveTool("doors");
          break;
        case "l":
        case "L":
          setActiveTool("lights");
          break;
        case "f":
        case "F":
          setActiveTool("fog");
          break;
        case "e":
        case "E":
          setActiveTool("eraser");
          break;
        case "[":
          useMapEditorStore.getState().setBrushSize(
            useMapEditorStore.getState().brushSize - 1
          );
          break;
        case "]":
          useMapEditorStore.getState().setBrushSize(
            useMapEditorStore.getState().brushSize + 1
          );
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, setActiveTool]);

  return (
    <div className="flex h-screen flex-col bg-[#0A0A0F]">
      {/* Top toolbar */}
      <EditorToolbar />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Tools */}
        <ToolSidebar />

        {/* Center - Canvas */}
        <MapCanvas />

        {/* Right panel - Properties */}
        <PropertiesPanel />
      </div>

      {/* Bottom bar */}
      <EditorBottomBar />

      {/* Modals */}
      <NewMapModal isOpen={showNewMap} onClose={() => setShowNewMap(false)} />
      <AIZoneModal
        isOpen={showAIZone}
        onClose={() => setShowAIZone(false)}
        zoneWidth={10}
        zoneHeight={8}
      />
    </div>
  );
}
