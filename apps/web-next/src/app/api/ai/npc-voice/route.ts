import type { NpcConversationProfile, PlayerConversationContext, GeminiVoiceResult } from "@/lib/npc-conversation-types";
import { buildNpcSystemPrompt } from "@/lib/npc-conversation-engine";

interface VoiceRequestBody {
  audioBase64: string;
  mimeType: string;
  npcName: string;
  profile: NpcConversationProfile;
  context: PlayerConversationContext;
  conversationHistory: Array<{ role: "player" | "npc"; text: string }>;
}

const FALLBACK_RESULT: GeminiVoiceResult = {
  playerText: "[áudio não reconhecido]",
  playerEmotion: "NEUTRAL",
  playerVolume: "NORMAL",
  playerPace: "NORMAL",
  emotionIntensity: 0,
  npcResponse: "Hmm... Não entendi bem o que disseste.",
  reputationDelta: 0,
};

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY não configurada no servidor" },
      { status: 500 },
    );
  }

  const body: VoiceRequestBody = await req.json();

  const systemInstruction = buildNpcSystemPrompt(
    body.profile,
    body.context,
    body.npcName,
  );

  const historyText = body.conversationHistory
    .map((m) => `${m.role === "player" ? "Jogador" : body.npcName}: ${m.text}`)
    .join("\n");

  const prompt = `${systemInstruction}

=== HISTÓRICO RECENTE ===
${historyText || "(início da conversa)"}

=== INSTRUÇÃO ===
O jogador acabou de falar com você (áudio acima).

Analise o áudio e responda APENAS com um JSON válido, sem markdown, sem
explicações fora do JSON:

{
  "playerText":       "transcrição exata do que o jogador disse em pt-BR",
  "playerEmotion":    "ANGRY|FEARFUL|SAD|JOYFUL|CALM|NERVOUS|DESPERATE|CONTEMPTUOUS|NEUTRAL",
  "playerVolume":     "WHISPERING|NORMAL|LOUD",
  "playerPace":       "SLOW|NORMAL|FAST",
  "emotionIntensity": 0.0,
  "npcResponse":      "sua resposta em personagem (2-4 frases, pt-BR)",
  "reputationDelta":  0
}

Regras para npcResponse:
- Reaja ao TOM da voz, não apenas ao conteúdo. Se o jogador está gritando,
  o NPC percebe. Se está sussurrando e nervoso, o NPC nota.
- reputationDelta: -15 a +15 conforme o impacto emocional da fala.
- Nunca saia do personagem. Nunca mencione "IA", "transcrição" ou "áudio".`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

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
              parts: [
                {
                  inlineData: {
                    mimeType: body.mimeType,
                    data: body.audioBase64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
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
      console.error("[npc-voice] Gemini error:", res.status, errorText);
      return Response.json(FALLBACK_RESULT);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    try {
      const parsed = JSON.parse(text) as GeminiVoiceResult;
      parsed.reputationDelta = Math.max(
        -15,
        Math.min(15, parsed.reputationDelta ?? 0),
      );
      parsed.emotionIntensity = Math.max(
        0,
        Math.min(1, parsed.emotionIntensity ?? 0),
      );
      return Response.json(parsed);
    } catch {
      console.error("[npc-voice] JSON parse error:", text);
      return Response.json(FALLBACK_RESULT);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      console.error("[npc-voice] Gemini timeout (10s)");
      return Response.json({
        ...FALLBACK_RESULT,
        npcResponse: "[O NPC parece distraído e não responde agora]",
      });
    }
    console.error("[npc-voice] Unexpected error:", err);
    return Response.json(FALLBACK_RESULT);
  }
}
