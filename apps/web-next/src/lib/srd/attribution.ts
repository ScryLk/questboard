// ── CC-BY 4.0 attribution helpers ──
//
// Conteúdo do SRD 5.1 da Wizards of the Coast é licenciado sob
// Creative Commons Attribution 4.0. Toda exibição de conteúdo SRD
// precisa carregar atribuição visível.

import type { SrdAttribution } from "@/types/srd";

/** Texto canônico de atribuição ao SRD 5.1. */
export const SRD_5_1_ATTRIBUTION_TEXT =
  'Este compêndio inclui material do System Reference Document 5.1 ("SRD 5.1") da Wizards of the Coast LLC, disponível em https://dnd.wizards.com/resources/systems-reference-document. SRD 5.1 está licenciado sob a Creative Commons Attribution 4.0 International License (https://creativecommons.org/licenses/by/4.0/legalcode).';

/** URL canônica da licença CC-BY 4.0. */
export const CC_BY_4_URL =
  "https://creativecommons.org/licenses/by/4.0/legalcode";

/** URL canônica do SRD 5.1. */
export const SRD_5_1_URL =
  "https://dnd.wizards.com/resources/systems-reference-document";

/** Constrói atribuição padrão de SRD oficial pra um conteúdo. */
export function makeOfficialSrdAttribution(reference?: string): SrdAttribution {
  return {
    source: "OFFICIAL_SRD",
    text: "SRD 5.1 · CC-BY 4.0",
    reference,
  };
}
