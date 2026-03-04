import { z } from "zod";
import { DiceRollMode } from "../types/enums";

export const DICE_FORMULA_REGEX = /^(\d+d\d+([kd][hl]\d+)?([!><=]\d+)?([+-]\d+)?)(([+-]\d+d\d+([kd][hl]\d+)?([!><=]\d+)?([+-]\d+)?)|([+-]\d+))*$/;

export const rollDiceSchema = z.object({
  formula: z.string().min(1).max(100),
  context: z.string().max(200).optional(),
  mode: z.nativeEnum(DiceRollMode).default(DiceRollMode.PUBLIC),
});

export type RollDiceInput = z.infer<typeof rollDiceSchema>;
