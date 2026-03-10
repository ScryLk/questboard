import type { Server as SocketIOServer } from "socket.io";
import { socketAuthMiddleware } from "./middleware.js";
import { registerSessionHandler } from "./handlers/session.js";
import { registerMapHandler } from "./handlers/map.js";
import { registerTokenHandler } from "./handlers/token.js";
import { registerFogHandler } from "./handlers/fog.js";
import { registerCombatHandler } from "./handlers/combat.js";
import { registerChatHandler } from "./handlers/chat.js";
import { registerAudioHandler } from "./handlers/audio.js";
import { registerPhaseHandler } from "./handlers/phase.js";

export function registerSocketHandlers(io: SocketIOServer): void {
  const sessionNsp = io.of("/session");

  sessionNsp.use(socketAuthMiddleware);

  sessionNsp.on("connection", (socket) => {
    registerSessionHandler(sessionNsp, socket);
    registerMapHandler(sessionNsp, socket);
    registerTokenHandler(sessionNsp, socket);
    registerFogHandler(sessionNsp, socket);
    registerCombatHandler(sessionNsp, socket);
    registerChatHandler(sessionNsp, socket);
    registerAudioHandler(sessionNsp, socket);
    registerPhaseHandler(sessionNsp, socket);
  });
}
