"use client";

// Chat global da campanha ativa. Resolve a "sessão mais ativa" da
// campanha (prioridade LIVE > PAUSED > LOBBY > IDLE > ENDED), lista
// mensagens via REST e escuta `chat:message` no socket pra updates
// em tempo real.

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Hash,
  Lock,
  Loader2,
  MessageSquare,
  Send,
  Users,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useCampaignStore } from "@/lib/campaign-store";
import {
  type ChatChannel,
  type ChatMessage,
  type RecentSessionDto,
  getRecentSession,
  listMessages,
  sendMessage,
} from "@/lib/chat-api";
import { joinSession, subscribe } from "@/lib/session-socket";

const CHANNELS: {
  id: ChatChannel;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "GENERAL", name: "Geral", icon: Hash },
  { id: "IN_CHARACTER", name: "In-Character", icon: Users },
  { id: "GM_ONLY", name: "Só GM", icon: Lock },
];

export default function ChatPage() {
  const { user } = useUser();
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);

  const [session, setSession] = useState<RecentSessionDto | null>(null);
  const [activeChannel, setActiveChannel] = useState<ChatChannel>("GENERAL");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<"no-campaign" | "no-session" | "forbidden" | "other" | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Resolve sessão da campanha ativa.
  useEffect(() => {
    if (!activeCampaignId) {
      setSessionError("no-campaign");
      setSession(null);
      return;
    }
    let cancelled = false;
    setSessionError(null);
    void getRecentSession(activeCampaignId)
      .then((s) => {
        if (!cancelled) setSession(s);
      })
      .catch((err) => {
        if (cancelled) return;
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404) setSessionError("no-session");
        else if (status === 403) setSessionError("forbidden");
        else setSessionError("other");
        setSession(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCampaignId]);

  // Carrega mensagens do canal ativo.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void listMessages(session.id, { channel: activeChannel, limit: 50 })
      .then((r) => {
        if (!cancelled) {
          setMessages(r.messages);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError((err as { message?: string }).message ?? "Falha ao carregar.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session, activeChannel]);

  // Socket bridge — escuta novas mensagens em tempo real.
  useEffect(() => {
    if (!session) return;
    let cleanedUp = false;
    const cleanups: Array<() => void> = [];
    (async () => {
      try {
        await joinSession(session.id);
        if (cleanedUp) return;
        cleanups.push(
          subscribe<{ sessionId: string; message: ChatMessage }>(
            "chat:message",
            (payload) => {
              if (payload.sessionId !== session.id) return;
              if (payload.message.channel !== activeChannel) return;
              setMessages((prev) => {
                // Dedup pelo id (caso optimistic add já tenha colocado).
                if (prev.some((m) => m.id === payload.message.id)) return prev;
                return [...prev, payload.message];
              });
            },
          ),
        );
      } catch {
        // Falha ao conectar — chat segue funcional via REST poll manual.
      }
    })();
    return () => {
      cleanedUp = true;
      cleanups.forEach((fn) => fn());
    };
  }, [session, activeChannel]);

  // Auto-scroll pro fim quando novas msgs chegam.
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  async function handleSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session || sending) return;
    const content = input.trim();
    if (!content) return;
    setSending(true);
    setError(null);
    try {
      const msg = await sendMessage(session.id, {
        content,
        channel: activeChannel,
      });
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setInput("");
    } catch (err) {
      setError(
        (err as { message?: string }).message ?? "Falha ao enviar mensagem.",
      );
    } finally {
      setSending(false);
    }
  }

  // Empty states
  if (sessionError === "no-campaign") {
    return <EmptyState title="Nenhuma campanha ativa" hint="Selecione uma campanha pra ver o chat." cta={{ href: "/campaigns", label: "Ver campanhas" }} />;
  }
  if (sessionError === "no-session") {
    return <EmptyState title="Nenhuma sessão nesta campanha" hint="O chat aparece quando a campanha tem ao menos uma sessão criada." cta={{ href: "/dashboard", label: "Voltar ao dashboard" }} />;
  }
  if (sessionError === "forbidden") {
    return <EmptyState title="Sem acesso" hint="Você não é membro desta campanha." />;
  }
  if (sessionError === "other") {
    return <EmptyState title="Erro" hint="Não foi possível carregar a sessão." />;
  }

  return (
    <div className="flex h-full gap-4">
      {/* Sidebar de canais */}
      <div className="w-56 shrink-0 rounded-xl border border-white/10 bg-brand-surface p-3">
        <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Canais
        </h3>
        <div className="space-y-0.5">
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            const isActive = ch.id === activeChannel;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => setActiveChannel(ch.id)}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-brand-accent/15 text-brand-accent"
                    : "text-gray-400 hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{ch.name}</span>
              </button>
            );
          })}
        </div>

        {session && (
          <div className="mt-4 border-t border-white/5 pt-3">
            <p className="px-2 text-[10px] uppercase tracking-wider text-gray-600">
              Sessão atual
            </p>
            <p className="mt-1 truncate px-2 text-xs text-brand-text">
              {session.name}
            </p>
            <p className="mt-0.5 px-2 text-[10px] text-brand-muted">
              {session.status}
            </p>
          </div>
        )}
      </div>

      {/* Chat principal */}
      <div className="flex flex-1 flex-col rounded-xl border border-white/10 bg-brand-surface">
        <div className="border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-white">
              {CHANNELS.find((c) => c.id === activeChannel)?.name}
            </span>
          </div>
        </div>

        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-brand-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando...
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-brand-muted">
              Nenhuma mensagem neste canal ainda.
            </p>
          ) : (
            messages.map((msg) => {
              const isSystem = msg.contentType === "SYSTEM";
              const isMine = user?.id && msg.user.id === user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isSystem ? "opacity-70" : ""}`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-xs font-semibold text-brand-muted">
                    {msg.user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={msg.user.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      msg.user.displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-white">
                        {msg.characterName ?? msg.user.displayName}
                        {isMine && (
                          <span className="ml-1 text-[10px] text-brand-muted">
                            (você)
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p
                      className={`mt-0.5 break-words text-sm ${
                        isSystem ? "italic text-gray-400" : "text-gray-300"
                      }`}
                    >
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {error && (
          <div className="border-t border-rose-500/30 bg-rose-500/5 px-5 py-2 text-[11px] text-rose-300">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSend}
          className="border-t border-white/10 p-4"
        >
          <div className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-2.5">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeChannel === "GM_ONLY"
                  ? "Mensagem privada para o GM e CO_GMs..."
                  : activeChannel === "IN_CHARACTER"
                    ? "Falar como personagem..."
                    : "Enviar mensagem..."
              }
              disabled={sending}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="cursor-pointer rounded-lg bg-brand-accent p-1.5 text-white hover:bg-brand-accent/80 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Enviar"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  hint,
  cta,
}: {
  title: string;
  hint: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-md rounded-xl border border-dashed border-brand-border bg-brand-surface/50 p-8 text-center">
        <MessageSquare className="mx-auto mb-3 h-8 w-8 text-brand-muted" />
        <p className="text-base font-medium text-brand-text">{title}</p>
        <p className="mt-2 text-sm text-brand-muted">{hint}</p>
        {cta && (
          <Link
            href={cta.href}
            className="mt-4 inline-flex cursor-pointer rounded-lg bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accent-hover"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </div>
  );
}
