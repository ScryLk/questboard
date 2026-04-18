"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

const CHANNEL_NAME = "questboard-tab-guard";
const HEARTBEAT_INTERVAL = 2000;

interface DuplicateTabGuardProps {
  sessionCode: string;
}

export function DuplicateTabGuard({ sessionCode }: DuplicateTabGuardProps) {
  const [isDuplicate, setIsDuplicate] = useState(false);
  const tabId = useState(() => `tab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`)[0];

  useEffect(() => {
    if (!sessionCode) return;

    const channel = new BroadcastChannel(CHANNEL_NAME);

    channel.postMessage({ type: "tab:announce", tabId, sessionCode, timestamp: Date.now() });

    channel.onmessage = (event) => {
      const msg = event.data;
      if (msg.sessionCode !== sessionCode) return;

      if (msg.type === "tab:announce" && msg.tabId !== tabId) {
        if (msg.timestamp > Date.now() - 500) {
          channel.postMessage({ type: "tab:already-active", tabId, sessionCode, targetTabId: msg.tabId });
        }
      }

      if (msg.type === "tab:already-active" && msg.targetTabId === tabId) {
        setIsDuplicate(true);
      }
    };

    const interval = setInterval(() => {
      channel.postMessage({ type: "tab:heartbeat", tabId, sessionCode });
    }, HEARTBEAT_INTERVAL);

    return () => {
      clearInterval(interval);
      channel.postMessage({ type: "tab:close", tabId, sessionCode });
      channel.close();
    };
  }, [sessionCode, tabId]);

  if (!isDuplicate) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0F]/95">
      <div className="max-w-sm rounded-xl border border-[#E17055]/30 bg-[#111116] p-6 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-[#E17055]" />
        <h2 className="mt-4 text-lg font-bold text-white">Aba duplicada</h2>
        <p className="mt-2 text-sm text-white/50">
          Esta sessão já está aberta em outra aba. Use a aba original para evitar
          conflitos e duplicação de eventos.
        </p>
        <button
          onClick={() => window.close()}
          className="mt-4 w-full rounded-lg bg-[#E17055] py-2 text-sm font-medium text-white"
        >
          Fechar esta aba
        </button>
        <button
          onClick={() => setIsDuplicate(false)}
          className="mt-2 w-full rounded-lg border border-white/10 py-2 text-sm text-white/40"
        >
          Continuar mesmo assim
        </button>
      </div>
    </div>
  );
}
