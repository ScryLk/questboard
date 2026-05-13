// ── HTTP API: Dashboard agregado da campanha ──
//
// Espelha apps/api/src/modules/campaign/dashboard.service.ts. Retorna
// totals, próxima sessão, story progress, sessões recentes, e o card
// condicional ao role (userCharacter ou gmPanel).

import { apiRequest } from "./api-client";
import {
  dashboardDtoSchema,
  type DashboardDto,
} from "@questboard/validators";

export function getCampaignDashboard(campaignId: string): Promise<DashboardDto> {
  return apiRequest<DashboardDto>(`/campaigns/${campaignId}/dashboard`).then(
    // Validação runtime — front não confia cegamente no servidor.
    (raw) => dashboardDtoSchema.parse(raw),
  );
}
