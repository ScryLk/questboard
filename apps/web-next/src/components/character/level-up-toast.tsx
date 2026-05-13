"use client";

// Toast de level-up. Escuta `character:xp-changed` no socket de
// sessão e mostra um banner animado quando o usuário atual subiu de
// nível. Auto-dismiss em 5s; clicável pra fechar antes.

import { useEffect, useState } from "react";
import { Award, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { subscribe } from "@/lib/session-socket";

interface LevelUpEvent {
  sessionId: string;
  characterId: string;
  ownerUserId: string;
  delta: number;
  newXp: number;
  newLevel: number;
  leveledUp: boolean;
  by: string;
  at: string;
}

interface ToastState {
  characterId: string;
  newLevel: number;
  delta: number;
}

export function LevelUpToast() {
  const { user, isLoaded } = useUser();
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const unsubscribe = subscribe<LevelUpEvent>(
      "character:xp-changed",
      (payload) => {
        if (!payload.leveledUp) return;
        // Cada user só vê toast pro próprio personagem. GM ajusta XP
        // dos jogadores; os jogadores recebem o pulso.
        if (payload.ownerUserId !== user.id) return;
        setToast({
          characterId: payload.characterId,
          newLevel: payload.newLevel,
          delta: payload.delta,
        });
      },
    );

    return unsubscribe;
  }, [isLoaded, user]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(id);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-[70] flex justify-center">
      <button
        type="button"
        onClick={() => setToast(null)}
        className="pointer-events-auto flex cursor-pointer items-center gap-3 rounded-xl border border-brand-accent/30 bg-brand-surface/95 px-5 py-3 shadow-2xl backdrop-blur transition-transform hover:scale-[1.02]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent/20">
          <Award className="h-5 w-5 text-brand-accent" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-white">
            Subiu pra Nível {toast.newLevel}!
          </p>
          <p className="text-xs text-brand-muted">
            +{toast.delta} XP — atualize sua ficha pra escolher recompensas.
          </p>
        </div>
        <X className="h-3 w-3 text-brand-muted" />
      </button>
    </div>
  );
}
