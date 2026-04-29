// ── Atribuição cosmic-horror ──
//
// Sistema "Horror Investigativo (d100)" do QuestBoard. Inspirado em
// mecânicas d100 clássicas (não copiamos texto, tabelas ou nomes
// comerciais). Bestiário usa entidades de domínio público de
// H.P. Lovecraft (†1937, obras pré-1928 nos EUA).

import type { SrdAttribution } from "@/types/srd";

export const COSMIC_HORROR_ATTRIBUTION_TEXT =
  "Sistema \"Horror Investigativo\" desenvolvido pelo QuestBoard. " +
  "Não afiliado a Chaosium Inc. ou Call of Cthulhu®. " +
  "Inspirado em obras de H.P. Lovecraft (1890–1937), em domínio público.";

/** Para entidades e feitiços derivados de obras Lovecraft. */
export function makeLovecraftAttribution(reference: string): SrdAttribution {
  return {
    source: "OFFICIAL_SRD",
    text: "H.P. Lovecraft · Domínio público",
    reference,
  };
}

/** Para conteúdo original do QuestBoard (ocupações, NPCs genéricos, estados). */
export function makeQuestboardOriginalAttribution(
  reference?: string,
): SrdAttribution {
  return {
    source: "OFFICIAL_SRD",
    text: "QuestBoard · Sistema Horror Investigativo",
    reference,
  };
}
