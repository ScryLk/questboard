"use client";

// Ações de descanso/HP/slots da ficha 5e. Mantidas fora do
// characterStore pra não inchar a store com lógica que sabe das
// regras de SRD. Cada função aceita o id e atualiza via updateCharacter.

import { useCharacterStore } from "@/stores/characterStore";
import { dnd5e } from "@questboard/game-engine";
import { listClasses } from "@/lib/srd";

/** Long rest: HP cheio, todos os slots restaurados, hit dice
 *  recuperam metade do nível, death saves zerados. */
export function longRest(characterId: string) {
  const store = useCharacterStore.getState();
  const character = store.characters.find((c) => c.id === characterId);
  if (!character) return;
  const updates: Parameters<typeof store.updateCharacter>[1] = {
    stats: {
      ...character.stats,
      hp: character.stats.maxHp,
    },
  };
  if (character.dnd5eData) {
    updates.dnd5eData = {
      ...character.dnd5eData,
      hpCurrent: character.stats.maxHp,
      hpTemp: 0,
      // Long rest recupera tudo. Hit dice recupera metade do nível
      // arredondado pra baixo (mínimo 1).
      hitDiceUsed: Math.max(
        0,
        character.dnd5eData.hitDiceUsed -
          Math.max(1, Math.floor(character.dnd5eData.level / 2)),
      ),
      spellSlotsExpended: {},
      deathSavesSuccesses: 0,
      deathSavesFailures: 0,
    };
  }
  store.updateCharacter(characterId, updates);
}

/** Short rest: Bruxo recupera slots de pacto. Outras classes só
 *  recuperam recursos custom (não modelados ainda). */
export function shortRest(characterId: string) {
  const store = useCharacterStore.getState();
  const character = store.characters.find((c) => c.id === characterId);
  if (!character?.dnd5eData) return;

  const isWarlock = character.dnd5eData.classSlug === "warlock";
  if (!isWarlock) {
    // Sem efeito mecânico ainda pra outras classes — só limpa death
    // saves se HP > 0 (descanso curto estabiliza).
    if (character.stats.hp > 0) {
      store.updateCharacter(characterId, {
        dnd5eData: {
          ...character.dnd5eData,
          deathSavesSuccesses: 0,
          deathSavesFailures: 0,
        },
      });
    }
    return;
  }

  // Warlock: zera spellSlotsExpended (Pact Magic recupera todos).
  store.updateCharacter(characterId, {
    dnd5eData: {
      ...character.dnd5eData,
      spellSlotsExpended: {},
      deathSavesSuccesses: 0,
      deathSavesFailures: 0,
    },
  });
}

/** Marca um slot como gasto. Se já gastou todos do nível, no-op. */
export function expendSpellSlot(characterId: string, level: number) {
  const store = useCharacterStore.getState();
  const character = store.characters.find((c) => c.id === characterId);
  if (!character?.dnd5eData) return;

  const total =
    dnd5e.getSpellSlotsByClassAndLevel(
      character.dnd5eData.classSlug,
      character.dnd5eData.level,
    )[level as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9] ?? 0;
  const used = character.dnd5eData.spellSlotsExpended[String(level)] ?? 0;
  if (used >= total) return;

  store.updateCharacter(characterId, {
    dnd5eData: {
      ...character.dnd5eData,
      spellSlotsExpended: {
        ...character.dnd5eData.spellSlotsExpended,
        [String(level)]: used + 1,
      },
    },
  });
}

/** Restaura um slot (ex: GM corrigindo erro do player). No-op se já está cheio. */
export function restoreSpellSlot(characterId: string, level: number) {
  const store = useCharacterStore.getState();
  const character = store.characters.find((c) => c.id === characterId);
  if (!character?.dnd5eData) return;
  const used = character.dnd5eData.spellSlotsExpended[String(level)] ?? 0;
  if (used <= 0) return;
  store.updateCharacter(characterId, {
    dnd5eData: {
      ...character.dnd5eData,
      spellSlotsExpended: {
        ...character.dnd5eData.spellSlotsExpended,
        [String(level)]: used - 1,
      },
    },
  });
}

/** Death save: marca/desmarca um sucesso ou falha (clicando o pip). */
export function toggleDeathSave(
  characterId: string,
  kind: "success" | "failure",
  index: number,
) {
  const store = useCharacterStore.getState();
  const character = store.characters.find((c) => c.id === characterId);
  if (!character?.dnd5eData) return;
  const field = kind === "success" ? "deathSavesSuccesses" : "deathSavesFailures";
  const current = character.dnd5eData[field];
  // Clicando no pip já marcado, desmarca. Caso contrário, marca até essa posição.
  const next = current > index ? index : index + 1;
  store.updateCharacter(characterId, {
    dnd5eData: {
      ...character.dnd5eData,
      [field]: next,
    },
  });
}

/** Ajusta HP temporário. Negativos viram 0. */
export function setHpTemp(characterId: string, value: number) {
  const store = useCharacterStore.getState();
  const character = store.characters.find((c) => c.id === characterId);
  if (!character?.dnd5eData) return;
  store.updateCharacter(characterId, {
    dnd5eData: {
      ...character.dnd5eData,
      hpTemp: Math.max(0, value),
    },
  });
}

/** Sobe um nível. Aplica HP fixo (HD/2 + 1 + mod CON). Limita em 20. */
export function levelUp(characterId: string) {
  const store = useCharacterStore.getState();
  const character = store.characters.find((c) => c.id === characterId);
  if (!character?.dnd5eData) return;
  if (character.dnd5eData.level >= 20) return;

  const klass = listClasses("dnd5e").find(
    (c) => c.slug === character.dnd5eData!.classSlug,
  );
  if (!klass) return;

  const conMod = dnd5e.abilityModifier(character.dnd5eData.attributes.con);
  const hpGain = Math.max(1, Math.floor(klass.hitDie / 2) + 1 + conMod);

  store.updateCharacter(characterId, {
    stats: {
      ...character.stats,
      maxHp: character.stats.maxHp + hpGain,
      hp: character.stats.hp + hpGain,
    },
    dnd5eData: {
      ...character.dnd5eData,
      level: character.dnd5eData.level + 1,
      hpCurrent: character.stats.hp + hpGain,
    },
  });
}
