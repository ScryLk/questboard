// ── Socket.IO client wrapper para o namespace `/session` ──
//
// O backend (apps/api) registra os handlers de sessão (token, fog,
// combat, npc:*) no namespace `/session`. Este módulo abre uma
// conexão sob demanda, autentica via Bearer (Clerk) e expõe
// `subscribeToSession` para escutar eventos.
//
// Singleton — uma conexão por aba do navegador. Reconnect padrão do
// Socket.IO. `disconnect()` derruba o socket explicitamente.

import { io, type Socket } from "socket.io-client";

const DEFAULT_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:3001";

let socket: Socket | null = null;

async function defaultGetToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  type ClerkLike = {
    loaded?: boolean;
    session?: { getToken?: () => Promise<string | null> };
  };
  const win = window as unknown as { Clerk?: ClerkLike };
  // Polling até 3s — handshake do socket pode disparar antes do
  // ClerkProvider terminar de montar, especialmente em hot-reload.
  for (let i = 0; i < 30; i++) {
    const clerk = win.Clerk;
    if (clerk?.loaded && clerk.session?.getToken) {
      try {
        return (await clerk.session.getToken()) ?? null;
      } catch {
        return null;
      }
    }
    if (clerk?.loaded && !clerk.session) return null;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return null;
}

export interface SessionSocketConfig {
  url?: string;
  getToken?: () => Promise<string | null>;
}

/** Retorna o socket ativo no namespace `/session` (cria sob demanda). */
export function getSessionSocket(config?: SessionSocketConfig): Socket {
  if (socket) return socket;
  const url = config?.url ?? DEFAULT_URL;
  const getToken = config?.getToken ?? defaultGetToken;

  socket = io(`${url}/session`, {
    autoConnect: false,
    transports: ["websocket"],
    auth: async (cb) => {
      const token = await getToken();
      cb({ token });
    },
  });

  return socket;
}

/** Conecta o socket (no-op se já conectado). Junta-se à sala da sessão. */
export async function joinSession(sessionId: string): Promise<Socket> {
  const s = getSessionSocket();
  if (!s.connected) {
    await new Promise<void>((resolve, reject) => {
      const onConnect = () => {
        s.off("connect", onConnect);
        s.off("connect_error", onError);
        resolve();
      };
      const onError = (err: Error) => {
        s.off("connect", onConnect);
        s.off("connect_error", onError);
        reject(err);
      };
      s.on("connect", onConnect);
      s.on("connect_error", onError);
      s.connect();
    });
  }
  s.emit("session:join", sessionId);
  return s;
}

export function leaveSession(): void {
  if (!socket) return;
  socket.emit("session:leave");
}

export function disconnectSessionSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/** Helper tipado pra subscrever evento + retornar cleanup function. */
export function subscribe<T>(
  event: string,
  listener: (payload: T) => void,
): () => void {
  const s = getSessionSocket();
  s.on(event, listener as (...args: unknown[]) => void);
  return () => {
    s.off(event, listener as (...args: unknown[]) => void);
  };
}
