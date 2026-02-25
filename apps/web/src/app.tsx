import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout, AuthLayout } from "./layouts/app-layout.js";
import { SplashPage } from "./pages/splash.js";
import { AuthPage } from "./pages/auth.js";
import { HomePage } from "./pages/home.js";
import { SessionsPage } from "./pages/sessions.js";
import { CharactersPage } from "./pages/characters.js";
import { CharacterCreatePage } from "./pages/character-create.js";
import { BillingPage } from "./pages/billing.js";
import { ProfilePage } from "./pages/profile.js";
import { ProfileEditPage } from "./pages/profile-edit.js";
import { FriendsPage } from "./pages/friends.js";
import { NotificationsPage } from "./pages/notifications.js";
import { SettingsPage } from "./pages/settings.js";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/splash" element={<SplashPage />} />
        <Route element={<AuthLayout />}>
          <Route path="/auth" element={<AuthPage />} />
        </Route>

        {/* Authenticated routes */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/characters/create" element={<CharacterCreatePage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
