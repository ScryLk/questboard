import { Swords, Plus, Skull, Shield, Heart } from "lucide-react";

const ENCOUNTERS = [
  { id: "1", name: "Emboscada dos Goblins", type: "combat", difficulty: "Fácil", status: "completed", monsters: 6 },
  { id: "2", name: "O Dragão Jovem", type: "combat", difficulty: "Difícil", status: "planned", monsters: 1 },
  { id: "3", name: "Bandidos na Estrada", type: "combat", difficulty: "Médio", status: "planned", monsters: 4 },
  { id: "4", name: "Armadilha do Necromante", type: "puzzle", difficulty: "Médio", status: "active", monsters: 0 },
];

export default function EncountersPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Encontros</h1>
          <p className="mt-1 text-sm text-gray-400">
            Planeje e gerencie encontros de combate e puzzles.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-accent/80">
          <Plus className="h-4 w-4" />
          Novo Encontro
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-brand-surface p-5">
          <Swords className="h-5 w-5 text-red-400" />
          <p className="mt-3 font-heading text-3xl font-bold text-white">{ENCOUNTERS.length}</p>
          <p className="text-sm text-gray-400">Total de Encontros</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-brand-surface p-5">
          <Skull className="h-5 w-5 text-yellow-400" />
          <p className="mt-3 font-heading text-3xl font-bold text-white">
            {ENCOUNTERS.reduce((sum, e) => sum + e.monsters, 0)}
          </p>
          <p className="text-sm text-gray-400">Monstros Planejados</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-brand-surface p-5">
          <Shield className="h-5 w-5 text-green-400" />
          <p className="mt-3 font-heading text-3xl font-bold text-white">
            {ENCOUNTERS.filter((e) => e.status === "completed").length}
          </p>
          <p className="text-sm text-gray-400">Completados</p>
        </div>
      </div>

      <div className="space-y-3">
        {ENCOUNTERS.map((enc) => (
          <div
            key={enc.id}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-brand-surface p-5 hover:border-white/20"
          >
            <div className="rounded-lg bg-red-500/10 p-2.5">
              {enc.type === "combat" ? (
                <Swords className="h-5 w-5 text-red-400" />
              ) : (
                <Heart className="h-5 w-5 text-purple-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">{enc.name}</h3>
              <p className="text-sm text-gray-500">
                {enc.type === "combat" ? `${enc.monsters} monstros` : "Puzzle"} · {enc.difficulty}
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
              {enc.status === "completed" ? "Completo" : enc.status === "active" ? "Ativo" : "Planejado"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
