import type { Creature } from "./creature-data";
import type { CreaturePersonality, TacticalRequest } from "./ai-types";

// ── JSON Parsing with fallbacks ──

interface ParsedNPC {
  creature: Creature;
  personality: CreaturePersonality;
}

export function safeParseNPCJSON(text: string): ParsedNPC | null {
  // Try direct parse first
  let raw: unknown = null;

  try {
    raw = JSON.parse(text);
  } catch {
    // Try extracting from markdown code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        raw = JSON.parse(codeBlockMatch[1].trim());
      } catch {
        // noop
      }
    }

    // Try finding JSON object in text
    if (!raw) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          // Remove trailing commas before closing braces/brackets
          const cleaned = jsonMatch[0]
            .replace(/,\s*([}\]])/g, "$1");
          raw = JSON.parse(cleaned);
        } catch {
          return null;
        }
      }
    }
  }

  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Record<string, unknown>;

  // Handle both flat and nested structure
  const creatureRaw = (obj.creature ?? obj) as Record<string, unknown>;
  const personalityRaw = (obj.personality ?? {}) as Record<string, unknown>;

  const creature = sanitizeCreature(creatureRaw);
  if (!creature) return null;

  const personality = sanitizePersonality(personalityRaw);

  return { creature, personality };
}

function sanitizeCreature(raw: Record<string, unknown>): Creature | null {
  if (!raw.name || !raw.actions) return null;

  return {
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: String(raw.name ?? "NPC Sem Nome"),
    nameEn: String(raw.nameEn ?? raw.name ?? "Unnamed NPC"),
    type: validateEnum(raw.type, [
      "aberration", "beast", "celestial", "construct", "dragon",
      "elemental", "fey", "fiend", "giant", "humanoid",
      "monstrosity", "ooze", "plant", "undead",
    ], "humanoid") as Creature["type"],
    size: validateEnum(raw.size, [
      "tiny", "small", "medium", "large", "huge", "gargantuan",
    ], "medium") as Creature["size"],
    alignment: String(raw.alignment ?? "neutro"),
    cr: String(raw.cr ?? "1"),
    xp: Number(raw.xp) || 200,
    ac: Number(raw.ac) || 10,
    acDesc: String(raw.acDesc ?? ""),
    hp: Number(raw.hp) || 10,
    hpFormula: String(raw.hpFormula ?? "2d8+2"),
    speed: String(raw.speed ?? "9m (30ft)"),
    str: Number(raw.str) || 10,
    dex: Number(raw.dex) || 10,
    con: Number(raw.con) || 10,
    int: Number(raw.int) || 10,
    wis: Number(raw.wis) || 10,
    cha: Number(raw.cha) || 10,
    skills: Array.isArray(raw.skills) ? raw.skills as Creature["skills"] : [],
    damageVulnerabilities: raw.damageVulnerabilities ? String(raw.damageVulnerabilities) : undefined,
    damageResistances: raw.damageResistances ? String(raw.damageResistances) : undefined,
    damageImmunities: raw.damageImmunities ? String(raw.damageImmunities) : undefined,
    conditionImmunities: raw.conditionImmunities ? String(raw.conditionImmunities) : undefined,
    senses: String(raw.senses ?? "Percepção passiva 10"),
    languages: String(raw.languages ?? "—"),
    abilities: Array.isArray(raw.abilities) ? raw.abilities as Creature["abilities"] : [],
    actions: Array.isArray(raw.actions) ? raw.actions as Creature["actions"] : [],
    reactions: Array.isArray(raw.reactions) ? raw.reactions as Creature["reactions"] : undefined,
    legendaryActions: Array.isArray(raw.legendaryActions) ? raw.legendaryActions as Creature["legendaryActions"] : undefined,
    icon: String(raw.icon ?? "🧑"),
    color: String(raw.color ?? "#9B59B6"),
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : ["npc", "custom"],
  };
}

function sanitizePersonality(raw: Record<string, unknown>): CreaturePersonality {
  return {
    personalityTraits: Array.isArray(raw.personalityTraits)
      ? (raw.personalityTraits as string[])
      : ["Misterioso"],
    ideal: String(raw.ideal ?? "Sobrevivência"),
    bond: String(raw.bond ?? "Nenhum laço conhecido"),
    flaw: String(raw.flaw ?? "Desconfiado"),
    backstory: String(raw.backstory ?? "Pouco se sabe sobre este NPC."),
    voiceNotes: String(raw.voiceNotes ?? ""),
    mannerisms: String(raw.mannerisms ?? ""),
    motivation: String(raw.motivation ?? "Desconhecida"),
  };
}

function validateEnum(value: unknown, valid: string[], fallback: string): string {
  const str = String(value ?? "").toLowerCase();
  return valid.includes(str) ? str : fallback;
}

// ── Battlefield Context Builder ──

export function buildBattlefieldContext(req: TacticalRequest): string {
  const { npcToken, npcCreature, allTokens, combatRound, gridCellSizeFt } = req;
  const lines: string[] = [];

  lines.push(`=== TURNO DO NPC: ${npcToken.name} ===`);
  lines.push(`Round: ${combatRound}`);
  lines.push(`HP: ${npcToken.hp}/${npcToken.maxHp} | AC: ${npcToken.ac} | Posição: (${npcToken.x}, ${npcToken.y})`);
  lines.push(`Velocidade: ${npcToken.speed}ft (${Math.floor(npcToken.speed / gridCellSizeFt)} células)`);

  if (npcToken.conditions.length > 0) {
    lines.push(`Condições: ${npcToken.conditions.join(", ")}`);
  }

  if (npcCreature) {
    lines.push(`\nAÇÕES DISPONÍVEIS:`);
    for (const action of npcCreature.actions) {
      lines.push(`- ${action.name}: ${action.desc}`);
    }
    if (npcCreature.abilities.length > 0) {
      lines.push(`\nHABILIDADES:`);
      for (const ability of npcCreature.abilities) {
        lines.push(`- ${ability.name}: ${ability.desc}`);
      }
    }
    if (npcCreature.reactions?.length) {
      lines.push(`\nREAÇÕES:`);
      for (const reaction of npcCreature.reactions) {
        lines.push(`- ${reaction.name}: ${reaction.desc}`);
      }
    }
  } else {
    lines.push(`\nAÇÕES: Ataque corpo-a-corpo básico (alcance 1,5m, +3 para acertar, 1d6+1 dano)`);
  }

  lines.push(`\n=== CAMPO DE BATALHA ===`);
  lines.push(`Grade: 1 célula = ${gridCellSizeFt}ft | Distância diagonal = 1 célula (Chebyshev)`);

  const allies: string[] = [];
  const enemies: string[] = [];

  for (const t of allTokens) {
    if (t.id === npcToken.id) continue;
    if (t.hp <= 0) continue;

    const dist = Math.max(Math.abs(t.x - npcToken.x), Math.abs(t.y - npcToken.y));
    const distFt = dist * gridCellSizeFt;
    const entry = `  ${t.name}: HP ${t.hp}/${t.maxHp}, AC ${t.ac}, pos (${t.x},${t.y}), dist ${dist} células (${distFt}ft)${t.conditions.length > 0 ? `, conditions: ${t.conditions.join(", ")}` : ""}`;

    if (t.alignment === "hostile") {
      allies.push(entry);
    } else {
      enemies.push(entry);
    }
  }

  if (enemies.length > 0) {
    lines.push(`\nINIMIGOS (alvos potenciais):`);
    lines.push(...enemies);
  }
  if (allies.length > 0) {
    lines.push(`\nALIADOS:`);
    lines.push(...allies);
  }

  return lines.join("\n");
}
