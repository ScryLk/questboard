import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { TACTICAL_PROMPT } from "@/lib/ai-prompts";
import { buildBattlefieldContext } from "@/lib/ai-utils";
import type { TacticalRequest } from "@/lib/ai-types";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY não configurada no servidor" },
      { status: 500 },
    );
  }
  const google = createGoogleGenerativeAI({ apiKey });

  const body: TacticalRequest = await req.json();

  const battlefieldContext = buildBattlefieldContext(body);

  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    system: TACTICAL_PROMPT,
    prompt: battlefieldContext,
    maxOutputTokens: 1024,
    temperature: 0.3,
  });

  // Parse JSON response
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: "Resposta da IA não contém JSON válido" },
        { status: 500 },
      );
    }
    const suggestion = JSON.parse(jsonMatch[0]);
    return Response.json(suggestion);
  } catch {
    return Response.json(
      { error: "Falha ao processar resposta da IA" },
      { status: 500 },
    );
  }
}
