"use client";

import { useSettingsStore } from "@/lib/settings-store";
import { SettingsSection } from "../controls";
import { Download, Upload, Trash2, RotateCcw } from "lucide-react";

export function StorageSection() {
  const { resetAll } = useSettingsStore();

  const storageItems = [
    { label: "Campanhas", size: "12 MB" },
    { label: "Mapas", size: "18 MB" },
    { label: "Imagens de retrato", size: "8 MB" },
    { label: "Histórico de chat", size: "4 MB" },
    { label: "Cache", size: "3 MB" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-white">Dados e Armazenamento</h2>
        <p className="mt-1 text-sm text-gray-500">Espaço usado, exportação, importação e reset.</p>
      </div>

      <SettingsSection title="Armazenamento Local">
        <div className="mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Espaço usado</span>
            <span className="text-white">45 MB / 500 MB</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-brand-accent" style={{ width: "9%" }} />
          </div>
          <span className="text-xs text-gray-600">9%</span>
        </div>
        <div className="space-y-1">
          {storageItems.map((item) => (
            <div key={item.label} className="flex justify-between py-1 text-sm">
              <span className="text-gray-400">{item.label}</span>
              <span className="font-mono text-xs text-gray-500">{item.size}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button className="rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10">
            Limpar cache
          </button>
          <button className="rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10">
            Limpar chat antigo (&gt; 30 dias)
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Exportar Dados">
        <div className="space-y-2">
          <ExportButton label="Exportar todas as campanhas (.json)" />
          <ExportButton label="Exportar personagens (.json)" />
          <ExportButton label="Exportar mapas (.json + imagens)" />
          <ExportButton label="Exportar tudo (.zip)" />
        </div>
      </SettingsSection>

      <SettingsSection title="Importar Dados">
        <div className="space-y-2">
          <ImportButton label="Importar campanha (.json)" />
          <ImportButton label="Importar personagem (.json)" />
          <ImportButton label="Importar mapa (.json)" />
        </div>
      </SettingsSection>

      <SettingsSection title="Reset">
        <div className="space-y-3">
          <button
            onClick={resetAll}
            className="flex w-full items-center gap-2 rounded-lg border border-brand-warning/20 bg-brand-warning/5 px-4 py-2.5 text-sm text-brand-warning hover:bg-brand-warning/10"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar configurações padrão
          </button>
          <button className="flex w-full items-center gap-2 rounded-lg border border-brand-danger/20 bg-brand-danger/5 px-4 py-2.5 text-sm text-brand-danger hover:bg-brand-danger/10">
            <Trash2 className="h-4 w-4" />
            Apagar todos os dados locais
          </button>
          <p className="text-xs text-gray-600">Esta ação é irreversível.</p>
        </div>
      </SettingsSection>
    </div>
  );
}

function ExportButton({ label }: { label: string }) {
  return (
    <button className="flex w-full items-center gap-2 rounded-lg bg-white/5 px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/10">
      <Download className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

function ImportButton({ label }: { label: string }) {
  return (
    <button className="flex w-full items-center gap-2 rounded-lg bg-white/5 px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/10">
      <Upload className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}
