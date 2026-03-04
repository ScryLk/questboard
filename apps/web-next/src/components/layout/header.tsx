"use client";

import { useState } from "react";
import { Bell, Plus, Search } from "lucide-react";

interface HeaderProps {
  onCreateSession?: () => void;
}

export function Header({ onCreateSession }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-brand-border px-6">
      {/* Left: Campaign info */}
      <div>
        <h1 className="text-lg font-bold text-brand-text">A Maldicao de Strahd</h1>
        <p className="text-xs text-brand-muted">
          Campanha ativa - 12 sessoes - 4 jogadores
        </p>
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5">
          <Search className="h-4 w-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-48 bg-transparent text-sm text-brand-text placeholder-brand-muted outline-none"
          />
        </div>

        {onCreateSession && (
          <button
            onClick={onCreateSession}
            className="flex items-center gap-2 rounded-[10px] bg-brand-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Nova Sessao
          </button>
        )}

        <button className="relative rounded-lg p-2 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text">
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-accent/20 text-xs font-bold text-brand-accent">
          LS
        </div>
      </div>
    </header>
  );
}
