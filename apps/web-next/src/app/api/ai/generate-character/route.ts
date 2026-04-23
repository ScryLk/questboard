import { NextResponse } from "next/server";
import {
  aiCharacterGenerationRequestSchema,
  aiCharacterGenerationResultSchema,
  type AICharacterNarrativeContext,
} from "@questboard/validators";

const MODEL = "gemini-2.5-flash";

const ROLES = ["ally", "villain", "neutral", "merchant", "quest", "boss"];
const DISPOSITIONS = ["hostile", "neutral", "friendly", "undead"];
const CREATURE_TYPES = [
  "humanoide",
  "besta",
  "morto-vivo",
  "aberracao",
  "constructo",
  "dragao",
  "elementar",
  "fada",
  "fiend",
  "gigante",
  "monstruosidade",
  "planta",
];

function buildGeminiSchema(category: "npc" | "creature") {
  const statsProps: Record<string, unknown> = {
    hp: { type: "INTEGER" },
    maxHp: { type: "INTEGER" },
    ac: { type: "INTEGER" },
    speed: { type: "INTEGER" },
    str: { type: "INTEGER" },
    dex: { type: "INTEGER" },
    con: { type: "INTEGER" },
    int: { type: "INTEGER" },
    wis: { type: "INTEGER" },
    cha: { type: "INTEGER" },
  };
  if (category === "creature") {
    statsProps.cr = { type: "STRING" };
  }

  const props: Record<string, unknown> = {
    name: { type: "STRING" },
    title: { type: "STRING" },
    description: { type: "STRING" },
    role: { type: "STRING", enum: ROLES },
    disposition: { type: "STRING", enum: DISPOSITIONS },
    stats: {
      type: "OBJECT",
      properties: statsProps,
      required: ["hp", "maxHp", "ac", "speed", "str", "dex", "con", "int", "wis", "cha"],
    },
    dialogueGreeting: { type: "STRING" },
    dialogueNotes: { type: "STRING" },
  };

  if (category === "creature") {
    (props as { creatureType?: unknown }).creatureType = {
      type: "STRING",
      enum: CREATURE_TYPES,
    };
  }

  return {
    type: "OBJECT",
    properties: props,
    required: ["name", "description", "disposition", "stats"],
  };
}

function buildPrompt(
  description: string,
  category: "npc" | "creature",
  narrativeContext?: AICharacterNarrativeContext,
) {
  const contextBlock = narrativeContext
    ? `
CONTEXTO NARRATIVO (o personagem será vinculado a este evento da campanha):
- Título do evento: "${narrativeContext.nodeTitle}"
${narrativeContext.nodeDescription ? `- Descrição: ${narrativeContext.nodeDescription}` : ""}
${narrativeContext.nodeGmNotes ? `- Notas do Mestre: ${narrativeContext.nodeGmNotes}` : ""}

Use esse contexto pra dar MOTIVAÇÃO coerente — o personagem deve ter relação direta com o conflito, NPCs ou local do evento. A personalidade e o tom das falas devem refletir o clima do evento (tragédia, intriga, combate, mistério, etc).
`
    : "";

  const categoryBlock =
    category === "creature"
      ? `TIPO: Criatura (monstro ou besta, não humanoide civilizado).
- Use stats agressivos (HP alto se grande, CR compatível com o ambiente).
- "disposition" geralmente "hostile" (ou "undead" se for morto-vivo).
- "role" geralmente "villain" ou "boss" ou "neutral" (ambiente selvagem).
- Inclua "creatureType" (besta/dragao/morto-vivo/etc).
- "description" foca em aparência física ameaçadora + comportamento.`
      : `TIPO: NPC (humanoide civilizado com personalidade e diálogo).
- Stats mais modestos (HP comum, CR baixo ou omitido).
- "disposition" depende do papel (amigável/neutro/hostil).
- "role" reflete função social (comerciante, aliado, vilão, missão).
- "dialogueGreeting" é uma frase que o NPC diz ao encontrar o jogador — em 1ª pessoa, no tom do personagem.
- "dialogueNotes" são instruções pro Mestre interpretar (tom de voz, maneirismos, segredos que esconde).`;

  return `Você é um assistente de criação de personagens para campanhas de RPG de mesa no estilo D&D 5e. Gere um ${category === "creature" ? "monstro/criatura" : "NPC"} completo e coerente.

${categoryBlock}

DESCRIÇÃO DO USUÁRIO (em pt-BR):
"${description}"
${contextBlock}

REGRAS DE GERAÇÃO:
- Nome: único, evocativo, 1-3 palavras. Se for NPC humanoide, pode ter sobrenome ou título (ex: "Elara Ventonegro", "Irmão Tadek").
- Título opcional: papel ou epíteto curto (ex: "O Mercador Cego", "Caçadora de Lobos").
- Descrição: 2-4 frases sobre aparência, personalidade e motivação. Zero exposição de mecânicas (nada de "tem HP alto").
- Stats: equilibrados pro conceito. Humano comum tem STR/DEX/CON ~10, INT/WIS/CHA 10-14. Veterano +1/+2 em combate. Criaturas grandes STR 16-20.
  - HP: maxHp igual ao hp; humano comum 10-20, veterano 30-60, elite/chefe 80-150, criatura grande 50-200.
  - AC: 10 (sem armadura), 12 (couro), 14 (cota), 16 (placas), 18+ (especial).
  - speed: humano 30, rápido 40, lento 20, voador 60.
  - cr (só criatura): "1/4", "1/2", "1", "2", ..., "10".
- dialogueGreeting e dialogueNotes: só pra NPC (deixe vazio pra criatura).

Retorne APENAS o JSON no schema definido.`;
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY não configurada no servidor" },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = aiCharacterGenerationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Requisição inválida", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { prompt, category, narrativeContext } = parsed.data;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: buildPrompt(prompt, category, narrativeContext) }] },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: buildGeminiSchema(category),
          temperature: 0.9,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[AI Character] Gemini error:", JSON.stringify(data));
      return NextResponse.json(
        { error: "Falha ao gerar personagem via Gemini" },
        { status: 502 },
      );
    }

    const textPart = data.candidates?.[0]?.content?.parts?.find(
      (p: { text?: string }) => typeof p.text === "string",
    );
    const rawText: string | undefined = textPart?.text;
    if (!rawText) {
      return NextResponse.json(
        { error: "Gemini não retornou conteúdo" },
        { status: 502 },
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawText);
    } catch {
      console.error("[AI Character] Invalid JSON:", rawText.slice(0, 500));
      return NextResponse.json(
        { error: "Gemini retornou JSON inválido" },
        { status: 502 },
      );
    }

    const validated = aiCharacterGenerationResultSchema.safeParse(parsedJson);
    if (!validated.success) {
      console.error("[AI Character] Schema mismatch:", validated.error.flatten());
      return NextResponse.json(
        { error: "Resposta do Gemini fora do schema esperado" },
        { status: 502 },
      );
    }

    return NextResponse.json({ character: validated.data, category });
  } catch (err) {
    console.error("[AI Character] Error:", err);
    return NextResponse.json(
      { error: "Erro interno ao gerar personagem" },
      { status: 500 },
    );
  }
}
