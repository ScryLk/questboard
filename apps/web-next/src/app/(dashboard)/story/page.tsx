import { BookOpen, Plus, GitBranch, Calendar, CheckSquare } from "lucide-react";

const VIEWS = [
  { id: "roadmap", label: "Roadmap", icon: GitBranch },
  { id: "timeline", label: "Timeline", icon: Calendar },
  { id: "tasks", label: "Tarefas", icon: CheckSquare },
];

const STORY_ARCS = [
  { id: "1", title: "A Maldição do Rei Morto", status: "active" as const, events: 8, color: "#7C3AED" },
  { id: "2", title: "O Artefato Perdido", status: "planned" as const, events: 3, color: "#3B82F6" },
  { id: "3", title: "Aliança com os Elfos", status: "completed" as const, events: 12, color: "#10B981" },
];

export default function StoryPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Enredo</h1>
          <p className="mt-1 text-sm text-gray-400">
            Planeje e acompanhe os arcos narrativos da sua campanha.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-accent/80">
          <Plus className="h-4 w-4" />
          Novo Arco
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2">
        {VIEWS.map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                view.id === "roadmap"
                  ? "bg-brand-accent/15 text-brand-accent"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {view.label}
            </button>
          );
        })}
      </div>

      {/* Story Arcs */}
      <div className="space-y-4">
        {STORY_ARCS.map((arc) => (
          <div
            key={arc.id}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-brand-surface p-5"
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: arc.color }}
            />
            <div className="flex-1">
              <h3 className="font-medium text-white">{arc.title}</h3>
              <p className="text-sm text-gray-500">{arc.events} eventos</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                arc.status === "active"
                  ? "bg-brand-accent/15 text-brand-accent"
                  : arc.status === "completed"
                    ? "bg-green-500/15 text-green-400"
                    : "bg-white/5 text-gray-400"
              }`}
            >
              {arc.status === "active" ? "Ativo" : arc.status === "completed" ? "Completo" : "Planejado"}
            </span>
            <BookOpen className="h-4 w-4 text-gray-500" />
          </div>
        ))}
      </div>
    </div>
  );
}
