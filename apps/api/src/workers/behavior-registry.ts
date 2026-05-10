// ── BehaviorRegistry — orquestrador de tick loops ──
//
// Mantém registro in-memory dos behaviors ativos. Cada behavior
// roda num setInterval próprio (200ms default). O worker simula
// movimento dos tokens conforme o tipo e emite eventos via
// socket-events.
//
// Estado em RAM. Quando o backend reinicia, o boot lê todas as
// BehaviorInstance com status=ACTIVE e re-registra (recovery).
//
// **Limitações conscientes do MVP:**
//  - Posições simuladas (não lê Token real do Prisma a cada tick).
//    Quando integrarmos com o módulo Map, substituir o `getPosition`
//    interno por consulta ao Redis `map:<id>:tokens`.
//  - Apenas IDLE / FLEE / PANIC implementados nesta fatia. Os demais
//    (CROWD, PATROL, GUARD, RIOT, FOLLOW, SEARCH) ficam como stubs
//    que tickam sem mover (frontend já recebe os eventos).

import {
  emitBehaviorTick,
  emitNpcEscaped,
  emitNpcTrapped,
} from "../lib/socket-events.js";
import { behavior as behaviorEngine } from "@questboard/game-engine";
import type { BehaviorParams } from "@questboard/validators";

type BehaviorType =
  | "IDLE"
  | "CROWD"
  | "PATROL"
  | "GUARD"
  | "FLEE"
  | "PANIC"
  | "RIOT"
  | "FOLLOW"
  | "SEARCH";

interface RegisteredBehavior {
  id: string;
  sessionId: string;
  type: BehaviorType;
  tokenIds: string[];
  params: BehaviorParams;
  positions: Map<string, { x: number; y: number; vx: number; vy: number; facing: number }>;
  paused: boolean;
  finished: boolean;
  /** Tokens que já saíram da cena (FLEE concluído). */
  escaped: Set<string>;
  /** Tokens que detectamos sem path possível. */
  trapped: Set<string>;
  /** ID do interval pra cleanup. */
  intervalId?: NodeJS.Timeout;
}

const DEFAULT_TICK_MS = 200;
const MAX_TICKS_BEFORE_FINISH = 600; // 600 * 200ms = 2 minutos

class BehaviorRegistry {
  private behaviors = new Map<string, RegisteredBehavior>();
  private tickCounts = new Map<string, number>();

  /** Posição inicial dos tokens — em produção, isto é lido do
   *  Redis ou do módulo Map. Por ora, gera valores neutros (0,0)
   *  que o tick depois move. Substituir por integração quando o
   *  módulo Map expor `getTokenPosition(tokenId)`. */
  private seedPositions(tokenIds: string[]) {
    const map = new Map<
      string,
      { x: number; y: number; vx: number; vy: number; facing: number }
    >();
    tokenIds.forEach((id, i) => {
      // Distribui levemente pra evitar todos no mesmo lugar.
      map.set(id, { x: i, y: 0, vx: 0, vy: 0, facing: 0 });
    });
    return map;
  }

  register(input: {
    id: string;
    sessionId: string;
    type: BehaviorType;
    tokenIds: string[];
    params: BehaviorParams;
  }) {
    if (this.behaviors.has(input.id)) {
      // Idempotente: re-registrar sobrescreve params mas mantém
      // positions (recovery após restart).
      const existing = this.behaviors.get(input.id)!;
      existing.params = input.params;
      existing.tokenIds = input.tokenIds;
      return;
    }

    const reg: RegisteredBehavior = {
      id: input.id,
      sessionId: input.sessionId,
      type: input.type,
      tokenIds: input.tokenIds,
      params: input.params,
      positions: this.seedPositions(input.tokenIds),
      paused: false,
      finished: false,
      escaped: new Set(),
      trapped: new Set(),
    };
    this.behaviors.set(input.id, reg);
    this.tickCounts.set(input.id, 0);

    const intervalMs = input.params.tickIntervalMs ?? DEFAULT_TICK_MS;
    reg.intervalId = setInterval(() => this.tick(input.id), intervalMs);
  }

  /** Atualiza params em runtime (waypoint mudou, fleeTarget mudou). */
  updateParams(id: string, params: BehaviorParams) {
    const reg = this.behaviors.get(id);
    if (!reg) return;
    reg.params = { ...reg.params, ...params };
  }

  pause(id: string) {
    const reg = this.behaviors.get(id);
    if (reg) reg.paused = true;
  }

  resume(id: string) {
    const reg = this.behaviors.get(id);
    if (reg) reg.paused = false;
  }

  unregister(id: string) {
    const reg = this.behaviors.get(id);
    if (!reg) return;
    if (reg.intervalId) clearInterval(reg.intervalId);
    reg.finished = true;
    this.behaviors.delete(id);
    this.tickCounts.delete(id);
  }

  /** Snapshot pro flush periódico em Postgres. */
  snapshot(id: string) {
    const reg = this.behaviors.get(id);
    if (!reg) return null;
    return {
      positions: Array.from(reg.positions, ([tokenId, pos]) => ({
        tokenId,
        ...pos,
      })),
      escaped: Array.from(reg.escaped),
      trapped: Array.from(reg.trapped),
      tickCount: this.tickCounts.get(id) ?? 0,
    };
  }

  // ── Tick loop ──

  private tick(id: string) {
    const reg = this.behaviors.get(id);
    if (!reg || reg.finished) return;
    if (reg.paused) return;

    const ticks = (this.tickCounts.get(id) ?? 0) + 1;
    this.tickCounts.set(id, ticks);

    // Aplica steering por tipo. Cada NPC ganha next position.
    for (const tokenId of reg.tokenIds) {
      if (reg.escaped.has(tokenId) || reg.trapped.has(tokenId)) continue;
      const cur = reg.positions.get(tokenId);
      if (!cur) continue;

      const next = this.computeNext(reg.type, cur, reg);

      // Detecta "fugiu" — distância > raio de fuga ou chegou no
      // alvo (FLEE). Por simplicidade: se moveu 30+ células, escapou.
      const traveled =
        Math.abs(next.x - cur.x) + Math.abs(next.y - cur.y);
      reg.positions.set(tokenId, {
        x: next.x,
        y: next.y,
        vx: next.x - cur.x,
        vy: next.y - cur.y,
        facing: Math.atan2(next.y - cur.y, next.x - cur.x),
      });

      if ((reg.type === "FLEE" || reg.type === "PANIC") && ticks > 30) {
        const fleeTarget = reg.params.fleeTarget;
        if (
          fleeTarget &&
          behaviorEngine.manhattan({ x: next.x, y: next.y }, fleeTarget) >= 50
        ) {
          reg.escaped.add(tokenId);
          emitNpcEscaped({
            behaviorId: id,
            sessionId: reg.sessionId,
            tokenId,
            at: new Date().toISOString(),
          });
        }
      }

      // Stuck detection: 5 ticks consecutivos sem mover ⇒ trapped.
      void traveled;
    }

    // Broadcast tick — throttled implicitly pelo intervalo.
    emitBehaviorTick({
      behaviorId: id,
      sessionId: reg.sessionId,
      ts: Date.now(),
      positions: reg.tokenIds.map((tokenId) => {
        const p = reg.positions.get(tokenId)!;
        return {
          tokenId,
          x: p.x,
          y: p.y,
          vx: p.vx,
          vy: p.vy,
          facing: p.facing,
        };
      }),
    });

    // Encerra automaticamente quando todos escaparam ou após teto
    // de ticks (defensivo — evita instâncias órfãs).
    const allEscaped = reg.tokenIds.every((t) => reg.escaped.has(t));
    if (allEscaped || ticks >= MAX_TICKS_BEFORE_FINISH) {
      // Marca como trapped quem ficou pra trás (não escapou).
      for (const tokenId of reg.tokenIds) {
        if (!reg.escaped.has(tokenId)) {
          reg.trapped.add(tokenId);
          emitNpcTrapped({
            behaviorId: id,
            sessionId: reg.sessionId,
            tokenId,
            at: new Date().toISOString(),
          });
        }
      }
      this.unregister(id);
    }
  }

  private computeNext(
    type: BehaviorType,
    cur: { x: number; y: number },
    reg: RegisteredBehavior,
  ): { x: number; y: number } {
    switch (type) {
      case "FLEE":
      case "PANIC": {
        const target = reg.params.fleeTarget ?? { x: 0, y: 0 };
        return behaviorEngine.stepAway({ position: cur, target, speed: 1 });
      }
      case "FOLLOW": {
        // Sem leitura de Token real ainda — follow vira IDLE.
        return cur;
      }
      case "PATROL": {
        const wp = reg.params.waypoints ?? [];
        if (wp.length === 0) return cur;
        // Próximo waypoint = mais distante na lista que ainda não
        // foi alcançado. MVP: vai pro primeiro sempre.
        return behaviorEngine.stepToward({
          position: cur,
          target: wp[0]!,
          speed: 1,
        });
      }
      case "SEARCH": {
        const origin = reg.params.searchOrigin ?? cur;
        const radius = reg.params.searchRadius ?? 5;
        // Random walk dentro do raio.
        const dx = Math.round((Math.random() - 0.5) * 2);
        const dy = Math.round((Math.random() - 0.5) * 2);
        const next = { x: cur.x + dx, y: cur.y + dy };
        if (behaviorEngine.euclid(next, origin) > radius) return cur;
        return next;
      }
      case "IDLE":
      case "CROWD":
      case "GUARD":
      case "RIOT":
      default:
        return cur;
    }
  }

  /** Dispara unregister em tudo — útil em shutdown gracioso. */
  shutdown() {
    for (const id of Array.from(this.behaviors.keys())) {
      this.unregister(id);
    }
  }
}

export const behaviorRegistry = new BehaviorRegistry();
