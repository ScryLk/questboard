// ── Steering primitivo pra behaviors ──
//
// Funções puras de steering — recebem estado atual e devolvem o
// próximo step desejado (ainda sem aplicar colisão; isso é
// responsabilidade do caller). Pathfinding A* completo fica em
// `pathfinding.ts` (a ser implementado quando o worker exigir).
//
// Mantemos a API leve pra permitir tick loop em <2ms por NPC.

export interface Vec2 {
  x: number;
  y: number;
}

export interface SteeringInput {
  position: Vec2;
  target: Vec2;
  /** Velocidade em células por tick. Default 1. */
  speed?: number;
}

/** Próxima célula em direção ao alvo (greedy, sem path). Quando o
 *  alvo já foi alcançado, retorna a posição atual. */
export function stepToward(input: SteeringInput): Vec2 {
  const speed = input.speed ?? 1;
  const dx = input.target.x - input.position.x;
  const dy = input.target.y - input.position.y;
  if (dx === 0 && dy === 0) return { ...input.position };

  const sx = Math.sign(dx);
  const sy = Math.sign(dy);
  return {
    x: input.position.x + sx * Math.min(Math.abs(dx), speed),
    y: input.position.y + sy * Math.min(Math.abs(dy), speed),
  };
}

/** Próxima célula afastando-se do alvo (FLEE/PANIC). */
export function stepAway(input: SteeringInput): Vec2 {
  const inverted: SteeringInput = {
    ...input,
    target: {
      x: 2 * input.position.x - input.target.x,
      y: 2 * input.position.y - input.target.y,
    },
  };
  return stepToward(inverted);
}

/** Centroide das posições (útil pra calcular fonte de ameaça
 *  inferida em FLEE/PANIC quando o GM não passa fleeTarget). */
export function centroid(points: Vec2[]): Vec2 {
  if (points.length === 0) return { x: 0, y: 0 };
  let sx = 0;
  let sy = 0;
  for (const p of points) {
    sx += p.x;
    sy += p.y;
  }
  return {
    x: Math.round(sx / points.length),
    y: Math.round(sy / points.length),
  };
}

/** Distância Manhattan (mais barata em grid; pra hot path do tick). */
export function manhattan(a: Vec2, b: Vec2): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/** Distância euclidiana (pra raio de alerta GUARD/SEARCH). */
export function euclid(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
