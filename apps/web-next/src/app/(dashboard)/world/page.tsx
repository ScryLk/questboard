import { Globe, Plus, MapPin, Users, Scroll } from "lucide-react";

const TABS = [
  { id: "npcs", label: "NPCs", icon: Users },
  { id: "locations", label: "Locais", icon: MapPin },
  { id: "factions", label: "Facções", icon: Globe },
  { id: "lore", label: "Lore", icon: Scroll },
];

const NPCS = [
  { id: "1", name: "Taverneiro Brom", race: "Humano", occupation: "Taverneiro", disposition: "friendly", location: "Taverna do Dragão" },
  { id: "2", name: "Eldrith, a Sábia", race: "Elfa", occupation: "Conselheira", disposition: "neutral", location: "Torre da Magia" },
  { id: "3", name: "Garuk Sangue-Frio", race: "Orc", occupation: "Líder Bandido", disposition: "hostile", location: "Montanhas Negras" },
  { id: "4", name: "Lira Vento-de-Prata", race: "Meio-Elfa", occupation: "Barda", disposition: "friendly", location: "Praça do Mercado" },
];

export default function WorldPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Mundo</h1>
          <p className="mt-1 text-sm text-gray-400">
            NPCs, locais, facções e lore do seu mundo.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-accent/80">
          <Plus className="h-4 w-4" />
          Novo NPC
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab.id === "npcs"
                  ? "bg-brand-accent/15 text-brand-accent"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* NPC Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NPCS.map((npc) => (
          <div
            key={npc.id}
            className="rounded-xl border border-white/10 bg-brand-surface p-5 hover:border-white/20"
          >
            <div className="flex items-start justify-between">
              <div className="h-12 w-12 rounded-full bg-white/10" />
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  npc.disposition === "friendly"
                    ? "bg-green-500/15 text-green-400"
                    : npc.disposition === "hostile"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-white/5 text-gray-400"
                }`}
              >
                {npc.disposition === "friendly" ? "Amigável" : npc.disposition === "hostile" ? "Hostil" : "Neutro"}
              </span>
            </div>
            <h3 className="mt-3 font-medium text-white">{npc.name}</h3>
            <p className="text-sm text-gray-500">
              {npc.race} · {npc.occupation}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              {npc.location}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
