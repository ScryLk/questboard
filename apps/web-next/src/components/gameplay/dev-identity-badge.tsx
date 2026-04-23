"use client";

import { useEffect, useState } from "react";
import { Shield, User } from "lucide-react";
import { getIdentityFromUrl } from "@/lib/gameplay-sync/use-identity-from-url";
import { MOCK_PLAYERS } from "@/lib/gameplay-mock-data";

/**
 * Badge fixo no canto mostrando a identidade atual (`?as=` da URL) e os
 * URLs prontos das demais identidades pra abrir em outras abas.
 *
 * Os atalhos de "Player N" usam os **ids reais** de `MOCK_PLAYERS`
 * (`p1`, `p2`, `p3`) — batem com o `playerId` que o GM atribui via
 * menu contextual. Quando o backend subir, trocar por `CampaignMember`.
 *
 * Dev-only: só renderiza em NODE_ENV=development.
 */
export function DevIdentityBadge() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [identity, setIdentity] = useState<{ id: string; isGM: boolean }>({
    id: "gm",
    isGM: true,
  });

  useEffect(() => {
    setIdentity(getIdentityFromUrl());
    setMounted(true);
  }, []);

  if (process.env.NODE_ENV !== "development") return null;
  if (!mounted) return null;

  const basePath =
    typeof window !== "undefined" ? window.location.pathname : "";

  // Lista de identidades alternativas — GM + cada jogador do mock.
  const allIdentities: { id: string; label: string }[] = [
    { id: "gm", label: "GM" },
    ...MOCK_PLAYERS.map((p) => ({
      id: p.id,
      label: `${p.name} (${p.id})`,
    })),
  ];
  const otherIdentities = allIdentities
    .filter((o) => o.id !== identity.id)
    .map((o) => ({
      ...o,
      url: o.id === "gm" ? `${basePath}?as=gm` : `${basePath}?as=${o.id}`,
    }));

  // Label amigável da identidade atual (nome do player, ou "GM").
  const currentLabel = identity.isGM
    ? "GM"
    : (MOCK_PLAYERS.find((p) => p.id === identity.id)?.name ?? identity.id);

  return (
    <div className="fixed bottom-3 left-3 z-[60] flex flex-col items-start gap-2">
      {open && (
        <div className="rounded-lg border border-brand-border bg-[#111116]/95 p-2 shadow-xl backdrop-blur-sm">
          <div className="mb-1 px-1 text-[9px] font-semibold uppercase tracking-wider text-brand-muted">
            Abrir em nova aba
          </div>
          <div className="flex flex-col gap-1">
            {otherIdentities.map((o) => (
              <a
                key={o.url}
                href={o.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer rounded-md px-2 py-1 text-[11px] text-brand-text transition-colors hover:bg-white/[0.06]"
              >
                {o.label}
              </a>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-lg transition-colors ${
          identity.isGM
            ? "border-brand-accent/40 bg-brand-accent/15 text-brand-accent hover:bg-brand-accent/25"
            : "border-amber-500/40 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
        }`}
        title="Identidade de dev (BroadcastChannel sync)"
      >
        {identity.isGM ? (
          <Shield className="h-3 w-3" />
        ) : (
          <User className="h-3 w-3" />
        )}
        {currentLabel}
      </button>
    </div>
  );
}
