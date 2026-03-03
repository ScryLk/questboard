import Link from "next/link";
import { Plus, Map } from "lucide-react";

const TEMPLATES = [
  { id: "tavern", name: "Taverna Padrão", size: "20×15", biome: "city" },
  { id: "dungeon3", name: "Dungeon 3 Salas", size: "30×20", biome: "dungeon" },
  { id: "forest", name: "Floresta com Clareira", size: "40×30", biome: "forest" },
  { id: "village", name: "Vila Pequena", size: "50×40", biome: "city" },
  { id: "cave", name: "Caverna Natural", size: "35×25", biome: "cave" },
  { id: "castle", name: "Castelo", size: "60×60", biome: "dungeon" },
];

export default function MapsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Mapas</h1>
          <p className="mt-1 text-sm text-gray-400">
            Crie e gerencie seus mapas de batalha.
          </p>
        </div>
        <Link
          href="/maps/editor"
          className="flex items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-accent/80"
        >
          <Plus className="h-4 w-4" />
          Criar Mapa
        </Link>
      </div>

      {/* My Maps */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Meus Mapas</h2>
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-16">
          <div className="text-center">
            <Map className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-3 text-gray-500">Nenhum mapa criado ainda</p>
            <Link
              href="/maps/editor"
              className="mt-3 inline-block rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-400 hover:bg-white/10"
            >
              Criar seu primeiro mapa
            </Link>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Templates</h2>
        <p className="mb-6 text-sm text-gray-500">
          Comece com um mapa pré-construído e customize do seu jeito.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <Link
              key={t.id}
              href="/maps/editor"
              className="group rounded-xl border border-white/10 bg-brand-surface p-4 text-left transition-all hover:border-brand-accent/40"
            >
              <div className="mb-3 aspect-video rounded-lg bg-brand-primary" />
              <h3 className="text-sm font-semibold text-white group-hover:text-brand-accent">
                {t.name}
              </h3>
              <div className="mt-1 flex gap-2">
                <span className="rounded bg-white/5 px-2 py-0.5 text-xs text-gray-500">
                  {t.size}
                </span>
                <span className="rounded bg-white/5 px-2 py-0.5 text-xs text-gray-500">
                  {t.biome}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
