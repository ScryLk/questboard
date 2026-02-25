import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Avatar, Badge } from "@questboard/ui";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: "🎲" },
  { path: "/sessions", label: "Sessões", icon: "📋" },
  { path: "/characters", label: "Personagens", icon: "🧙" },
  { path: "/friends", label: "Amigos", icon: "👥" },
] as const;

const BOTTOM_ITEMS = [
  { path: "/billing", label: "Planos", icon: "⭐" },
  { path: "/profile", label: "Perfil", icon: "👤" },
  { path: "/settings", label: "Config", icon: "⚙️" },
] as const;

function Sidebar() {
  return (
    <aside className="fixed left-0 top-14 bottom-0 w-56 border-r border-border-default bg-surface flex flex-col z-30">
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-fast ${
                isActive
                  ? "bg-accent-muted text-accent"
                  : "text-text-secondary hover:bg-hover hover:text-text-primary"
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 space-y-1 border-t border-border-default">
        {BOTTOM_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-fast ${
                isActive
                  ? "bg-accent-muted text-accent"
                  : "text-text-secondary hover:bg-hover hover:text-text-primary"
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}

function TopNav() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border-default flex items-center justify-between px-4 z-40">
      <div className="flex items-center gap-3">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold font-display text-accent">QB</span>
          <span className="text-lg font-bold font-display text-text-primary hidden sm:inline">
            QuestBoard
          </span>
        </NavLink>
      </div>

      <div className="flex items-center gap-3">
        <NavLink
          to="/notifications"
          className="relative p-2 rounded-md text-text-secondary hover:bg-hover hover:text-text-primary transition-all duration-fast"
        >
          <span className="text-lg">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
        </NavLink>
        <NavLink to="/profile">
          <Avatar size="sm" fallback="U" />
        </NavLink>
      </div>
    </header>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-base">
      <TopNav />
      <Sidebar />
      <main className="ml-56 mt-14 p-6">
        <div className="mx-auto max-w-5xl animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <Outlet />
    </div>
  );
}
