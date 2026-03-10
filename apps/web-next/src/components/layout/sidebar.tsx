"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  BookOpen,
  Users,
  Swords,
  Gamepad2,
  MessageSquare,
  ScrollText,
  Castle,
  Plus,
  ShieldAlert,
} from "lucide-react";

const CAMPAIGN_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/maps", label: "Mapas", icon: Map },
  { href: "/story", label: "Historia", icon: BookOpen },
  { href: "/players", label: "Jogadores", icon: Users },
  { href: "/encounters", label: "Encontros", icon: Swords },
];

const SESSION_NAV = [
  { href: "/gameplay", label: "Gameplay", icon: Gamepad2 },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/notes", label: "Notas", icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r border-brand-border bg-brand-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-brand-border px-5 py-4">
        <Link href="/" className="text-xl font-bold text-brand-accent">
          QuestBoard
        </Link>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
        {/* Campaign section */}
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Campanha
        </p>
        <nav className="flex flex-col gap-0.5">
          {CAMPAIGN_NAV.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-accent-muted text-brand-accent"
                    : "text-brand-muted hover:bg-white/5 hover:text-brand-text"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Session section */}
        <p className="mt-6 mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Sessao
        </p>
        <nav className="flex flex-col gap-0.5">
          {SESSION_NAV.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-accent-muted text-brand-accent"
                    : "text-brand-muted hover:bg-white/5 hover:text-brand-text"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-4 h-px bg-brand-border" />

        {/* Campaigns list */}
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Campanhas
        </p>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3 rounded-[10px] bg-white/5 px-3 py-2.5 text-sm font-medium text-brand-text">
            <Castle className="h-[18px] w-[18px] text-brand-accent" />
            <span className="flex-1 truncate">A Maldicao de Strahd</span>
            <span className="h-2 w-2 rounded-full bg-brand-success" />
          </div>
          <button className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text">
            <Plus className="h-[18px] w-[18px]" />
            <span>Nova Campanha</span>
          </button>
        </div>
      </div>

      {/* Admin Link */}
      <div className="px-3 pb-2">
        <div className="h-px bg-brand-border mb-2" />
        <Link
          href="/admin"
          className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname.startsWith("/admin")
              ? "bg-brand-danger/15 text-brand-danger"
              : "text-brand-muted hover:bg-white/5 hover:text-brand-danger"
          }`}
        >
          <ShieldAlert className="h-[18px] w-[18px]" />
          <span>Painel Admin</span>
        </Link>
      </div>

      {/* User */}
      <div className="border-t border-brand-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent/20 text-sm font-bold text-brand-accent">
            LS
          </div>
          <div className="flex-1 text-sm">
            <p className="font-medium text-brand-text">Lucas</p>
            <p className="text-xs text-brand-muted">Plano: Aventureiro</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
