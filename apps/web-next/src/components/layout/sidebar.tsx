"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  BookOpen,
  Users,
  Swords,
  Globe,
  Gamepad2,
  MessageSquare,
  StickyNote,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/maps", label: "Mapas", icon: Map },
  { href: "/story", label: "Enredo", icon: BookOpen },
  { href: "/players", label: "Jogadores", icon: Users },
  { href: "/encounters", label: "Encontros", icon: Swords },
  { href: "/world", label: "Mundo", icon: Globe },
  { href: "/gameplay", label: "Gameplay", icon: Gamepad2 },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/notes", label: "Notas", icon: StickyNote },
  { href: "/settings", label: "Config", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[240px] flex-col border-r border-white/10 bg-brand-surface">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-4">
        <span className="font-heading text-xl font-bold text-brand-accent">
          QuestBoard
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-accent/15 text-brand-accent"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-brand-accent/20" />
          <div className="flex-1 text-sm">
            <p className="text-white">Game Master</p>
            <p className="text-xs text-gray-500">Plano Free</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
