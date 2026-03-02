import {
  ArrowLeft,
  Save,
  Eye,
  MoreVertical,
  Check,
} from "lucide-react";
import { useEditorStore } from "../../lib/editor-store";

export function Toolbar() {
  const { mapName, isSaving, lastSaved, isDirty, markSaved } = useEditorStore();

  const savedText = lastSaved
    ? `Salvo ${lastSaved.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
    : "Não salvo";

  function handleSave() {
    markSaved();
  }

  return (
    <div className="h-12 bg-bg-panel border-b border-border flex items-center px-4 gap-3 shrink-0">
      {/* Back */}
      <button className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border/50 transition-colors">
        <ArrowLeft size={18} />
      </button>

      {/* Map name */}
      <h1 className="text-sm font-semibold text-text-primary truncate flex-1 ml-1">
        {mapName}
      </h1>

      {/* Auto-save indicator */}
      <span className="text-xs text-text-muted flex items-center gap-1">
        {isDirty ? (
          <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
        ) : (
          <Check size={10} className="text-success" />
        )}
        {isDirty ? "Alterações não salvas" : savedText}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 ml-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors"
        >
          <Save size={14} />
          Salvar
        </button>

        <button className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-border text-text-secondary text-xs font-medium hover:bg-border/50 hover:text-text-primary transition-colors">
          <Eye size={14} />
          Preview
        </button>

        <button className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border/50 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}
