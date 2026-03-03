import { MessageSquare, Send, Hash, Lock, Users } from "lucide-react";

const CHANNELS = [
  { id: "general", name: "Geral", icon: Hash, unread: 3 },
  { id: "in-character", name: "In-Character", icon: Users, unread: 0 },
  { id: "gm-only", name: "Só GM", icon: Lock, unread: 1 },
];

const MESSAGES = [
  { id: "1", sender: "Maria Santos", content: "Elara examina a porta com cuidado...", time: "14:32", channel: "in-character" },
  { id: "2", sender: "Sistema", content: "Maria rolou 1d20+5 → 18 (Percepção)", time: "14:33", channel: "general", isSystem: true },
  { id: "3", sender: "João (GM)", content: "A porta parece estar trancada, mas você nota marcas estranhas ao redor da fechadura.", time: "14:34", channel: "general" },
  { id: "4", sender: "Pedro Costa", content: "Thorin puxa seu machado e diz: 'Deixa comigo!'", time: "14:35", channel: "in-character" },
];

export default function ChatPage() {
  return (
    <div className="flex h-full gap-4">
      {/* Channel Sidebar */}
      <div className="w-56 rounded-xl border border-white/10 bg-brand-surface p-3">
        <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Canais
        </h3>
        <div className="space-y-0.5">
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            return (
              <button
                key={ch.id}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  ch.id === "general"
                    ? "bg-brand-accent/15 text-brand-accent"
                    : "text-gray-400 hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{ch.name}</span>
                {ch.unread > 0 && (
                  <span className="rounded-full bg-brand-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {ch.unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col rounded-xl border border-white/10 bg-brand-surface">
        <div className="border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-white">Geral</span>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {MESSAGES.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.isSystem ? "opacity-70" : ""}`}>
              <div className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-white/10" />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-white">{msg.sender}</span>
                  <span className="text-xs text-gray-500">{msg.time}</span>
                </div>
                <p className={`mt-0.5 text-sm ${msg.isSystem ? "italic text-gray-400" : "text-gray-300"}`}>
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-2.5">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Enviar mensagem..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            />
            <button className="rounded-lg bg-brand-accent p-1.5 text-white hover:bg-brand-accent/80">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
