import { NextResponse } from "next/server";

const MODEL = "gemini-2.5-flash-image";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY não configurada no servidor" },
      { status: 500 },
    );
  }

  const body = await req.json();
  const { prompt, objectName, category } = body as {
    prompt: string;
    objectName: string;
    category: "scenery" | "item" | "npc" | "creature";
  };

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
    return NextResponse.json(
      { error: "Prompt é obrigatório (min 5 chars)" },
      { status: 400 },
    );
  }

  const contextHint =
    category === "item"
      ? "item viewed from a slight angle, suitable for inventory display"
      : category === "npc"
        ? "character portrait token for a fantasy RPG, top-down view suitable for a battle map"
        : category === "creature"
          ? "monster/creature token for a fantasy RPG, top-down view suitable for a battle map"
          : "top-down map decoration, suitable for a battle map";

  const fullPrompt = `Create a pixel art sprite for a fantasy RPG object.
OBJECT: "${objectName || "Unknown"}"
DESCRIPTION: ${prompt}
CONTEXT: ${contextHint}
STYLE: 32x32 pixel art, transparent background, dark fantasy aesthetic, no anti-aliasing, clean edges, single object centered`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[AI Sprite] Gemini error:", data);
      return NextResponse.json(
        { error: "Falha ao gerar sprite via Gemini" },
        { status: 502 },
      );
    }

    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData,
    );

    if (!imagePart?.inlineData?.data) {
      return NextResponse.json(
        { error: "Gemini não retornou imagem" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType ?? "image/png",
    });
  } catch (err) {
    console.error("[AI Sprite] Error:", err);
    return NextResponse.json(
      { error: "Erro interno ao gerar sprite" },
      { status: 500 },
    );
  }
}
