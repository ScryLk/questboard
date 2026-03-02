import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/home.js";
import { MapEditorPage } from "./pages/map-editor/index.js";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor/map" element={<MapEditorPage />} />
        <Route path="/editor/map/:mapId" element={<MapEditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
