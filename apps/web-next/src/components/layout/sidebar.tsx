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
  Info,
  X,
  Globe,
  Headphones,
} from "lucide-react";
import { useMobileSidebar } from "@/lib/mobile-sidebar-store";
import { useMemo } from "react";
import { useCampaignStore } from "@/lib/campaign-store";
import { useCampaignModalsStore } from "@/lib/campaign-modals-store";

const CAMPAIGN_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/maps", label: "Mapas", icon: Map },
  { href: "/story", label: "Historia", icon: BookOpen },
  { href: "/world", label: "Mundo", icon: Globe },
  { href: "/objects", label: "Objetos", icon: Package },
  { href: "/characters", label: "Personagens", icon: Skull },
  { href: "/players", label: "Jogadores", icon: Users },
];

const SESSION_NAV = [
  { href: "/gameplay", label: "Gameplay", icon: Gamepad2 },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/notes", label: "Notas", icon: ScrollText },
  { href: "/audio", label: "Áudio", icon: Headphones },
];

const REFERENCE_NAV = [
  { href: "/compendium", label: "Compêndio", icon: ScrollText },
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

        {/* Reference section */}
        <p className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Referência
        </p>
        <nav className="flex flex-col gap-0.5">
          {REFERENCE_NAV.map((item) => {
            const isActive = pathname.startsWith(item.href);
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

        {/* Campaigns list — top 5 ativas da store. Clique abre overview. */}
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Campanhas
        </p>
        <SidebarCampaignList pathname={pathname} />
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

function SidebarCampaignList({ pathname }: { pathname: string }) {
  // Selector retorna referência estável de `campaigns`; filtragem em
  // useMemo pra não quebrar getSnapshot/getServerSnapshot (filter cria
  // array novo a cada call → loop infinito).
  const campaigns = useCampaignStore((s) => s.campaigns);
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const top = useMemo(
    () => campaigns.filter((c) => c.status === "active").slice(0, 5),
    [campaigns],
  );

  const openSettings = useCampaignModalsStore((s) => s.openSettings);
  const openPreview = useCampaignModalsStore((s) => s.openPreview);

  return (
    <>
      <div className="flex flex-col gap-0.5">
        {top.map((c) => {
          // Pathname tem prefixos diversos (overview, settings, members) —
          // qualquer um marca a campanha como "em foco" visualmente.
          const inRoute = pathname.startsWith(`/campaigns/${c.id}`);
          const isActive = activeCampaignId === c.id;
          return (
            <div
              key={c.id}
              className={`group flex items-center gap-1 rounded-[10px] pr-1 transition-colors ${
                inRoute ? "bg-white/5" : "hover:bg-white/5"
              }`}
            >
              <button
                onClick={() => openPreview(c.id)}
                className={`flex min-w-0 flex-1 items-center gap-3 rounded-l-[10px] px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  inRoute
                    ? "text-brand-text"
                    : "text-brand-muted group-hover:text-brand-text"
                }`}
                title={c.name}
              >
                <Castle
                  className={`h-[18px] w-[18px] shrink-0 ${
                    inRoute ? "text-brand-accent" : "text-brand-muted"
                  }`}
                />
                <span className="min-w-0 flex-1 truncate">{c.name}</span>
                {isActive && (
                  <span
                    className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold"
                    title="Campanha ativa"
                    aria-label="Campanha ativa"
                  />
                )}
              </button>
              <button
                onClick={() => openSettings(c.id)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-brand-muted transition-colors hover:bg-white/10 hover:text-brand-text"
                aria-label={`Configurações de ${c.name}`}
                title="Configurações"
              >
                <Info className="h-[14px] w-[14px]" />
              </button>
            </div>
          );
        })}
        <Link
          href="/campaigns/new"
          className="flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
        >
          <Plus className="h-[18px] w-[18px]" />
          <span>Nova Campanha</span>
        </Link>
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
