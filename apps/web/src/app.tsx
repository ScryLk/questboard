import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/home.js";
import { MapsPage } from "./pages/maps.js";
import { MapEditorPage } from "./pages/editor/index.js";
import { DashboardLayout } from "./components/layout/dashboard-layout.js";
import { CampaignDashboardPage } from "./pages/dashboard/index.js";
import { SessionDashboardPage } from "./pages/dashboard/session.js";
import { JoinPage } from "./pages/join.js";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/maps" element={<MapsPage />} />
        <Route path="/editor" element={<MapEditorPage />} />
        <Route path="/editor/:mapId" element={<MapEditorPage />} />

        {/* Dashboard routes with sidebar layout */}
        <Route path="/campaign" element={<DashboardLayout />}>
          <Route path=":campaignId" element={<CampaignDashboardPage />} />
          <Route
            path=":campaignId/session/:sessionId"
            element={<SessionDashboardPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
