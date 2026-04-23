import type { FullCharacter } from "../../lib/character-types";
import type { GameAbility, GameSystem } from "../../types/ability";
import { buildDnd5eAbilities } from "./dnd5e";
import { buildCocAbilities } from "./coc";

const GENERIC_ADAPTER = (_char: FullCharacter): GameAbility[] => [];

const ADAPTERS: Record<GameSystem, (char: FullCharacter) => GameAbility[]> = {
  dnd5e: buildDnd5eAbilities,
  coc: buildCocAbilities,
  generic: GENERIC_ADAPTER,
};

export function buildAbilities(char: FullCharacter): GameAbility[] {
  const system = (char.system || "dnd5e") as GameSystem;
  return (ADAPTERS[system] ?? ADAPTERS.generic)(char);
}
