import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { NPC_GENERATOR_PROMPT } from "@/lib/ai-prompts";

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY não configurada no servidor" },
      { status: 500 },
    );
  }

  const { prompt } = await req.json();
  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "Prompt é obrigatório" }, { status: 400 });
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: NPC_GENERATOR_PROMPT,
    prompt: `Gere um NPC de D&D 5e baseado nesta descrição: "${prompt}"`,
    maxOutputTokens: 4096,
    temperature: 0.8,
  });

  return result.toTextStreamResponse();
}
