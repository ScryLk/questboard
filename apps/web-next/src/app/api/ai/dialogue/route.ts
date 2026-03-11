import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { DIALOGUE_PROMPT } from "@/lib/ai-prompts";
import type { DialogueRequest } from "@/lib/ai-types";

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY não configurada no servidor" },
      { status: 500 },
    );
  }

  const body: DialogueRequest = await req.json();

  const contextParts: string[] = [];
  contextParts.push(`Você é ${body.npcName}, um(a) ${body.creatureType}.`);

  if (body.personality) {
    const p = body.personality;
    contextParts.push(`Personalidade: ${p.personalityTraits.join("; ")}`);
    contextParts.push(`Motivação: ${p.motivation}`);
    if (p.voiceNotes) contextParts.push(`Voz/tom: ${p.voiceNotes}`);
    if (p.mannerisms) contextParts.push(`Maneirismos: ${p.mannerisms}`);
  }

  if (body.combatActive) {
    contextParts.push("CONTEXTO: Vocês estão em combate!");
  }

  if (body.situation) {
    contextParts.push(`Situação: ${body.situation}`);
  }

  if (body.recentMessages.length > 0) {
    contextParts.push("Conversa recente:");
    for (const msg of body.recentMessages.slice(-5)) {
      contextParts.push(`  ${msg.sender}: ${msg.content}`);
    }
  }

  contextParts.push("Agora responda como o NPC:");

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: DIALOGUE_PROMPT,
    prompt: contextParts.join("\n"),
    maxOutputTokens: 512,
    temperature: 0.9,
  });

  return result.toTextStreamResponse();
}
