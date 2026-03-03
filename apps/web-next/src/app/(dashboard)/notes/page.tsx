import { StickyNote, Plus, Search } from "lucide-react";

const NOTES = [
  { id: "1", title: "Pistas sobre a Cripta", category: "plot", content: "Os jogadores encontraram 3 pistas...", updatedAt: "2h atrás", isGmOnly: true },
  { id: "2", title: "Inventário da Loja", category: "item", content: "Poção de Cura (50po), Poção de...", updatedAt: "1d atrás", isGmOnly: false },
  { id: "3", title: "Motivações do Vilão", category: "npc", content: "Eldrith quer encontrar o artefato...", updatedAt: "3d atrás", isGmOnly: true },
  { id: "4", title: "Regras da Casa", category: "general", content: "Inspiração pode ser gasta para...", updatedAt: "1sem atrás", isGmOnly: false },
];

const CATEGORY_COLORS: Record<string, string> = {
  plot: "bg-purple-500/15 text-purple-400",
  item: "bg-yellow-500/15 text-yellow-400",
  npc: "bg-blue-500/15 text-blue-400",
  general: "bg-gray-500/15 text-gray-400",
  location: "bg-green-500/15 text-green-400",
};

const CATEGORY_LABELS: Record<string, string> = {
  plot: "Enredo",
  item: "Item",
  npc: "NPC",
  general: "Geral",
  location: "Local",
};

export default function NotesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Notas</h1>
          <p className="mt-1 text-sm text-gray-400">
            Suas anotações de campanha e sessão.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-accent/80">
          <Plus className="h-4 w-4" />
          Nova Nota
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-brand-surface px-4 py-2.5">
        <Search className="h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar notas..."
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
        />
      </div>

      {/* Notes Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NOTES.map((note) => (
          <div
            key={note.id}
            className="rounded-xl border border-white/10 bg-brand-surface p-5 hover:border-white/20"
          >
            <div className="flex items-start justify-between">
              <span className={`rounded-full px-2 py-0.5 text-xs ${CATEGORY_COLORS[note.category]}`}>
                {CATEGORY_LABELS[note.category]}
              </span>
              {note.isGmOnly && (
                <span className="text-xs text-yellow-500">GM only</span>
              )}
            </div>
            <h3 className="mt-3 font-medium text-white">{note.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
              {note.content}
            </p>
            <p className="mt-3 text-xs text-gray-600">{note.updatedAt}</p>
          </div>
        ))}

        {/* Add Note Card */}
        <button className="flex items-center justify-center rounded-xl border border-dashed border-white/10 p-8 text-gray-500 hover:border-white/20 hover:text-gray-400">
          <div className="text-center">
            <StickyNote className="mx-auto h-8 w-8" />
            <p className="mt-2 text-sm">Nova Nota</p>
          </div>
        </button>
      </div>
    </div>
  );
}
