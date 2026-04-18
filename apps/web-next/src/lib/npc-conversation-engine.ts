import type {
  SpeechStyle,
  NpcMood,
  NpcConversationProfile,
  DialogueNode,
  DialogueCondition,
  DialogueOption,
  PlayerConversationContext,
} from "./npc-conversation-types";
import { getReputationLabel } from "./npc-conversation-types";

// ── Speech Style Detection (heuristic) ──

export function detectSpeechStyle(text: string): SpeechStyle {
  if (/ameaço|mato|destruo|cuidado|vai se arrepender|vou te|não me teste/i.test(text))
    return "INTIMIDATING";
  if (/por favor|imploro|precisamos|me ajude|preciso de|peço/i.test(text))
    return "PLEADING";
  if (/minto|finjo|faço de conta|escondi|na verdade não|engano/i.test(text))
    return "DECEPTIVE";
  if (/kk|rsrs|brincando|piada|haha|zoando/i.test(text))
    return "JOKING";
  if (/Vossa Senhoria|Com respeito|se me permite|nobre|prezado/i.test(text))
    return "FORMAL";
  if (/cara|bicho|vai logo|que foi|mano|e aí|beleza/i.test(text))
    return "CASUAL";
  if (/!/.test(text) && text.length < 30)
    return "AGGRESSIVE";

  return "CASUAL";
}

// ── Reputation Engine ──

interface ReputationRule {
  style: SpeechStyle;
  delta: number;
  condition: (mood: NpcMood) => boolean;
}

const REPUTATION_RULES: ReputationRule[] = [
  { style: "INTIMIDATING", delta: -10, condition: (mood) => mood !== "AFRAID" },
  { style: "INTIMIDATING", delta: 5, condition: (mood) => mood === "AFRAID" },
  { style: "PLEADING", delta: 5, condition: (mood) => mood === "FRIENDLY" },
  { style: "PLEADING", delta: 2, condition: (mood) => mood !== "HOSTILE" },
  { style: "JOKING", delta: 3, condition: (mood) => mood !== "HOSTILE" },
  { style: "JOKING", delta: -5, condition: (mood) => mood === "HOSTILE" },
  { style: "FORMAL", delta: 5, condition: () => true },
  { style: "DECEPTIVE", delta: -15, condition: () => Math.random() > 0.5 },
  { style: "DECEPTIVE", delta: 0, condition: () => true },
  { style: "AGGRESSIVE", delta: -8, condition: (mood) => mood !== "HOSTILE" },
  { style: "AGGRESSIVE", delta: -3, condition: (mood) => mood === "HOSTILE" },
  { style: "CASUAL", delta: 0, condition: () => true },
];

export function calculateReputationDelta(style: SpeechStyle, mood: NpcMood): number {
  for (const rule of REPUTATION_RULES) {
    if (rule.style === style && rule.condition(mood)) {
      return rule.delta;
    }
  }
  return 0;
}

// ── Dialogue Tree Resolution ──

export function evaluateCondition(
  condition: DialogueCondition,
  reputation: number,
  _playerContext?: Partial<PlayerConversationContext>,
): boolean {
  switch (condition.type) {
    case "always":
      return true;
    case "reputation":
      if (condition.min !== undefined && reputation < condition.min) return false;
      if (condition.max !== undefined && reputation > condition.max) return false;
      return true;
    case "keyword":
      return true;
    case "skill_check":
      return true;
    case "item":
      return true;
    case "class":
      return true;
    case "race":
      return true;
    default:
      return true;
  }
}

export function findMatchingNode(
  tree: DialogueNode[],
  reputation: number,
  playerMessage?: string,
): DialogueNode | null {
  const rootNodes = tree.filter((n) => n.isRoot);
  for (const node of rootNodes) {
    if (node.conditions.length === 0) return node;
    const allMet = node.conditions.every((c) => evaluateCondition(c, reputation));
    if (allMet) return node;
  }
  return rootNodes[0] ?? null;
}

export function filterAvailableOptions(
  options: DialogueOption[],
  reputation: number,
): DialogueOption[] {
  return options.filter((opt) => {
    if (!opt.condition) return true;
    return evaluateCondition(opt.condition, reputation);
  });
}

export function resolveNextNode(
  tree: DialogueNode[],
  nextNodeId: string | null,
): DialogueNode | null {
  if (!nextNodeId) return null;
  return tree.find((n) => n.id === nextNodeId) ?? null;
}

// ── System Prompt Builder ──

export function buildNpcSystemPrompt(
  profile: NpcConversationProfile,
  ctx: PlayerConversationContext,
  npcName: string,
): string {
  const repLabel = getReputationLabel(ctx.reputation.withNpc);

  const parts: string[] = [
    `Você é ${npcName}, um NPC em uma campanha de RPG de mesa.`,
    `Responda APENAS como este personagem. Nunca quebre o personagem.`,
    `Responda em pt-BR. Respostas curtas (2-4 frases no máximo).`,
    ``,
    `=== SEU PERSONAGEM ===`,
    `Personalidade: ${profile.aiPersonality}`,
    `Objetivos: ${profile.aiGoals}`,
    `Segredos (você NUNCA revela isso diretamente): ${profile.aiSecrets}`,
    `Conhecimento: ${profile.aiKnowledge}`,
    `Estado emocional atual: ${profile.aiMood}`,
  ];

  if (profile.aiFactionName) {
    parts.push(`Facção: ${profile.aiFactionName}`);
  }

  parts.push(
    ``,
    `=== QUEM ESTÁ FALANDO COM VOCÊ ===`,
    `Nome: ${ctx.character.name}`,
    `Raça/Classe: ${ctx.character.race} ${ctx.character.class} nível ${ctx.character.level}`,
    `Aparência: ${buildAppearanceDescription(ctx)}`,
    `Estado físico: ${buildHealthDescription(ctx.character.hpPercent)}`,
  );

  if (ctx.equipment.isWeaponDrawn) {
    parts.push(`⚠️ ARMA DESEMBAINHADA — esta pessoa está te ameaçando ou em alerta.`);
  }

  parts.push(
    `Reputação com você: ${repLabel.label} (${ctx.reputation.withNpc}/100)`,
  );

  if (ctx.reputation.withFaction && profile.aiFactionName) {
    parts.push(`Reputação com ${profile.aiFactionName}: ${ctx.reputation.withFaction}/100`);
  }

  parts.push(
    ``,
    `=== SITUAÇÃO ATUAL ===`,
    `Local: ${ctx.session.locationName}`,
  );

  if (ctx.session.isInCombat) {
    parts.push(`⚠️ HÁ UM COMBATE ACONTECENDO.`);
  }

  parts.push(
    `Horário: ${ctx.session.timeOfDay}`,
    `Outros presentes: ${ctx.session.partyNearby.length > 0 ? ctx.session.partyNearby.join(", ") : "apenas vocês dois"}`,
  );

  parts.push(
    ``,
    `=== REGRAS DE COMPORTAMENTO ===`,
    `- Se o jogador for AGRESSIVO, fique na defensiva ou chame guarda.`,
    `- Se o jogador for INTIMIDADOR, reaja conforme sua coragem — NPCs covardes cedem, bravos resistem.`,
    `- Se o jogador for FORMAL, responda com mais respeito e vocabulário elevado.`,
    `- Se o jogador tentar ENGANAR, perceba mentiras baseado na sua sabedoria.`,
    `- Se a arma estiver desembainhada e a reputação for negativa, você pode recusar a conversa.`,
  );

  parts.push(
    ``,
    `=== HISTÓRICO COM ESTE PERSONAGEM ===`,
  );

  if (ctx.previousEncounters.length > 0) {
    for (const e of ctx.previousEncounters) {
      parts.push(`- ${e.summary}`);
    }
  } else {
    parts.push(`- Primeiro encontro.`);
  }

  parts.push(
    ``,
    `Responda naturalmente, no personagem. Não liste ações ou pensamentos.`,
    `Apenas o diálogo em si.`,
  );

  return parts.join("\n");
}

function buildAppearanceDescription(ctx: PlayerConversationContext): string {
  const parts: string[] = [];
  if (ctx.equipment.armorType) parts.push(`veste ${ctx.equipment.armorType}`);
  if (ctx.equipment.weaponInHand) parts.push(`carrega ${ctx.equipment.weaponInHand}`);
  if (ctx.equipment.visibleItems.length > 0)
    parts.push(`tem ${ctx.equipment.visibleItems.join(", ")} visíveis`);
  return parts.join(", ") || "aparência comum";
}

function buildHealthDescription(pct: number): string {
  if (pct >= 80) return "em boa forma";
  if (pct >= 50) return "levemente ferido";
  if (pct >= 25) return "visivelmente ferido, sangue nas roupas";
  return "gravemente ferido, mal consegue se manter em pé";
}
