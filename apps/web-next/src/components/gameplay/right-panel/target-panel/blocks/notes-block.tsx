"use client";

import { FileText } from "lucide-react";
import type { GameToken } from "@/lib/gameplay-mock-data";
import { Block } from "../block";
import { useTokenNotes } from "../use-token-notes";

interface NotesBlockProps {
  token: GameToken;
}

/**
 * Notas privadas do mestre por token. Visível apenas pra GM/CO_GM — a
 * decisão de mostrar o componente vive no TargetPanel (usa currentUserIsGM).
 * Persistência em localStorage via useTokenNotes.
 */
export function NotesBlock({ token }: NotesBlockProps) {
  const { text, update } = useTokenNotes(token.id);

  return (
    <Block id="notes" icon={FileText} title="Notas do Mestre" defaultOpen={false}>
      <textarea
        value={text}
        onChange={(e) => update(e.target.value)}
        placeholder="Anotações privadas (só você vê)…"
        rows={4}
        className="w-full resize-y rounded-md border border-brand-border bg-[#0A0A0F] px-2 py-1.5 text-[11px] text-brand-text placeholder:text-brand-muted/50 outline-none focus:border-brand-accent/40"
      />
      <p className="mt-1 text-[9px] text-brand-muted/60">
        Salva automaticamente. Visível apenas para mestres.
      </p>
    </Block>
  );
}
