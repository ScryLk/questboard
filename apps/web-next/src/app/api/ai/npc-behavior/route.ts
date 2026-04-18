import type { BehaviorType, ParticipantRole, BehaviorPhase, AiBehaviorParams } from "@/lib/npc-behavior-types";

interface BehaviorRequestBody {
  situation: string;
  npcCount: number;
  npcNames: string[];
  mapContext?: string;
}

const FALLBACK: AiBehaviorParams = {
  behaviorType: "PANIC",
  config: { speed: 3, chaosCoefficient: 0.5, separationRadius: 1.5 },
  participantRoles: [],
  narratorMessage: "Os NPCs reagem à situação.",
  reasoning: "Fallback padrão — IA indisponível.",
};

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY não configurada no servidor" },
      { status: 500 },
    );
  }

  const body: BehaviorRequestBody = await req.json();

  const prompt = `Você é o motor de IA de um VTT (Virtual Tabletop) de RPG. O GM descreveu uma situação e você deve gerar parâmetros de comportamento de grupo para NPCs.

=== SITUAÇÃO ===
${body.situation}

=== CONTEXTO ===
Número de NPCs: ${body.npcCount}
Nomes: ${body.npcNames.join(", ")}
${body.mapContext ? `Mapa: ${body.mapContext}` : ""}

=== TIPOS DE COMPORTAMENTO DISPONÍVEIS ===
IDLE — Micro-movimentos sutis (guarda parado, NPC esperando)
CROWD — Boids — agrupam e circulam (mercado, taverna)
PATROL — Seguem waypoints em rota
GUARD — Vigiam um ponto fixo
FLEE — Fogem de um alvo/ponto
PANIC — Dispersão caótica (explosão, monstro)
RIOT — Tumulto: líderes avançam, membros seguem
FOLLOW — Seguem um líder/jogador
SEARCH — Percorrem o mapa procurando algo

=== PAPÉIS DOS PARTICIPANTES ===
LEADER — Lidera o grupo (relevante para RIOT/FOLLOW)
MEMBER — Segue o líder / comportamento padrão
OUTLIER — Comportamento errático/independente

=== INSTRUÇÃO ===
Responda APENAS com JSON válido:
{
  "behaviorType": "TIPO",
  "config": {
    "speed": 0.3-4.0,
    "chaosCoefficient": 0.0-1.0,
    "separationRadius": 0.5-3.0,
    "target": { "x": 0, "y": 0 }
  },
  "phases": [
    { "type": "TIPO", "durationMs": 5000 }
  ],
  "participantRoles": [
    { "index": 0, "role": "LEADER" }
  ],
  "narratorMessage": "Texto narrativo curto para exibir ao GM (pt-BR, 1-2 frases)",
  "reasoning": "Explicação curta de por que escolheu esses parâmetros"
}

Regras:
- "phases" é opcional. Use para situações que evoluem (ex: PANIC → FLEE).
- "target" é opcional. Omita se não faz sentido para o tipo.
- "participantRoles" é opcional. Se presente, "index" refere-se à posição no array de NPCs.
- speed: IDLE=0.3, CROWD=1, PATROL=2, GUARD=0.5, FLEE=3.5, PANIC=3, RIOT=2.5, FOLLOW=2, SEARCH=2
- chaosCoefficient: 0=ordenado, 1=caótico
- Seja criativo na narratorMessage — ela será exibida ao GM como flavor text.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 512,
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error("[npc-behavior] Gemini error:", res.status, errorText);
      return Response.json(FALLBACK);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    try {
      const parsed = JSON.parse(text) as AiBehaviorParams;
      parsed.config.speed = Math.max(0.1, Math.min(5, parsed.config.speed ?? 2));
      parsed.config.chaosCoefficient = Math.max(0, Math.min(1, parsed.config.chaosCoefficient ?? 0.3));
      parsed.config.separationRadius = Math.max(0.3, Math.min(5, parsed.config.separationRadius ?? 1.5));
      return Response.json(parsed);
    } catch {
      console.error("[npc-behavior] JSON parse error:", text);
      return Response.json(FALLBACK);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      console.error("[npc-behavior] Gemini timeout (12s)");
    } else {
      console.error("[npc-behavior] Unexpected error:", err);
    }
    return Response.json(FALLBACK);
  }
}
