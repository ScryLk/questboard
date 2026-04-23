"use client";

import { Heart, Shield, Skull, Swords } from "lucide-react";

/**
 * Mock enquanto não há API/persist — mesma lista que havia em /encounters.
 * TODO: plugar num `encountersStore` quando a feature for desenvolvida.
 */
const ENCOUNTERS: {
  id: string;
  name: string;
  type: "combat" | "puzzle";
  difficulty: "Fácil" | "Médio" | "Difícil";
  status: "completed" | "active" | "planned";
  monsters: number;
}[] = [
  { id: "1", name: "Emboscada dos Goblins", type: "combat", difficulty: "Fácil", status: "completed", monsters: 6 },
  { id: "2", name: "O Dragão Jovem", type: "combat", difficulty: "Difícil", status: "planned", monsters: 1 },
  { id: "3", name: "Bandidos na Estrada", type: "combat", difficulty: "Médio", status: "planned", monsters: 4 },
  { id: "4", name: "Armadilha do Necromante", type: "puzzle", difficulty: "Médio", status: "active", monsters: 0 },
];

const STATUS_LABEL: Record<string, string> = {
  completed: "Completo",
  active: "Ativo",
  planned: "Planejado",
};

export function EncountersView() {
  const totalMonsters = ENCOUNTERS.reduce((sum, e) => sum + e.monsters, 0);
  const completed = ENCOUNTERS.filter((e) => e.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-brand-surface p-5">
          <Swords className="h-5 w-5 text-red-400" />
          <p className="mt-3 font-heading text-3xl font-bold text-white">
            {ENCOUNTERS.length}
          </p>
          <p className="text-sm text-gray-400">Total de encontros</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-brand-surface p-5">
          <Skull className="h-5 w-5 text-yellow-400" />
          <p className="mt-3 font-heading text-3xl font-bold text-white">
            {totalMonsters}
          </p>
          <p className="text-sm text-gray-400">Monstros planejados</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-brand-surface p-5">
          <Shield className="h-5 w-5 text-green-400" />
          <p className="mt-3 font-heading text-3xl font-bold text-white">
            {completed}
          </p>
          <p className="text-sm text-gray-400">Completados</p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {ENCOUNTERS.map((enc) => (
          <div
            key={enc.id}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-brand-surface p-5 hover:border-white/20"
          >
            <div
              className={`rounded-lg p-2.5 ${
                enc.type === "combat" ? "bg-red-500/10" : "bg-purple-500/10"
              }`}
            >
              {enc.type === "combat" ? (
                <Swords className="h-5 w-5 text-red-400" />
              ) : (
                <Heart className="h-5 w-5 text-purple-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">{enc.name}</h3>
              <p className="text-sm text-gray-500">
                {enc.type === "combat"
                  ? `${enc.monsters} monstros`
                  : "Puzzle"}{" "}
                · {enc.difficulty}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                enc.status === "completed"
                  ? "bg-green-500/15 text-green-400"
                  : enc.status === "active"
                    ? "bg-brand-accent/15 text-brand-accent"
                    : "bg-white/5 text-gray-400"
              }`}
            >
              {STATUS_LABEL[enc.status] ?? enc.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
