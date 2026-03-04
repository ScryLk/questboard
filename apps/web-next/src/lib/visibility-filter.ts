import type {
  GameToken,
  CombatState,
  MapPin,
  MapNote,
  AOEInstance,
  TokenAlignment,
} from "./gameplay-mock-data";
import type {
  PlayerToken,
  PlayerCombatState,
  PlayerCombatParticipant,
  PlayerViewSettings,
} from "./player-view-store";

// ── HP description for enemies ────────────────────────────────

export function getHPDescription(hp: number, maxHp: number): string {
  if (maxHp === 0) return "Morto";
  const pct = hp / maxHp;
  if (pct >= 1) return "Ileso";
  if (pct >= 0.75) return "Levemente ferido";
  if (pct >= 0.5) return "Ferido";
  if (pct >= 0.25) return "Gravemente ferido";
  if (pct > 0) return "Quase morto";
  return "Morto";
}

export function getHPDescriptionColor(desc: string): string {
  switch (desc) {
    case "Ileso":
      return "#FF4444";
    case "Levemente ferido":
      return "#FF6B4A";
    case "Ferido":
      return "#FF9F43";
    case "Gravemente ferido":
      return "#FDCB6E";
    case "Quase morto":
      return "#FF4444";
    case "Morto":
      return "#666";
    default:
      return "#FF4444";
  }
}

// ── Build player view — filters entire game state ─────────────

interface BuildPlayerViewInput {
  tokens: GameToken[];
  fogCells: Set<string>;
  exploredCells?: Set<string>;
  combat: CombatState;
  markers: MapPin[];
  notes: MapNote[];
  aoeInstances: AOEInstance[];
}

interface PlayerView {
  visibleTokens: PlayerToken[];
  myToken: PlayerToken | null;
  visibleMarkers: MapPin[];
  visibleNotes: MapNote[];
  visibleAOE: AOEInstance[];
  combat: PlayerCombatState | null;
  isMyTurn: boolean;
}

function isAllyType(type: TokenAlignment): boolean {
  return type === "player" || type === "ally";
}

export function buildPlayerView(
  data: BuildPlayerViewInput,
  playerId: string,
  settings: PlayerViewSettings,
): PlayerView {
  const { tokens, fogCells, combat, markers, notes, aoeInstances } = data;

  // Find my token
  const myGameToken = tokens.find((t) => t.playerId === playerId);

  // Filter tokens — only visible to player
  const visibleGameTokens = tokens.filter((token) => {
    if (!token.onMap) return false;

    // Hidden tokens never visible to player
    if (token.visibility === "hidden") return false;

    // Check fog — token's cell
    // For multi-cell tokens, check primary cell
    const cellKey = `${token.x},${token.y}`;
    if (fogCells.has(cellKey)) return false;

    // Invisible tokens: only if we have truesight (simplified — always hidden for now)
    if (token.visibility === "invisible") return false;

    return true;
  });

  // Map to PlayerToken with filtered information
  const visibleTokens: PlayerToken[] = visibleGameTokens.map((token) => {
    const isMe = token.playerId === playerId;
    const isAlly = isAllyType(token.alignment);
    const isEnemy = token.alignment === "hostile";

    return {
      id: token.id,
      x: token.x,
      y: token.y,
      size: token.size,
      icon: token.icon,
      type: token.alignment,
      isMe,
      playerId: token.playerId,

      // Name: own + allies always visible. Enemies: depends on settings
      name: isMe || isAlly
        ? token.name
        : settings.showEnemyNames
          ? token.name
          : "Criatura",

      // HP
      hp: isMe ? token.hp : (isAlly && settings.showAllyHpNumeric) ? token.hp : undefined,
      maxHp: isMe ? token.maxHp : (isAlly && settings.showAllyHpNumeric) ? token.maxHp : undefined,
      hpDescription:
        isEnemy && settings.showEnemyHpDescription
          ? getHPDescription(token.hp, token.maxHp)
          : undefined,
      hpBarPercent: isAlly && !isMe
        ? token.maxHp > 0 ? (token.hp / token.maxHp) * 100 : 0
        : undefined,

      // AC: only own token
      ac: isMe ? token.ac : undefined,
      speed: isMe ? token.speed : undefined,

      // Conditions: enemies depend on settings, allies always visible
      conditions:
        isMe || isAlly
          ? token.conditions
          : settings.showEnemyConditions
            ? token.conditions
            : [],

      isInvisibleDetected: false,
    };
  });

  const myPlayerToken = visibleTokens.find((t) => t.isMe) ?? null;

  // Filter markers — no gmOnly, no fog
  const visibleMarkers = markers.filter(
    (m) => !m.gmOnly && !fogCells.has(`${m.x},${m.y}`),
  );

  // Filter notes — no gmOnly, no fog
  const visibleNotes = notes.filter(
    (n) => !n.gmOnly && !fogCells.has(`${n.x},${n.y}`),
  );

  // Filter AOE — no fog on origin
  const visibleAOE = aoeInstances.filter(
    (z) => !fogCells.has(`${z.originX},${z.originY}`),
  );

  // Build combat state (filtered)
  let playerCombat: PlayerCombatState | null = null;
  let isMyTurn = false;

  if (combat.active && combat.order.length > 0) {
    const currentTurnCombatant = combat.order[combat.turnIndex];
    const currentTurnToken = currentTurnCombatant
      ? tokens.find((t) => t.id === currentTurnCombatant.tokenId)
      : null;

    isMyTurn = currentTurnToken?.playerId === playerId;

    const participants: PlayerCombatParticipant[] = [];
    for (const c of combat.order) {
      const token = tokens.find((t) => t.id === c.tokenId);
      if (!token) continue;

      // Hidden tokens or tokens under fog don't appear in tracker
      if (token.visibility === "hidden") continue;
      if (fogCells.has(`${token.x},${token.y}`) && token.onMap) continue;

      const isMe = token.playerId === playerId;
      const isAlly = isAllyType(token.alignment);
      const isEnemy = token.alignment === "hostile";

      participants.push({
        tokenId: c.tokenId,
        name: isMe || isAlly
          ? token.name
          : settings.showEnemyNames
            ? token.name
            : "Criatura",
        initiative: c.initiative,
        type: token.alignment,
        isMe,
        hpDescription:
          isEnemy && settings.showEnemyHpDescription
            ? getHPDescription(token.hp, token.maxHp)
            : undefined,
        hp: isMe
          ? token.hp
          : isAlly && settings.showAllyHpNumeric
            ? token.hp
            : undefined,
        maxHp: isMe
          ? token.maxHp
          : isAlly && settings.showAllyHpNumeric
            ? token.maxHp
            : undefined,
        hpBarPercent: isAlly
          ? token.maxHp > 0 ? (token.hp / token.maxHp) * 100 : 0
          : undefined,
        conditions:
          isMe || isAlly
            ? token.conditions
            : settings.showEnemyConditions
              ? token.conditions
              : [],
        isDead: c.status === "dead",
      });
    }

    playerCombat = {
      active: true,
      round: combat.round,
      currentTurnTokenId: currentTurnCombatant?.tokenId ?? null,
      currentTurnName: currentTurnToken
        ? isMyTurn
          ? "Voce"
          : currentTurnToken.name
        : "???",
      participants,
    };
  }

  return {
    visibleTokens,
    myToken: myPlayerToken,
    visibleMarkers,
    visibleNotes,
    visibleAOE,
    combat: playerCombat,
    isMyTurn,
  };
}
