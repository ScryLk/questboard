import type { NpcState, BehaviorConfig } from "./npc-behavior-types";

const TICK_MS = 150;
const cellsPerTick = (speed: number) => speed * (TICK_MS / 1000);

function seek(
  npc: NpcState,
  target: { x: number; y: number },
  speed: number,
): { fx: number; fy: number } {
  const dx = target.x - npc.x;
  const dy = target.y - npc.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.1) return { fx: 0, fy: 0 };
  const s = cellsPerTick(speed);
  return { fx: (dx / dist) * s, fy: (dy / dist) * s };
}

function flee(
  npc: NpcState,
  threat: { x: number; y: number },
  speed: number,
): { fx: number; fy: number } {
  const s = seek(npc, threat, speed);
  return { fx: -s.fx, fy: -s.fy };
}

function separate(
  npc: NpcState,
  others: NpcState[],
  radius: number,
): { fx: number; fy: number } {
  let fx = 0;
  let fy = 0;
  let count = 0;
  for (const other of others) {
    if (other.tokenId === npc.tokenId) continue;
    const dx = npc.x - other.x;
    const dy = npc.y - other.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0 && dist < radius) {
      fx += (dx / dist) * (radius - dist);
      fy += (dy / dist) * (radius - dist);
      count++;
    }
  }
  return count > 0
    ? { fx: (fx / count) * 0.5, fy: (fy / count) * 0.5 }
    : { fx: 0, fy: 0 };
}

function randomPerturbation(chaos: number): { fx: number; fy: number } {
  const angle = Math.random() * Math.PI * 2;
  return {
    fx: Math.cos(angle) * chaos * 0.3,
    fy: Math.sin(angle) * chaos * 0.3,
  };
}

function avoidWalls(
  x: number,
  y: number,
  vx: number,
  vy: number,
  walls: Set<string>,
): { fx: number; fy: number } {
  const nx = Math.round(x + vx);
  const ny = Math.round(y + vy);
  if (walls.has(`${nx},${ny}`)) {
    return {
      fx: -vx * 0.8 + (Math.random() - 0.5) * 0.5,
      fy: -vy * 0.8 + (Math.random() - 0.5) * 0.5,
    };
  }
  return { fx: 0, fy: 0 };
}

export function computeNextState(
  npc: NpcState,
  others: NpcState[],
  config: BehaviorConfig,
  tick: number,
): NpcState {
  let fx = 0;
  let fy = 0;

  switch (config.type) {
    case "FLEE": {
      if (!config.target) break;
      const f = flee(npc, config.target, config.speed);
      const s = separate(npc, others, config.separationRadius);
      const p = randomPerturbation(config.chaosCoefficient);
      fx = f.fx + s.fx * 0.8 + p.fx;
      fy = f.fy + s.fy * 0.8 + p.fy;
      break;
    }

    case "PANIC": {
      const changeDirEvery = 2;
      const shouldChange =
        tick % changeDirEvery === 0 || (npc.vx === 0 && npc.vy === 0);
      const dir = shouldChange
        ? randomPerturbation(1.0)
        : { fx: npc.vx, fy: npc.vy };
      const s = separate(npc, others, config.separationRadius);
      const p = randomPerturbation(config.chaosCoefficient);
      const spd = cellsPerTick(config.speed * (0.5 + Math.random() * 0.8));
      const mag = Math.hypot(dir.fx, dir.fy) || 1;
      fx = (dir.fx / mag) * spd + s.fx * 0.6 + p.fx;
      fy = (dir.fy / mag) * spd + s.fy * 0.6 + p.fy;
      break;
    }

    case "RIOT": {
      if (!config.target) break;
      if (npc.role === "LEADER") {
        const f = seek(npc, config.target, config.speed * 1.2);
        const s = separate(npc, others, config.separationRadius * 0.7);
        fx = f.fx + s.fx * 0.4;
        fy = f.fy + s.fy * 0.4;
      } else if (npc.role === "MEMBER") {
        const leader = others.find((o) => o.role === "LEADER");
        if (leader) {
          const f = seek(npc, leader, config.speed * 0.9);
          const s = separate(npc, others, config.separationRadius);
          fx = f.fx + s.fx * 0.5;
          fy = f.fy + s.fy * 0.5;
        }
      } else {
        const p = randomPerturbation(config.chaosCoefficient);
        const s = separate(npc, others, config.separationRadius);
        fx = p.fx * 2 + s.fx * 0.3;
        fy = p.fy * 2 + s.fy * 0.3;
      }
      break;
    }

    case "CROWD": {
      const center = others.reduce(
        (acc, o) => ({
          x: acc.x + o.x / others.length,
          y: acc.y + o.y / others.length,
        }),
        { x: 0, y: 0 },
      );
      const cohesion = seek(npc, center, config.speed * 0.3);
      const sep = separate(npc, others, config.separationRadius);
      const p = randomPerturbation(0.05);
      fx = cohesion.fx + sep.fx * 0.9 + p.fx;
      fy = cohesion.fy + sep.fy * 0.9 + p.fy;
      break;
    }

    case "FOLLOW": {
      if (!config.target) break;
      const dist = Math.hypot(
        config.target.x - npc.x,
        config.target.y - npc.y,
      );
      if (dist > 1.5) {
        const f = seek(npc, config.target, config.speed);
        const s = separate(npc, others, config.separationRadius);
        fx = f.fx + s.fx * 0.6;
        fy = f.fy + s.fy * 0.6;
      }
      break;
    }

    case "IDLE": {
      if (tick % 10 === 0) {
        const p = randomPerturbation(0.03);
        fx = p.fx;
        fy = p.fy;
      } else {
        fx = npc.vx * 0.3;
        fy = npc.vy * 0.3;
      }
      break;
    }

    case "GUARD": {
      if (!config.target) break;
      const dist = Math.hypot(
        config.target.x - npc.x,
        config.target.y - npc.y,
      );
      if (dist > 2) {
        const f = seek(npc, config.target, config.speed);
        fx = f.fx;
        fy = f.fy;
      } else {
        if (tick % 8 === 0) {
          const p = randomPerturbation(0.02);
          fx = p.fx;
          fy = p.fy;
        } else {
          fx = npc.vx * 0.2;
          fy = npc.vy * 0.2;
        }
      }
      break;
    }

    case "PATROL": {
      if (!config.target) break;
      const f = seek(npc, config.target, config.speed);
      fx = f.fx;
      fy = f.fy;
      break;
    }

    case "SEARCH": {
      if (!config.target) {
        const p = randomPerturbation(0.4);
        const s = separate(npc, others, config.separationRadius);
        fx = p.fx + s.fx * 0.5;
        fy = p.fy + s.fy * 0.5;
      } else {
        const f = seek(npc, config.target, config.speed);
        const s = separate(npc, others, config.separationRadius);
        fx = f.fx + s.fx * 0.5;
        fy = f.fy + s.fy * 0.5;
      }
      break;
    }
  }

  const w = avoidWalls(npc.x, npc.y, fx, fy, config.walls);
  fx += w.fx;
  fy += w.fy;

  const damping = 0.75;
  const nvx = npc.vx * damping + fx;
  const nvy = npc.vy * damping + fy;

  const maxSpeed = cellsPerTick(config.speed * 1.5);
  const speed = Math.hypot(nvx, nvy);
  const scale = speed > maxSpeed ? maxSpeed / speed : 1;

  const finalVx = nvx * scale;
  const finalVy = nvy * scale;
  const newX = npc.x + finalVx;
  const newY = npc.y + finalVy;
  const facing = speed > 0.01 ? Math.atan2(finalVy, finalVx) : npc.facing;

  return { ...npc, x: newX, y: newY, vx: finalVx, vy: finalVy, facing };
}

export function computeNextStateWithPath(
  npc: NpcState,
  others: NpcState[],
  config: BehaviorConfig,
  nextWaypoint: { x: number; y: number } | null,
  tick: number,
): NpcState {
  let fx = 0;
  let fy = 0;

  if (nextWaypoint) {
    const s = seek(npc, nextWaypoint, config.speed);
    const sep = separate(npc, others, config.separationRadius);
    const chaos =
      config.type === "PANIC"
        ? randomPerturbation(config.chaosCoefficient * 0.4)
        : { fx: 0, fy: 0 };
    fx = s.fx + sep.fx * 0.5 + chaos.fx;
    fy = s.fy + sep.fy * 0.5 + chaos.fy;
  } else {
    switch (config.type) {
      case "PANIC": {
        const changeDirEvery = 2;
        const shouldChange =
          tick % changeDirEvery === 0 || (npc.vx === 0 && npc.vy === 0);
        const dir = shouldChange
          ? randomPerturbation(1.0)
          : { fx: npc.vx, fy: npc.vy };
        const sep = separate(npc, others, config.separationRadius);
        const p = randomPerturbation(config.chaosCoefficient);
        const spd = cellsPerTick(config.speed * (0.5 + Math.random() * 0.8));
        const mag = Math.hypot(dir.fx, dir.fy) || 1;
        fx = (dir.fx / mag) * spd + sep.fx * 0.6 + p.fx;
        fy = (dir.fy / mag) * spd + sep.fy * 0.6 + p.fy;
        break;
      }
      case "RIOT": {
        const leaders = others.filter((o) => o.role === "LEADER");
        const pivot = leaders[0] ?? others[0];
        if (npc.role === "LEADER" && pivot) {
          const f = seek(npc, pivot, config.speed * 0.8);
          const s = separate(npc, others, config.separationRadius * 0.6);
          fx = f.fx + s.fx * 0.3;
          fy = f.fy + s.fy * 0.3;
        } else {
          const p = randomPerturbation(config.chaosCoefficient);
          const s = separate(npc, others, config.separationRadius);
          fx = p.fx * 2 + s.fx * 0.4;
          fy = p.fy * 2 + s.fy * 0.4;
        }
        break;
      }
      default: {
        const p = randomPerturbation(config.chaosCoefficient || 0.3);
        const s = separate(npc, others, config.separationRadius);
        fx = p.fx + s.fx * 0.5;
        fy = p.fy + s.fy * 0.5;
        break;
      }
    }
  }

  const w = avoidWalls(npc.x, npc.y, fx, fy, config.walls);
  fx += w.fx;
  fy += w.fy;

  const damping = 0.75;
  const nvx = npc.vx * damping + fx;
  const nvy = npc.vy * damping + fy;
  const maxSpeed = cellsPerTick(config.speed * 1.5);
  const speed = Math.hypot(nvx, nvy);
  const scale = speed > maxSpeed ? maxSpeed / speed : 1;

  const finalVx = nvx * scale;
  const finalVy = nvy * scale;
  const newX = npc.x + finalVx;
  const newY = npc.y + finalVy;
  const facing = speed > 0.01 ? Math.atan2(finalVy, finalVx) : npc.facing;

  return { ...npc, x: newX, y: newY, vx: finalVx, vy: finalVy, facing };
}

export const TICK_INTERVAL_MS = TICK_MS;
