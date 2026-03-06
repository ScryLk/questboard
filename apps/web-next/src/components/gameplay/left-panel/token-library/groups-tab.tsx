"use client";

import { Plus } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useTokenLibraryStore } from "@/lib/token-library-store";
import { EncounterGroupItem } from "./encounter-group-item";

export function GroupsTab() {
  const groups = useTokenLibraryStore((s) => s.encounterGroups);
  const openModal = useGameplayStore((s) => s.openModal);
  const setTarget = useGameplayStore(
    (s) => s.setEncounterGroupEditorTarget,
  );

  function handleCreate() {
    setTarget(null);
    openModal("encounterGroupEditor");
  }

  return (
    <div>
      {groups.length === 0 ? (
        <div className="px-3 py-4 text-center">
          <p className="text-[10px] text-brand-muted">
            Nenhum grupo de encontro criado.
          </p>
          <p className="mt-0.5 text-[9px] text-brand-muted/60">
            Crie grupos para adicionar encontros inteiros de uma vez.
          </p>
        </div>
      ) : (
        <div className="max-h-[280px] space-y-1 overflow-y-auto px-1.5">
          {groups.map((group) => (
            <EncounterGroupItem key={group.id} group={group} />
          ))}
        </div>
      )}

      {/* Create group */}
      <div className="mt-1.5 px-2">
        <button
          onClick={handleCreate}
          className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-brand-border py-1 text-[10px] font-medium text-brand-muted transition-colors hover:border-brand-accent/30 hover:text-brand-text"
        >
          <Plus className="h-3 w-3" />
          Criar Grupo
        </button>
      </div>
    </div>
  );
}
