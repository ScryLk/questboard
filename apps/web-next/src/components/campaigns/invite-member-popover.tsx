"use client";

// Popover de convite — busca em MOCK_USERS, escolhe role, chama
// inviteMember da store. Hand-rolled (consistente com outros popovers).

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X, Check } from "lucide-react";
import {
  MOCK_USERS,
  searchMockUsers,
  type MockUser,
} from "@/lib/campaign-mock-users";
import type { CampaignMemberRole } from "@questboard/types";
import { useCampaignStore } from "@/lib/campaign-store";

interface Props {
  campaignId: string;
  excludeUserIds: string[];
  onClose: () => void;
}

const ROLE_LABELS: Record<CampaignMemberRole, string> = {
  GM: "GM",
  CO_GM: "Co-mestre",
  PLAYER: "Jogador",
  SPECTATOR: "Espectador",
};

const INVITABLE_ROLES: CampaignMemberRole[] = ["CO_GM", "PLAYER", "SPECTATOR"];

export function InviteMemberPopover({
  campaignId,
  excludeUserIds,
  onClose,
}: Props) {
  const inviteMember = useCampaignStore((s) => s.inviteMember);

  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<MockUser | null>(null);
  const [role, setRole] = useState<CampaignMemberRole>("PLAYER");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () => searchMockUsers(query, excludeUserIds),
    [query, excludeUserIds],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function commit() {
    if (!picked) return;
    inviteMember(campaignId, {
      userId: picked.userId,
      displayName: picked.displayName,
      avatarUrl: picked.avatarUrl,
      role,
      characterId: null,
    });
    onClose();
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-label="Convidar membro"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#04090f]/55 backdrop-blur-[1px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[360px] max-w-[calc(100vw-2rem)] rounded-lg border border-brand-border bg-brand-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-brand-border px-3 py-2">
          <p className="font-cinzel text-[11px] font-semibold uppercase tracking-wider text-brand-text">
            Convidar membro
          </p>
          <button
            onClick={onClose}
            className="flex h-5 w-5 items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            aria-label="Fechar"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        <div className="p-3">
          {/* TODO(backend-campaigns): substituir MOCK_USERS por GET /users/search?q=. */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou username…"
              className="w-full rounded-md border border-brand-border bg-brand-surface-light py-2 pl-8 pr-3 text-xs text-brand-text outline-none focus:border-brand-accent"
            />
          </div>

          <div
            className="mt-2 max-h-60 overflow-y-auto rounded-md border border-brand-border"
            role="listbox"
          >
            {results.length === 0 ? (
              <div className="px-3 py-4 text-center text-[11px] text-brand-muted">
                Nenhum usuário encontrado.
              </div>
            ) : (
              results.map((u) => {
                const selected = picked?.userId === u.userId;
                return (
                  <button
                    key={u.userId}
                    onClick={() => setPicked(u)}
                    className={`flex w-full items-center gap-2 border-b border-brand-border/50 px-3 py-2 text-left transition-colors last:border-b-0 ${
                      selected
                        ? "bg-brand-accent/10"
                        : "hover:bg-white/[0.03]"
                    }`}
                    role="option"
                    aria-selected={selected}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-accent/20 text-[10px] font-bold text-brand-accent">
                      {u.displayName
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-brand-text">
                        {u.displayName}
                      </p>
                      <p className="truncate text-[10px] text-brand-muted">
                        @{u.username}
                      </p>
                    </div>
                    {selected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-brand-accent" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Role selector */}
          <div className="mt-3">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              Papel
            </label>
            <div className="grid grid-cols-3 gap-1">
              {INVITABLE_ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                    role === r
                      ? "border-brand-accent bg-brand-accent/15 text-brand-accent"
                      : "border-brand-border text-brand-muted hover:text-brand-text"
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-brand-border px-3 py-1.5 text-xs font-medium text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
            >
              Cancelar
            </button>
            <button
              onClick={commit}
              disabled={!picked}
              className="rounded-md bg-brand-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Convidar
            </button>
          </div>

          <p className="mt-2 text-[10px] text-brand-muted">
            {MOCK_USERS.length} usuários disponíveis no mock dev.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
