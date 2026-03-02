import { useMapEditorStore } from "../../../stores/map-editor-store.js";

export function EditorToolbar() {
  const { mapName, setMapName, isDirty, isSaving, lastSavedAt } = useMapEditorStore();

  const handleSave = () => {
    const store = useMapEditorStore.getState();
    store.setIsSaving(true);
    // TODO: API call to save map
    setTimeout(() => store.markSaved(), 500);
  };

  const savedLabel = lastSavedAt
    ? `Salvo ${formatTimeAgo(lastSavedAt)}`
    : "Não salvo";

  return (
    <div className="flex h-12 items-center justify-between border-b border-white/10 bg-[#111116] px-4">
      {/* Left: Back + Map Name */}
      <div className="flex items-center gap-3">
        <button
          className="flex items-center gap-1 text-sm text-gray-400 transition hover:text-white"
          onClick={() => window.history.back()}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </button>

        <div className="h-4 w-px bg-white/10" />

        <input
          type="text"
          value={mapName}
          onChange={(e) => setMapName(e.target.value)}
          className="bg-transparent text-sm font-semibold text-white outline-none placeholder:text-gray-500"
          placeholder="Nome do mapa..."
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">
          {isSaving ? "Salvando..." : isDirty ? "Alterações não salvas" : savedLabel}
        </span>

        <button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="rounded-lg bg-brand-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-accent/80 disabled:opacity-40"
        >
          Salvar
        </button>

        <button className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-white/5">
          Preview
        </button>

        <button className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-white/5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="3" r="1.5" fill="currentColor" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
            <circle cx="8" cy="13" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  return `há ${hours}h`;
}
