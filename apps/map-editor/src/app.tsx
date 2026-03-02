import { useEffect } from "react";
import { Toolbar } from "./components/panels/toolbar";
import { LeftPanel } from "./components/panels/left-panel";
import { RightPanel } from "./components/panels/right-panel";
import { BottomBar } from "./components/panels/bottom-bar";
import { MapCanvas } from "./components/canvas/map-canvas";
import { AIZoneModal } from "./components/modals/ai-zone-modal";
import { useEditorStore } from "./lib/editor-store";

export function App() {
  const { activeTool, setActiveTool, setBrushSize, zoomIn, zoomOut, resetZoom } =
    useEditorStore();

  // ─── Keyboard Shortcuts ─────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

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
          setBrushSize(useEditorStore.getState().brushSize - 1);
          break;
        case "]":
          setBrushSize(useEditorStore.getState().brushSize + 1);
          break;
        case "=":
        case "+":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomIn();
          }
          break;
        case "-":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomOut();
          }
          break;
        case "0":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            resetZoom();
          }
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setActiveTool, setBrushSize, zoomIn, zoomOut, resetZoom]);

  return (
    <div className="h-screen w-screen flex flex-col bg-bg overflow-hidden">
      <Toolbar />

      <div className="flex flex-1 min-h-0">
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
