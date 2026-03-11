"use client";

import { useState } from "react";
import { Copy, Check, Hash, Calendar, Map, Users } from "lucide-react";
import type { LobbySessionInfo } from "@/lib/lobby-store";

export function LobbyHeader({ session }: { session: LobbySessionInfo }) {
  const [copied, setCopied] = useState(false);

  function handleCopyCode() {
    navigator.clipboard.writeText(session.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      {/* Session title */}
      <div>
        <h1 className="text-lg font-bold text-brand-text">{session.name}</h1>
        <p className="text-xs text-brand-muted">{session.campaignName}</p>
      </div>

      {/* Invite code */}
      <div className="flex items-center gap-2 rounded-lg border border-brand-border bg-white/[0.03] px-3 py-2">
        <Hash className="h-4 w-4 text-brand-accent" />
        <span className="font-mono text-lg font-bold tracking-widest text-brand-accent">
          {session.inviteCode}
        </span>
        <button
          onClick={handleCopyCode}
          className="ml-auto flex items-center gap-1 rounded px-2 py-1 text-xs text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-400" />
              <span className="text-green-400">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copiar
            </>
          )}
        </button>
      </div>

      {/* Session meta */}
      <div className="flex flex-wrap gap-3 text-xs text-brand-muted">
        {session.mapName && (
          <span className="flex items-center gap-1">
            <Map className="h-3 w-3" /> {session.mapName}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" /> Máx {session.maxPlayers} jogadores
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />{" "}
          {new Date(session.date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
