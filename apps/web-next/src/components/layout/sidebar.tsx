"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  BookOpen,
  Package,
  Skull,
  Users,
  Gamepad2,
  MessageSquare,
  ScrollText,
  Castle,
  Plus,
  ShieldAlert,
  X,
} from "lucide-react";
import { useMobileSidebar } from "@/lib/mobile-sidebar-store";

const CAMPAIGN_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/maps", label: "Mapas", icon: Map },
  { href: "/story", label: "Historia", icon: BookOpen },
  { href: "/objects", label: "Objetos", icon: Package },
  { href: "/characters", label: "Personagens", icon: Skull },
  { href: "/players", label: "Jogadores", icon: Users },
];

const SESSION_NAV = [
  { href: "/gameplay", label: "Gameplay", icon: Gamepad2 },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/notes", label: "Notas", icon: ScrollText },
];

// ── Conteúdo interno do sidebar (reusado em desktop e mobile) ────────

function SidebarContent({
  onCloseRequest,
}: {
  /** Só passado no drawer mobile — mostra botão fechar. Desktop passa undefined. */
  onCloseRequest?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo + close (mobile) */}
      <div className="flex items-center gap-2 border-b border-brand-border px-5 py-4">
        <Link href="/" className="flex-1 text-xl font-bold text-brand-accent">
          QuestBoard
        </Link>
        {onCloseRequest && (
          <button
            onClick={onCloseRequest}
            className="cursor-pointer rounded-lg p-1.5 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
        {/* Campaign section */}
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Campanha
        </p>
        <nav className="flex flex-col gap-0.5">
          {CAMPAIGN_NAV.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
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
        <p className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
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
          <button className="flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text">
            <Plus className="h-[18px] w-[18px]" />
            <span>Nova Campanha</span>
          </button>
        </div>
      </div>

      {/* Admin Link */}
      <div className="px-3 pb-2">
        <div className="mb-2 h-px bg-brand-border" />
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
    </>
  );
}

// ── Sidebar exportado ────────────────────────────────────────────────
// Renderiza:
//  - `<md`: nada visível por default; drawer fixed flutua quando aberto
//    com backdrop clicável pra fechar.
//  - `>=md`: aside estático de 260px, comportamento original.

export function Sidebar() {
  const pathname = usePathname();
  const open = useMobileSidebar((s) => s.open);
  const setOpen = useMobileSidebar((s) => s.setOpen);

  // Fecha drawer automaticamente ao navegar (mobile).
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  // Fecha com Esc quando drawer aberto.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <>
      {/* Desktop: aside estático */}
      <aside className="hidden h-screen w-[260px] flex-col border-r border-brand-border bg-brand-sidebar md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile: backdrop — clicar fecha */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Mobile: drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-brand-border bg-brand-sidebar shadow-2xl transition-transform duration-200 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <SidebarContent onCloseRequest={() => setOpen(false)} />
      </aside>
    </>
  );
}
