"use client";

import type { FullCharacter } from "@/lib/character-types";

interface TabHistoricoProps {
  character: FullCharacter;
}

const SESSION_LOG = [
  {
    date: "15 Jan 2025",
    session: 1,
    event:
      "Criacao do personagem. A aventura comeca na taverna do Javali Dourado.",
  },
  {
    date: "22 Jan 2025",
    session: 2,
    event:
      "Exploracao das ruinas antigas. Primeiro combate contra goblins.",
  },
  {
    date: "29 Jan 2025",
    session: 3,
    event: "Encontro com o NPC misterioso Maren na taverna.",
  },
  {
    date: "5 Fev 2025",
    session: 4,
    event: "Emboscada na floresta. Luta contra o bugbear lider.",
  },
  {
    date: "12 Fev 2025",
    session: 5,
    event:
      "Chegada ao castelo abandonado. Descoberta da entrada secreta.",
  },
  {
    date: "19 Fev 2025",
    session: 6,
    event: "Exploracao dos subterraneos. Armadilhas e puzzles.",
  },
  {
    date: "26 Fev 2025",
    session: 7,
    event:
      "Confronto com o cultista. Revelacao sobre o Codex das Sombras.",
  },
  {
    date: "5 Mar 2025",
    session: 8,
    event:
      "Viagem para a Montanha da Espinha. Encontro com dragao jovem.",
  },
  {
    date: "12 Mar 2025",
    session: 9,
    event: "Negociacao com o dragao. Obteve mapa para o templo.",
  },
  {
    date: "19 Mar 2025",
    session: 10,
    event: "Sessao atual — exploracao do templo submerso.",
  },
];

export function TabHistorico({ character }: TabHistoricoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
        Registro de Sessoes
      </h3>

      <div className="relative pl-6">
        {/* Vertical timeline line */}
        <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-brand-border" />

        <div className="space-y-0">
          {SESSION_LOG.map((entry, index) => {
            const isLatest = index === SESSION_LOG.length - 1;
            const isEven = index % 2 === 0;

            return (
              <div
                key={entry.session}
                className={`relative py-3 pl-4 ${
                  isEven ? "bg-white/[0.01]" : ""
                } rounded`}
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-[-17px] top-[18px] h-3 w-3 rounded-full border-2 ${
                    isLatest
                      ? "border-brand-accent bg-brand-accent"
                      : "border-brand-border bg-brand-primary"
                  }`}
                />

                {/* Date + session label */}
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[11px] font-medium text-brand-muted">
                    {entry.date}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      isLatest
                        ? "bg-brand-accent/15 text-brand-accent"
                        : "bg-brand-border text-brand-muted"
                    }`}
                  >
                    Sessao {entry.session}
                  </span>
                </div>

                {/* Event text */}
                <p className="text-sm leading-relaxed text-brand-text">
                  {entry.event}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
