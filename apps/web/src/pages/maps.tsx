import { useNavigate } from "react-router-dom";

const TEMPLATES = [
  { id: "tavern", name: "Taverna Padrão", size: "20×15", biome: "city" },
  { id: "dungeon3", name: "Dungeon 3 Salas", size: "30×20", biome: "dungeon" },
  { id: "forest", name: "Floresta com Clareira", size: "40×30", biome: "forest" },
  { id: "village", name: "Vila Pequena", size: "50×40", biome: "city" },
  { id: "cave", name: "Caverna Natural", size: "35×25", biome: "cave" },
  { id: "castle", name: "Castelo", size: "60×60", biome: "dungeon" },
];

export function MapsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-primary">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="text-gray-400 hover:text-white"
            >
              ←
            </button>
            <h1 className="font-heading text-2xl font-bold text-brand-accent">
              Mapas
            </h1>
          </div>
          <button
            onClick={() => navigate("/editor")}
            className="rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-accent/80"
          >
            + Criar Mapa
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* My Maps */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-white">Meus Mapas</h2>
          <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-16">
            <div className="text-center">
              <p className="text-gray-500">Nenhum mapa criado ainda</p>
              <button
                onClick={() => navigate("/editor")}
                className="mt-3 rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-400 hover:bg-white/10"
              >
                Criar seu primeiro mapa
              </button>
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
              <button
                key={t.id}
                onClick={() => navigate("/editor")}
                className="group rounded-xl border border-white/10 bg-[#111116] p-4 text-left transition-all hover:border-brand-accent/40 hover:shadow-glow"
              >
                <div className="mb-3 aspect-video rounded-lg bg-[#0A0A0F]" />
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
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
