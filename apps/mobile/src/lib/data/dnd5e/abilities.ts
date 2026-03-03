// Re-export constants from @questboard/constants
export {
  ABILITY_LABELS,
  ABILITY_SHORT_LABELS,
  ABILITY_ORDER,
  STANDARD_ARRAY,
  POINT_BUY_COSTS,
  POINT_BUY_TOTAL,
  POINT_BUY_MIN,
  POINT_BUY_MAX,
} from "@questboard/constants";

// Re-export utility functions from @questboard/utils
export {
  getModifier,
  formatModifier,
  roll4d6DropLowest,
  computeHP,
  computeBaseAC,
  computeInitiative,
} from "@questboard/utils";

// ── Point-buy helpers (wrappers using package constants) ──

import type { AbilityKey } from "@questboard/types";
import {
  ABILITY_ORDER,
  POINT_BUY_COSTS,
  POINT_BUY_TOTAL,
} from "@questboard/constants";
import {
  getPointBuyCost as _getPointBuyCost,
  getPointsRemaining as _getPointsRemaining,
} from "@questboard/utils";

export function getPointBuyCost(
  scores: Record<AbilityKey, number>,
): number {
  return _getPointBuyCost(scores, POINT_BUY_COSTS, ABILITY_ORDER);
}

export function getPointsRemaining(
  scores: Record<AbilityKey, number>,
): number {
  return _getPointsRemaining(scores, POINT_BUY_TOTAL, POINT_BUY_COSTS, ABILITY_ORDER);
}
