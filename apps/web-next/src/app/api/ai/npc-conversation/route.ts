import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { NpcConversationDialogueRequest } from "@/lib/npc-conversation-types";
import { buildNpcSystemPrompt } from "@/lib/npc-conversation-engine";

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY não configurada no servidor" },
      { status: 500 },
    );
  }

  const body: NpcConversationDialogueRequest = await req.json();

  const systemPrompt = buildNpcSystemPrompt(
    body.profile,
    body.context,
    body.npcName,
  );

  const messages = body.conversationHistory.map((m) => ({
    role: m.role === "player" ? "user" as const : "assistant" as const,
    content: m.text,
  }));

  messages.push({ role: "user", content: body.playerMessage });

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: systemPrompt,
    messages,
    maxOutputTokens: 512,
    temperature: 0.9,
  });

  return result.toTextStreamResponse();
}
