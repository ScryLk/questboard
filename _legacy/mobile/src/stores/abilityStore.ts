import { create } from "zustand";
import type { FullCharacter } from "../lib/character-types";
import type {
  GameAbility,
  AbilityCategory,
  UseOptions,
  UseResult,
} from "../types/ability";
import { buildAbilities } from "../engine/ability-adapters";
import { resolveUse } from "../engine/ability-resolvers/resolve-use";
import type { ResolveContext } from "../engine/ability-resolvers/resolve-use";
import { useCharacterStore } from "../lib/character-store";
import { useCombatStore } from "./combatStore";
import { useGameplayStore } from "../lib/gameplay-store";

// ─── Store Interface ──────────────────────────────────────

interface AbilityStore {
  abilities: GameAbility[];
  filter: AbilityCategory | "all";
  searchQuery: string;
  activeAbility: GameAbility | null;
  upcastLevel: number | null;
  lastResult: UseResult | null;

  // Actions
  loadAbilities: (char: FullCharacter) => void;
  refreshAvailability: (char: FullCharacter) => void;
  setFilter: (f: AbilityCategory | "all") => void;
  setSearch: (q: string) => void;
  selectAbility: (a: GameAbility | null) => void;
  setUpcastLevel: (level: number | null) => void;
  confirmUse: (
    ability: GameAbility,
    options?: UseOptions,
  ) => UseResult;
  clearResult: () => void;
  filteredAbilities: () => GameAbility[];
}

// ─── Store ────────────────────────────────────────────────

export const useAbilityStore = create<AbilityStore>((set, get) => ({
  abilities: [],
  filter: "all",
  searchQuery: "",
  activeAbility: null,
  upcastLevel: null,
  lastResult: null,

  loadAbilities: (char) => {
    const abilities = buildAbilities(char);
    set({ abilities });
  },

  refreshAvailability: (char) => {
    const abilities = buildAbilities(char);
    set({ abilities });
  },

  setFilter: (filter) => set({ filter }),
  setSearch: (searchQuery) => set({ searchQuery }),

  selectAbility: (activeAbility) =>
    set({ activeAbility, upcastLevel: null, lastResult: null }),

  setUpcastLevel: (upcastLevel) => set({ upcastLevel }),

  clearResult: () => set({ lastResult: null }),

  confirmUse: (ability, options = {}) => {
    const { upcastLevel } = get();

    // Build effective options
    const effectiveOptions: UseOptions = {
      ...options,
      upcastLevel: options.upcastLevel ?? upcastLevel ?? undefined,
    };

    // Get external state for context
    const gameplayStore = useGameplayStore.getState();
    const combatStore = useCombatStore.getState();
    const characterStore = useCharacterStore.getState();
    const combatActive = gameplayStore.combatActive;
    const myTokenId = gameplayStore.myTokenId;

    // Find character ID from token or first character
    const myToken = myTokenId ? gameplayStore.tokens[myTokenId] : undefined;
    const charId = myToken?.characterId ?? "";

    // Find my combatant in combat store
    const myCombatant = combatStore.combatants.find(
      (c) => c.tokenId === myTokenId,
    );

    // Build resolve context
    const context: ResolveContext = {
      consumeSpellSlot: (level: number) => {
        if (!myCombatant) {
          // Out of combat: use character store directly
          const char = characterStore.characters[charId];
          if (!char) return false;
          const slot = char.spellSlots.find(
            (s) => s.level === level && s.used < s.total,
          );
          if (!slot) return false;
          characterStore.updateSpellSlotUsed(charId, level, 1);
          return true;
        }
        return combatStore.useSpellSlot(myCombatant.id, level);
      },

      consumeFeatureUse: (featureId: string) => {
        const char = characterStore.characters[charId];
        if (!char) return false;
        const feature = char.features.find((f) => f.id === featureId);
        if (!feature?.uses || feature.uses.current <= 0) return false;
        characterStore.updateFeatureUses(charId, featureId, -1);
        return true;
      },

      consumeItemCharge: (_itemId: string) => {
        // Item charge consumption — quantity decrement
        // For now, this is a no-op since we don't have an updateItemQuantity action
        // TODO: add updateItemQuantity to character-store
        return true;
      },

      consumeAction: (type) => {
        if (!myCombatant) return true; // Out of combat: always allow
        switch (type) {
          case "action":
            if (myCombatant.resources.actionEconomy.action) return false;
            combatStore.useAction(myCombatant.id);
            return true;
          case "bonus_action":
            if (myCombatant.resources.actionEconomy.bonusAction) return false;
            combatStore.useBonusAction(myCombatant.id);
            return true;
          case "reaction":
            if (myCombatant.resources.actionEconomy.reaction) return false;
            combatStore.useReaction(myCombatant.id);
            return true;
        }
      },

      inCombat: combatActive,
      characterName: myToken?.name ?? "Jogador",
      characterIcon: myToken?.icon ?? "sword",
    };

    // Resolve
    const result = resolveUse(ability, effectiveOptions, context);

    // Post to chat if successful
    if (result.success && result.rolls.length > 0) {
      const primaryRoll = result.rolls[0];
      gameplayStore.addMessage({
        id: `ability-${Date.now()}`,
        channel: "GENERAL",
        type: "dice_roll",
        content: `usou ${ability.name}`,
        senderName: context.characterName,
        senderIcon: context.characterIcon,
        characterName: context.characterName,
        timestamp: new Date().toISOString(),
        diceResult: {
          formula: primaryRoll.formula,
          rolls: primaryRoll.rolls,
          total: primaryRoll.total,
          label: `${ability.name} — ${primaryRoll.label}`,
          isNat20: primaryRoll.isNat20,
          isNat1: primaryRoll.isNat1,
        },
      });

      // Post secondary rolls (damage, etc) as separate messages
      for (let i = 1; i < result.rolls.length; i++) {
        const roll = result.rolls[i];
        gameplayStore.addMessage({
          id: `ability-${Date.now()}-${i}`,
          channel: "GENERAL",
          type: "dice_roll",
          content: `${ability.name} — ${roll.label}`,
          senderName: context.characterName,
          senderIcon: context.characterIcon,
          characterName: context.characterName,
          timestamp: new Date().toISOString(),
          diceResult: {
            formula: roll.formula,
            rolls: roll.rolls,
            total: roll.total,
            label: roll.label,
          },
        });
      }
    }

    // Handle concentration
    if (result.success && myCombatant) {
      const concEffect = result.effects.find((e) => e.type === "concentration");
      if (concEffect) {
        combatStore.setConcentration(myCombatant.id, ability.sourceId);
      }
    }

    set({ lastResult: result });

    // Refresh abilities after use (availability may have changed)
    const char = characterStore.characters[charId];
    if (char) {
      const abilities = buildAbilities(char);
      set({ abilities });
    }

    return result;
  },

  filteredAbilities: () => {
    const { abilities, filter, searchQuery } = get();
    let filtered = abilities;

    if (filter !== "all") {
      filtered = filtered.filter((a) => a.category === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.tags.some((t) => t.includes(q)),
      );
    }

    return filtered;
  },
}));
