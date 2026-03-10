import { create } from "zustand";
import type {
  Combatant,
  CombatantResources,
  Condition,
} from "../types/combat";
import {
  DEFAULT_ACTION_ECONOMY,
  INCAPACITATING_CONDITIONS,
} from "../types/combat";
import { usePhaseStore } from "./phaseStore";

// ─── Store Interface ─────────────────────────────────────

interface CombatStore {
  combatants: Combatant[];
  round: number;
  activeIndex: number; // índice do combatente com turno ativo

  // Economia de ação
  useAction: (id: string) => void;
  useBonusAction: (id: string) => void;
  useReaction: (id: string) => void;
  useMovement: (id: string, squares: number) => boolean;
  toggleDash: (id: string) => void;

  // HP
  applyDamage: (id: string, amount: number) => void;
  applyHealing: (id: string, amount: number) => void;
  applyTempHp: (id: string, amount: number) => void;

  // Magia
  useSpellSlot: (id: string, level: number) => boolean;
  setConcentration: (id: string, spellId: string | null) => void;
  breakConcentration: (id: string) => void;

  // Condições
  addCondition: (id: string, condition: Condition) => void;
  removeCondition: (id: string, condition: Condition) => void;

  // Recursos customizados
  useCustomResource: (
    id: string,
    resourceId: string,
    amount?: number,
  ) => void;

  // Turno
  nextTurn: () => void;
  nextRound: () => void;
  endCombat: () => void;

  // Setup
  startCombat: (combatants: Combatant[]) => void;
  addCombatantMidCombat: (combatant: Combatant) => void;
  removeCombatant: (id: string) => void;
  toggleDead: (id: string) => void;
  reorderCombatant: (id: string, newIndex: number) => void;
  delayTurn: (id: string) => void;
  updateInitiative: (id: string, initiative: number) => void;
}

// ─── Helpers ─────────────────────────────────────────────

function updateCombatant(
  combatants: Combatant[],
  id: string,
  updater: (c: Combatant) => Combatant,
): Combatant[] {
  return combatants.map((c) => (c.id === id ? updater(c) : c));
}

function updateResources(
  combatant: Combatant,
  updater: (r: CombatantResources) => CombatantResources,
): Combatant {
  return { ...combatant, resources: updater(combatant.resources) };
}

function getAvailableMovement(c: Combatant): number {
  const { movementMax, movementUsed, isDashing } = c.resources.actionEconomy;
  const effective = isDashing ? movementMax * 2 : movementMax;
  return effective - movementUsed;
}

// ─── Store ───────────────────────────────────────────────

export const useCombatStore = create<CombatStore>((set, get) => ({
  combatants: [],
  round: 0,
  activeIndex: 0,

  // ─── Setup ─────────────────────────────────────────────

  startCombat: (combatants) => {
    const sorted = [...combatants].sort(
      (a, b) => b.initiative - a.initiative,
    );
    // Marca o primeiro como ativo
    const withActive = sorted.map((c, i) => ({
      ...c,
      isActive: i === 0,
    }));
    set({ combatants: withActive, round: 1, activeIndex: 0 });
    // Auto-transition to combat phase
    usePhaseStore.getState().transitionTo("combat", "Combate");
  },

  addCombatantMidCombat: (combatant) =>
    set((s) => ({
      combatants: [...s.combatants, { ...combatant, isActive: false }].sort(
        (a, b) => b.initiative - a.initiative,
      ),
    })),

  removeCombatant: (id) =>
    set((s) => {
      const filtered = s.combatants.filter((c) => c.id !== id);
      return {
        combatants: filtered,
        activeIndex: Math.min(
          s.activeIndex,
          Math.max(0, filtered.length - 1),
        ),
      };
    }),

  toggleDead: (id) =>
    set((s) => ({
      combatants: updateCombatant(s.combatants, id, (c) => ({
        ...c,
        isDead: !c.isDead,
      })),
    })),

  reorderCombatant: (id, newIndex) =>
    set((s) => {
      const list = [...s.combatants];
      const oldIndex = list.findIndex((c) => c.id === id);
      if (oldIndex === -1 || newIndex < 0 || newIndex >= list.length) return s;
      const [item] = list.splice(oldIndex, 1);
      list.splice(newIndex, 0, item);
      return { combatants: list };
    }),

  delayTurn: (id) =>
    set((s) => {
      const list = [...s.combatants];
      const idx = list.findIndex((c) => c.id === id);
      if (idx === -1 || idx >= list.length - 1) return s;
      const [item] = list.splice(idx, 1);
      list.splice(idx + 1, 0, item);
      return { combatants: list };
    }),

  updateInitiative: (id, initiative) =>
    set((s) => ({
      combatants: updateCombatant(s.combatants, id, (c) => ({
        ...c,
        initiative,
      })),
    })),

  // ─── Economia de Ação ──────────────────────────────────

  useAction: (id) =>
    set((s) => ({
      combatants: updateCombatant(s.combatants, id, (c) =>
        updateResources(c, (r) => ({
          ...r,
          actionEconomy: { ...r.actionEconomy, action: true },
        })),
      ),
    })),

  useBonusAction: (id) =>
    set((s) => ({
      combatants: updateCombatant(s.combatants, id, (c) =>
        updateResources(c, (r) => ({
          ...r,
          actionEconomy: { ...r.actionEconomy, bonusAction: true },
        })),
      ),
    })),

  useReaction: (id) =>
    set((s) => ({
      combatants: updateCombatant(s.combatants, id, (c) =>
        updateResources(c, (r) => ({
          ...r,
          actionEconomy: { ...r.actionEconomy, reaction: true },
        })),
      ),
    })),

  useMovement: (id, squares) => {
    const state = get();
    const combatant = state.combatants.find((c) => c.id === id);
    if (!combatant) return false;

    const available = getAvailableMovement(combatant);
    if (squares > available) return false;

    set({
      combatants: updateCombatant(state.combatants, id, (c) =>
        updateResources(c, (r) => ({
          ...r,
          actionEconomy: {
            ...r.actionEconomy,
            movementUsed: r.actionEconomy.movementUsed + squares,
          },
        })),
      ),
    });
    return true;
  },

  toggleDash: (id) =>
    set((s) => ({
      combatants: updateCombatant(s.combatants, id, (c) =>
        updateResources(c, (r) => ({
          ...r,
          actionEconomy: {
            ...r.actionEconomy,
            isDashing: !r.actionEconomy.isDashing,
          },
        })),
      ),
    })),

  // ─── HP ────────────────────────────────────────────────

  applyDamage: (id, amount) =>
    set((s) => ({
      combatants: updateCombatant(s.combatants, id, (c) => {
        const r = c.resources;
        let remaining = amount;

        // Deduz temp HP primeiro
        let newTemp = r.hpTemp;
        if (newTemp > 0) {
          const absorbed = Math.min(newTemp, remaining);
          newTemp -= absorbed;
          remaining -= absorbed;
        }

        // Aplica resto ao HP atual
        const newHp = Math.max(0, r.hpCurrent - remaining);

        // Se HP chega a 0, adiciona unconscious
        let newConditions = r.conditions;
        if (newHp === 0 && !r.conditions.includes("unconscious")) {
          newConditions = [...r.conditions, "unconscious"];
        }

        return {
          ...c,
          isDead: newHp === 0 ? true : c.isDead,
          resources: {
            ...r,
            hpCurrent: newHp,
            hpTemp: newTemp,
            conditions: newConditions,
          },
        };
      }),
    })),

  applyHealing: (id, amount) =>
    set((s) => ({
      combatants: updateCombatant(s.combatants, id, (c) => {
        const r = c.resources;
        const newHp = Math.min(r.hpMax, r.hpCurrent + amount);

        // Se curado de 0 HP, remove unconscious
        let newConditions = r.conditions;
        if (r.hpCurrent === 0 && newHp > 0) {
          newConditions = r.conditions.filter((c) => c !== "unconscious");
        }

        return {
          ...c,
          isDead: newHp > 0 ? false : c.isDead,
          resources: {
            ...r,
            hpCurrent: newHp,
            conditions: newConditions,
            deathSaves:
              newHp > 0
                ? { successes: 0, failures: 0 }
                : r.deathSaves,
          },
        };
      }),
    })),

  applyTempHp: (id, amount) =>
    set((s) => ({
      combatants: updateCombatant(s.combatants, id, (c) =>
        updateResources(c, (r) => ({
          ...r,
          // Temp HP não acumula — usa o maior valor
          hpTemp: Math.max(r.hpTemp, amount),
        })),
      ),
    })),

  // ─── Magia ─────────────────────────────────────────────

  useSpellSlot: (id, level) => {
    const state = get();
    const combatant = state.combatants.find((c) => c.id === id);
    if (!combatant?.resources.spellSlots) return false;

    const slot = combatant.resources.spellSlots[level];
    if (!slot || slot.used >= slot.max) return false;

    set({
      combatants: updateCombatant(state.combatants, id, (c) =>
        updateResources(c, (r) => ({
          ...r,
          spellSlots: {
            ...r.spellSlots,
            [level]: {
              ...r.spellSlots![level],
              used: r.spellSlots![level].used + 1,
            },
          },
        })),
      ),
    });
    return true;
  },

  setConcentration: (id, spellId) =>
    set((s) => ({
      combatants: updateCombatant(s.combatants, id, (c) =>
        updateResources(c, (r) => ({
          ...r,
          concentrationSpellId: spellId,
        })),
      ),
    })),

  breakConcentration: (id) =>
    set((s) => ({
      combatants: updateCombatant(s.combatants, id, (c) =>
        updateResources(c, (r) => ({
          ...r,
          concentrationSpellId: null,
        })),
      ),
    })),

  // ─── Condições ─────────────────────────────────────────

  addCondition: (id, condition) =>
    set((s) => ({
      combatants: updateCombatant(s.combatants, id, (c) => {
        if (c.resources.conditions.includes(condition)) return c;

        const r = c.resources;
        const newConditions = [...r.conditions, condition];

        // Se condição incapacitante, marca ações como usadas
        let newEconomy = r.actionEconomy;
        if (INCAPACITATING_CONDITIONS.includes(condition)) {
          newEconomy = {
            ...newEconomy,
            action: true,
            bonusAction: true,
            reaction: true,
          };
        }

        return {
          ...c,
          resources: {
            ...r,
            conditions: newConditions,
            actionEconomy: newEconomy,
          },
        };
      }),
    })),

  removeCondition: (id, condition) =>
    set((s) => ({
      combatants: updateCombatant(s.combatants, id, (c) =>
        updateResources(c, (r) => ({
          ...r,
          conditions: r.conditions.filter((cond) => cond !== condition),
        })),
      ),
    })),

  // ─── Recursos Customizados ─────────────────────────────

  useCustomResource: (id, resourceId, amount = 1) =>
    set((s) => ({
      combatants: updateCombatant(s.combatants, id, (c) =>
        updateResources(c, (r) => ({
          ...r,
          customResources: r.customResources.map((cr) =>
            cr.id === resourceId
              ? { ...cr, current: Math.max(0, cr.current - amount) }
              : cr,
          ),
        })),
      ),
    })),

  // ─── Turno ─────────────────────────────────────────────

  nextTurn: () =>
    set((s) => {
      if (s.combatants.length === 0) return s;

      // Reseta action economy do combatente atual (exceto reaction)
      const currentId = s.combatants[s.activeIndex]?.id;
      let updated = currentId
        ? updateCombatant(s.combatants, currentId, (c) =>
            updateResources(c, (r) => ({
              ...r,
              actionEconomy: {
                ...DEFAULT_ACTION_ECONOMY,
                movementMax: r.actionEconomy.movementMax,
                reaction: r.actionEconomy.reaction, // NÃO reseta reação
              },
            })),
          )
        : s.combatants;

      // Desativa turno atual
      updated = updated.map((c) => ({ ...c, isActive: false }));

      // Avança índice
      let nextIndex = s.activeIndex + 1;
      let newRound = s.round;
      if (nextIndex >= updated.length) {
        nextIndex = 0;
        newRound = s.round + 1;
        // Nova rodada: reseta reactions de todos
        updated = updated.map((c) =>
          updateResources(c, (r) => ({
            ...r,
            actionEconomy: {
              ...DEFAULT_ACTION_ECONOMY,
              movementMax: r.actionEconomy.movementMax,
            },
          })),
        );
      }

      // Pula mortos
      let attempts = 0;
      while (updated[nextIndex]?.isDead && attempts < updated.length) {
        nextIndex = (nextIndex + 1) % updated.length;
        if (nextIndex === 0) {
          newRound++;
          updated = updated.map((c) =>
            updateResources(c, (r) => ({
              ...r,
              actionEconomy: {
                ...DEFAULT_ACTION_ECONOMY,
                movementMax: r.actionEconomy.movementMax,
              },
            })),
          );
        }
        attempts++;
      }

      // Ativa próximo
      updated = updated.map((c, i) => ({
        ...c,
        isActive: i === nextIndex,
      }));

      return {
        combatants: updated,
        activeIndex: nextIndex,
        round: newRound,
      };
    }),

  nextRound: () =>
    set((s) => {
      // Incrementa round, reseta TODOS os action economies (incluindo reactions)
      const updated = s.combatants.map((c, i) => ({
        ...c,
        isActive: i === 0,
        resources: {
          ...c.resources,
          actionEconomy: {
            ...DEFAULT_ACTION_ECONOMY,
            movementMax: c.resources.actionEconomy.movementMax,
          },
        },
      }));
      return {
        combatants: updated,
        round: s.round + 1,
        activeIndex: 0,
      };
    }),

  endCombat: () => {
    set({
      combatants: [],
      round: 0,
      activeIndex: 0,
    });
    // Suggest phase change after combat ends
    const ps = usePhaseStore.getState();
    if (ps.current.type === "combat") {
      ps.openModal();
    }
  },
}));
