"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/lib/settings-store";
import { SettingsSection } from "../controls";
import { Download, Upload, Trash2, RotateCcw } from "lucide-react";

// Chaves de localStorage que pertencem ao QuestBoard. Atualizar quando
// novas stores forem persistidas — caso contrário "Apagar tudo" não vai
// limpar de fato.
const LOCAL_STORAGE_PREFIXES = [
  "questboard-",
  "settings-store",
  "gameplay-store",
  "campaign-store",
  "profile-store",
  "player-view-store",
  "notes-store",
  "world-store",
  "media-broadcast",
];

function bytesToHuman(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

/** Soma o tamanho das chaves do localStorage que pertencem ao app. */
function measureLocalStorage(): { total: number; byPrefix: Record<string, number> } {
  if (typeof localStorage === "undefined") return { total: 0, byPrefix: {} };
  let total = 0;
  const byPrefix: Record<string, number> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const matchedPrefix = LOCAL_STORAGE_PREFIXES.find((p) => key.startsWith(p));
    if (!matchedPrefix) continue;
    const size = (localStorage.getItem(key)?.length ?? 0) + key.length;
    total += size;
    byPrefix[matchedPrefix] = (byPrefix[matchedPrefix] ?? 0) + size;
  }
  return { total, byPrefix };
}

function clearAppLocalStorage(): number {
  if (typeof localStorage === "undefined") return 0;
  let cleared = 0;
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (LOCAL_STORAGE_PREFIXES.some((p) => key.startsWith(p))) {
      toRemove.push(key);
    }
  }
  for (const key of toRemove) {
    cleared += (localStorage.getItem(key)?.length ?? 0) + key.length;
    localStorage.removeItem(key);
  }
  return cleared;
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Snapshot do localStorage que pertence ao app, pra export. */
function buildExportPayload(): Record<string, unknown> {
  const out: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    version: 1,
    data: {},
  };
  const data = out.data as Record<string, unknown>;
  if (typeof localStorage === "undefined") return out;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (!LOCAL_STORAGE_PREFIXES.some((p) => key.startsWith(p))) continue;
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      data[key] = raw;
    }
  }
  return out;
}

async function importFromFile(): Promise<{ keys: number } | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const text = await file.text();
      try {
        const parsed = JSON.parse(text) as {
          data?: Record<string, unknown>;
        };
        const data = parsed.data ?? {};
        let count = 0;
        for (const [key, value] of Object.entries(data)) {
          if (!LOCAL_STORAGE_PREFIXES.some((p) => key.startsWith(p))) continue;
          localStorage.setItem(
            key,
            typeof value === "string" ? value : JSON.stringify(value),
          );
          count++;
        }
        resolve({ keys: count });
      } catch {
        resolve(null);
      }
    };
    input.click();
  });
}

export function StorageSection() {
  const { resetAll } = useSettingsStore();
  const [stats, setStats] = useState<{ total: number; byPrefix: Record<string, number> }>(
    { total: 0, byPrefix: {} },
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setStats(measureLocalStorage());
  }, []);

  function refresh() {
    setStats(measureLocalStorage());
  }

  function flash(msg: string) {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 2500);
  }

  // Quota estimada (5 MB padrão browser; conservador).
  const QUOTA = 5 * 1024 * 1024;
  const pct = Math.min(100, Math.round((stats.total / QUOTA) * 100));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-white">
            Dados e Armazenamento
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Espaço usado, exportação, importação e reset.
          </p>
        </div>
        {statusMessage && (
          <span className="text-[11px] text-emerald-300">{statusMessage}</span>
        )}
      </div>

      <SettingsSection title="Armazenamento Local">
        <div className="mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Espaço usado</span>
            <span className="text-white">
              {bytesToHuman(stats.total)} / {bytesToHuman(QUOTA)}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-brand-accent"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-gray-600">{pct}%</span>
        </div>
        <div className="space-y-1">
          {Object.entries(stats.byPrefix)
            .sort((a, b) => b[1] - a[1])
            .map(([prefix, size]) => (
              <div key={prefix} className="flex justify-between py-1 text-sm">
                <span className="text-gray-400">{prefix}</span>
                <span className="font-mono text-xs text-gray-500">
                  {bytesToHuman(size)}
                </span>
              </div>
            ))}
          {Object.keys(stats.byPrefix).length === 0 && (
            <p className="py-1 text-xs text-gray-500">
              Sem dados locais armazenados.
            </p>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              const freed = clearAppLocalStorage();
              refresh();
              flash(`Liberou ${bytesToHuman(freed)}`);
            }}
            className="cursor-pointer rounded-lg bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
          >
            Limpar cache local
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Exportar Dados">
        <p className="mb-2 text-[11px] text-brand-muted">
          Baixa um JSON com toda sua configuração local (settings,
          campanhas em rascunho, perfil). Não inclui dados do servidor.
        </p>
        <button
          type="button"
          onClick={() => {
            const stamp = new Date().toISOString().slice(0, 10);
            downloadJson(`questboard-export-${stamp}.json`, buildExportPayload());
            flash("Export gerado");
          }}
          className="flex w-full cursor-pointer items-center gap-2 rounded-lg bg-white/5 px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/10"
        >
          <Download className="h-4 w-4 shrink-0" />
          Exportar configurações (.json)
        </button>
      </SettingsSection>

      <SettingsSection title="Importar Dados">
        <p className="mb-2 text-[11px] text-brand-muted">
          Restaura um JSON exportado anteriormente. Sobrescreve as
          configurações atuais.
        </p>
        <button
          type="button"
          onClick={async () => {
            const r = await importFromFile();
            if (r) {
              refresh();
              flash(`${r.keys} chaves importadas — recarregue a página`);
            } else {
              flash("Arquivo inválido");
            }
          }}
          className="flex w-full cursor-pointer items-center gap-2 rounded-lg bg-white/5 px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/10"
        >
          <Upload className="h-4 w-4 shrink-0" />
          Importar configurações (.json)
        </button>
      </SettingsSection>

      <SettingsSection title="Reset">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              if (!confirm("Restaurar configurações padrão?")) return;
              resetAll();
              flash("Configurações resetadas");
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-brand-warning/20 bg-brand-warning/5 px-4 py-2.5 text-sm text-brand-warning hover:bg-brand-warning/10"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar configurações padrão
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                !confirm(
                  "Apagar TODOS os dados locais? Isso inclui settings, campanhas em rascunho e estado de sessões. Esta ação é irreversível.",
                )
              )
                return;
              const freed = clearAppLocalStorage();
              refresh();
              flash(`Apagou ${bytesToHuman(freed)} — recarregando...`);
              setTimeout(() => window.location.reload(), 800);
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-brand-danger/20 bg-brand-danger/5 px-4 py-2.5 text-sm text-brand-danger hover:bg-brand-danger/10"
          >
            <Trash2 className="h-4 w-4" />
            Apagar todos os dados locais
          </button>
          <p className="text-xs text-gray-600">
            Esta ação não toca em dados no servidor — apenas localStorage do navegador.
          </p>
        </div>
      </SettingsSection>
    </div>
  );
}
