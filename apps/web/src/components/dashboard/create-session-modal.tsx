import { useState, useCallback } from "react";
import { useCampaignStore } from "../../lib/campaign-store.js";

export function CreateSessionModal() {
  const createSessionModalOpen = useCampaignStore(
    (s) => s.createSessionModalOpen,
  );
  const closeCreateSession = useCampaignStore((s) => s.closeCreateSession);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("20:00");
  const [description, setDescription] = useState("");

  const handleClose = useCallback(() => {
    setName("");
    setDate("");
    setTime("20:00");
    setDescription("");
    closeCreateSession();
  }, [closeCreateSession]);

  const handleCreate = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleClose();
    },
    [handleClose],
  );

  if (!createSessionModalOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl"
        style={{ zIndex: 10000, backgroundColor: "#0F0F1A" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-heading text-lg font-bold text-white">
          Criar Nova Sessão
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          Configure os detalhes da próxima sessão
        </p>

        <form onSubmit={handleCreate} className="mt-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-300">
              Nome da Sessão
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: A Torre de Ravenloft"
              maxLength={100}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-brand-accent/50 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-accent/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300">
                Horário
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-accent/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-300">
              Descrição{" "}
              <span className="text-gray-600">(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notas sobre a sessão..."
              maxLength={500}
              rows={3}
              className="mt-1 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-brand-accent/50 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                name.trim()
                  ? "bg-brand-accent text-white hover:bg-red-500"
                  : "bg-white/5 text-gray-600"
              }`}
            >
              Criar Sessão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
