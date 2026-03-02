import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/home.js";
import { MapsPage } from "./pages/maps.js";
import { MapEditorPage } from "./pages/editor/index.js";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/maps" element={<MapsPage />} />
        <Route path="/editor" element={<MapEditorPage />} />
        <Route path="/editor/:mapId" element={<MapEditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
